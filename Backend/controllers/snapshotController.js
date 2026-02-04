import Snapshot from '../models/Snapshot.js';
import Canvas from '../models/Canvas.js';

// @desc    Create a snapshot of the current canvas state
// @route   POST /api/snapshots/:canvasId
// @access  Private (Owner/Editor)
export const createSnapshot = async (req, res) => {
    const { name } = req.body;
    const { canvasId } = req.params;

    try {
        const canvas = await Canvas.findOne({ canvasId });

        if (!canvas) {
            return res.status(404).json({ message: 'Canvas not found' });
        }

        // Check permissions (Owner or Member with Editor role)
        const isOwner = canvas.owner.equals(req.user._id);
        const isEditor = canvas.members.some(m => m.user.equals(req.user._id) && m.role === 'editor');

        if (!isOwner && !isEditor) {
            return res.status(403).json({ message: 'Not authorized to create snapshots' });
        }

        if (!canvas.documentState) {
            return res.status(400).json({ message: 'Canvas has no content to snapshot' });
        }

        const snapshot = await Snapshot.create({
            canvas: canvas._id,
            name: name || `Version ${new Date().toISOString()}`,
            documentState: canvas.documentState,
            createdBy: req.user._id
        });

        res.status(201).json(snapshot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all snapshots for a canvas
// @route   GET /api/snapshots/:canvasId
// @access  Private
export const getSnapshots = async (req, res) => {
    const { canvasId } = req.params;

    try {
        const canvas = await Canvas.findOne({ canvasId });
        if (!canvas) {
            return res.status(404).json({ message: 'Canvas not found' });
        }

        // Check view permissions
        const isOwner = canvas.owner.equals(req.user._id);
        const isMember = canvas.members.some(m => m.user.equals(req.user._id));

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Not authorized to view snapshots' });
        }

        const snapshots = await Snapshot.find({ canvas: canvas._id })
            .select('-documentState') // Exclude heavy binary data from list
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.json(snapshots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Restore a snapshot (Overwrite current canvas state)
// @route   POST /api/snapshots/:canvasId/restore/:snapshotId
// @access  Private (Owner only)
export const restoreSnapshot = async (req, res) => {
    const { canvasId, snapshotId } = req.params;

    try {
        const canvas = await Canvas.findOne({ canvasId });
        if (!canvas) {
            return res.status(404).json({ message: 'Canvas not found' });
        }

        if (!canvas.owner.equals(req.user._id)) {
            return res.status(403).json({ message: 'Only owner can restore snapshots' });
        }

        const snapshot = await Snapshot.findById(snapshotId);
        if (!snapshot) {
            return res.status(404).json({ message: 'Snapshot not found' });
        }

        // Update canvas state
        canvas.documentState = snapshot.documentState;
        await canvas.save();

        res.json({ message: 'Canvas restored to snapshot', snapshotName: snapshot.name });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
