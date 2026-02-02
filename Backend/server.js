import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import * as Y from 'yjs';
import { setupWSConnection, setPersistence } from 'y-websocket/bin/utils';
import { Canvas } from './models/Canvas.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hacktide_canvas')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

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
      // Encode the state as an update (or full state)
      const update = Y.encodeStateAsUpdate(doc);
      await Canvas.findOneAndUpdate(
        { canvasId: docName },
        {
          documentState: Buffer.from(update),
          lastModified: new Date()
        },
        { upsert: true, new: true } // Save options
      );
    } catch (err) {
      console.error(`Error saving document ${docName}:`, err);
    }
  }
});

// ----------------------------------------------------
// API Routes
// ----------------------------------------------------
app.get('/', (req, res) => {
  res.send('Canvas Backend is Running');
});

// Create a new session
app.post('/api/canvas/create', async (req, res) => {
  try {
    const canvasId = Math.random().toString(36).substring(2, 9); // Simple ID generation
    const newCanvas = new Canvas({ canvasId });
    await newCanvas.save();
    res.json({ canvasId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join/Validate a session
app.get('/api/canvas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const canvas = await Canvas.findOne({ canvasId: id });
    if (!canvas) {
      return res.status(404).json({ error: 'Canvas not found' });
    }
    res.json({ canvasId: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ----------------------------------------------------
// HTTP + WebSocket Server Setup
// ----------------------------------------------------
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Bind y-websocket logic
wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req);
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket endpoint ready`);
});
