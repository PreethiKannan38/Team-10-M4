import mongoose from 'mongoose';

const CanvasSchema = new mongoose.Schema({
  canvasId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  documentState: { 
    type: Buffer, // Binary data of the Yjs document
    required: false
  },
  lastModified: { 
    type: Date, 
    default: Date.now 
  }
});

export const Canvas = mongoose.model('Canvas', CanvasSchema);
