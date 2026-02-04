import mongoose from 'mongoose';

const snapshotSchema = new mongoose.Schema({
    canvas: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Canvas',
        required: true,
    },
    name: {
        type: String,
        default: 'Untitled Version',
    },
    documentState: {
        type: Buffer,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });

const Snapshot = mongoose.model('Snapshot', snapshotSchema);

export default Snapshot;
