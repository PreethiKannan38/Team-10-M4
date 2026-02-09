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
import _ from 'lodash';
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
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Canvas';
mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
})
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
app.get('/health', (req, res) => {
  res.send('Backend is alive');
});

// Serve static files from the frontend app
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../frontend/dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
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
      return;
    }

    // Debounce factory for each document
    if (!global.saveDebouncers) global.saveDebouncers = new Map();

    if (!global.saveDebouncers.has(cleanDocName)) {
      const debouncedSave = _.debounce(async (serializedState) => {
        try {
          console.log(`[Yjs] Saving state for "${cleanDocName}" (${serializedState.length} bytes)`);
          await Canvas.findOneAndUpdate(
            { canvasId: cleanDocName },
            { documentState: Buffer.from(serializedState) },
            { upsert: true, new: true, timestamps: true }
          );
          console.log(`[Yjs] State saved for "${cleanDocName}"`);
        } catch (err) {
          console.error(`[Yjs] Error saving document ${cleanDocName}:`, err);
        }
      }, 800); // 800ms debounce
      global.saveDebouncers.set(cleanDocName, debouncedSave);
    }

    // Capture state immediately, but debounce the DB write
    const update = Y.encodeStateAsUpdate(doc);
    if (update.length < 10) return;

    const saver = global.saveDebouncers.get(cleanDocName);
    saver(update);
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
