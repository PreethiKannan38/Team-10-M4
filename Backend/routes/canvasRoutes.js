import express from 'express';
import canvasController from '../controllers/canvasController.js';
const { createCanvas, getCanvas, getMyCanvases, inviteUser, updateCanvasName, deleteCanvas, toggleFavorite, removeMember, branchCanvas, getRelatedBranches } = canvasController;
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createCanvas);
router.get('/my-canvases', protect, getMyCanvases);
router.get('/:id', protect, getCanvas);
router.post('/:id/invite', protect, inviteUser);
router.delete('/:id/members/:userId', protect, removeMember);
router.put('/:id/name', protect, updateCanvasName);
router.delete('/:id', protect, deleteCanvas);
router.put('/:id/favorite', protect, toggleFavorite);
router.post('/:id/branch', protect, branchCanvas);
router.get('/:id/branches', protect, getRelatedBranches);

export default router;
