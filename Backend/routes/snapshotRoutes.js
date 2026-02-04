import express from 'express';
import { createSnapshot, getSnapshots, restoreSnapshot } from '../controllers/snapshotController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:canvasId', protect, createSnapshot);
router.get('/:canvasId', protect, getSnapshots);
router.post('/:canvasId/restore/:snapshotId', protect, restoreSnapshot);

export default router;
