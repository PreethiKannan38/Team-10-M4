import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import * as Y from 'yjs';
import { setupWSConnection, setPersistence } from 'y-websocket/bin/utils';
import Canvas from './models/Canvas.js';
import authRoutes from './routes/authRoutes.js';
import canvasRoutes from './routes/canvasRoutes.js';
import snapshotRoutes from './routes/snapshotRoutes.js';

dotenv.config();

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
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/Canvas')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Health Endpoint
app.get('/', (req, res) => {
  res.send('Backend is alive');
});

// ----------------------------------------------------
// Yjs Persistence Logic
// ----------------------------------------------------
setPersistence({
  bindState: async (docName, doc) => {
    try {
      const savedCanvas = await Canvas.findOne({ canvasId: docName });
      if (savedCanvas && savedCanvas.documentState) {
        Y.applyUpdate(doc, savedCanvas.documentState);
      }
    } catch (err) {
      console.error(`Error loading document ${docName}:`, err);
    }
  },
  writeState: async (docName, doc) => {
    try {
      // Encode the state as an update
      const update = Y.encodeStateAsUpdate(doc);
      await Canvas.findOneAndUpdate(
        { canvasId: docName },
        {
          documentState: Buffer.from(update),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Error saving document ${docName}:`, err);
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
