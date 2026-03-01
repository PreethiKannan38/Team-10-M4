import dotenv from 'dotenv';
dotenv.config();

console.log('--- Environment Check ---');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
if (!process.env.JWT_SECRET) {
  console.log('WARNING: JWT_SECRET is missing from process.env');
}
console.log('-------------------------');

import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import mongoose from 'mongoose';
import cors from 'cors';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const Y = require('yjs');
const { setupWSConnection, setPersistence } = require('y-websocket/bin/utils');
import Canvas from './models/Canvas.js';
import Event from './models/Event.js';
import authRoutes from './routes/authRoutes.js';
import canvasRoutes from './routes/canvasRoutes.js';
import snapshotRoutes from './routes/snapshotRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/canvas', canvasRoutes);
app.use('/api/snapshots', snapshotRoutes);

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/Canvas';
mongoose.connect(mongoURI)
  .then(async () => {
    console.log(`MongoDB Connected: ${mongoURI}`);
    console.log(`Database Name: ${mongoose.connection.name}`);

    // Diagnostic check
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    const canvasCount = await mongoose.connection.db.collection('canvases').countDocuments();
    console.log(`--- DB Diagnostics ---`);
    console.log(`Users in DB: ${userCount}`);
    console.log(`Canvases in DB: ${canvasCount}`);
    console.log(`----------------------`);
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

// Health Endpoint
app.get('/', (req, res) => {
  res.send('Backend is alive');
});

// ----------------------------------------------------
// Yjs Persistence Logic
// ----------------------------------------------------
const docsLoading = new Set();

setPersistence({
  bindState: async (docName, doc) => {
    const cleanDocName = docName.startsWith('/') ? docName.slice(1) : docName;
    try {
      docsLoading.add(cleanDocName);
      console.log(`[Yjs] [Lock] Locked ${cleanDocName} for loading...`);
      console.log(`[Yjs] Loading state for room: "${cleanDocName}" (original: "${docName}")`);

      const savedCanvas = await Canvas.findOne({ canvasId: cleanDocName });

      // --- TIMELINE LOGGING (US1) ---
      // Batch state logger: Instead of saving every granular operation, we debounce/throttle
      // and save full state snapshots. This improves UI replay performance drastically.
      if (!doc._hasEventLogger) {
        let batchTimeout = null;
        let isFirstEvent = true;
        let lastSaveTime = 0;

        const saveBatchEvent = async (docState) => {
          try {
            await Event.create({
              canvasId: cleanDocName,
              update: Buffer.from(docState),
              type: 'state-batch'
            });
            console.log(`[EventLog] Saved batch state snapshot for ${cleanDocName}`);
          } catch (err) {
            console.error(`[EventLog] Error saving batch update for ${cleanDocName}:`, err);
          }
        };

        doc.on('update', async (update, origin) => {
          if (isFirstEvent) {
            isFirstEvent = false;
            lastSaveTime = Date.now();
            const docState = Y.encodeStateAsUpdate(doc);
            saveBatchEvent(docState);
            return;
          }

          // Throttle saves to max 4 times per second (250ms) to create smooth animation
          const now = Date.now();
          if (now - lastSaveTime > 250) {
            lastSaveTime = now;
            const docState = Y.encodeStateAsUpdate(doc);
            saveBatchEvent(docState);
          } else {
            // Also debounce to ensure the absolute final state is captured after drawing stops
            clearTimeout(batchTimeout);
            batchTimeout = setTimeout(() => {
              lastSaveTime = Date.now();
              const docState = Y.encodeStateAsUpdate(doc);
              saveBatchEvent(docState);
            }, 300);
          }
        });

        doc._hasEventLogger = true;
        console.log(`[EventLog] Attached batched timeline logger to room: ${cleanDocName}`);
      }

      if (savedCanvas && savedCanvas.documentState) {
        console.log(`[Yjs] Found state for ${cleanDocName} (${savedCanvas.documentState.length} bytes)`);
        Y.applyUpdate(doc, new Uint8Array(savedCanvas.documentState));
      } else {
        console.log(`[Yjs] No existing state found in DB for "${cleanDocName}". Initializing default state...`);
        // Ensure the doc has at least one layer so the client doesn't see "0 layers"
        doc.transact(() => {
          const yLayers = doc.getArray('layers');
          if (yLayers.length === 0) {
            yLayers.push([{
              id: 'default-layer',
              name: 'Background',
              visible: true,
              locked: false,
              opacity: 1.0,
              objects: [],
              metadata: {},
            }]);
          }
        });
      }


    } catch (err) {
      console.error(`[Yjs] Error loading document ${docName}:`, err);
    } finally {
      docsLoading.delete(cleanDocName);
      console.log(`[Yjs] [Lock] Unlocked ${cleanDocName} (Load complete)`);
    }
  },
  writeState: async (docName, doc) => {
    const cleanDocName = docName.startsWith('/') ? docName.slice(1) : docName;

    // CRITICAL: Prevent overwrite if we are still loading the initial state
    if (docsLoading.has(cleanDocName)) {
      console.log(`[Yjs] Skipping write for ${cleanDocName}: Document is still loading.`);
      return;
    }

    // CRITICAL (US4/Rollback): Prevent server from saving the dying future state 
    // over our freshly restored database state when connections are forcibly closed
    if (doc._isRolledBack) {
      console.log(`[Yjs] Skipping write for ${cleanDocName}: Document was rolled back!`);
      return;
    }

    try {
      const update = Y.encodeStateAsUpdate(doc);

      if (update.length < 10) {
        // Skip saving if it's just an empty/minimal update to avoid unnecessary DB calls
        return;
      }

      console.log(`[Yjs] Saving state for "${cleanDocName}" (${update.length} bytes)`);
      console.log(`[Yjs] Calling Canvas.findOneAndUpdate({ canvasId: "${cleanDocName}" }, { documentState: ... }, { upsert: true, new: true })`);
      const result = await Canvas.findOneAndUpdate(
        { canvasId: cleanDocName },
        {
          documentState: Buffer.from(update),
        },
        { upsert: true, new: true, timestamps: true }
      );

      if (result) {
        console.log(`[Yjs] State saved for "${cleanDocName}". Last modified: ${result.updatedAt}`);
      } else {
        console.log(`[Yjs] WARNING: Failed to save state for "${cleanDocName}"`);
      }
    } catch (err) {
      console.error(`[Yjs] Error saving document ${docName}:`, err);
    }
  }
});

// ----------------------------------------------------
// HTTP + WebSocket Server Setup
// ----------------------------------------------------
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req);
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint ready`);
});
