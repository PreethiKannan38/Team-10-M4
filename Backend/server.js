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
import * as Y from 'yjs';
import { setupWSConnection, setPersistence } from 'y-websocket/bin/utils';
import Canvas from './models/Canvas.js';
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
      console.log(`[Yjs] [Lock] SKIPPING SAVE for ${cleanDocName} - Load still in progress.`);
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
