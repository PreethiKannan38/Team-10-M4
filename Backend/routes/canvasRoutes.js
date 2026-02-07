import express from 'express';
import { createCanvas, getCanvas, getMyCanvases, inviteUser, updateCanvasName, deleteCanvas, toggleFavorite, removeMember } from '../controllers/canvasController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createCanvas);
router.get('/my-canvases', protect, getMyCanvases);
router.get('/my-invitations', protect, getMyInvitations);
router.get('/:id', protect, getCanvas);
router.post('/:id/invite', protect, inviteUser);
router.delete('/:id/members/:userId', protect, removeMember);
router.put('/:id/name', protect, updateCanvasName);
router.delete('/:id', protect, deleteCanvas);
router.put('/:id/favorite', protect, toggleFavorite);
router.put('/invitation/:id/accept', protect, acceptInvitation);
router.put('/invitation/:id/reject', protect, rejectInvitation);

export default router;
