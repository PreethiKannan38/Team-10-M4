import Canvas from '../models/Canvas.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid'; // We might need to install uuid or just use random string

// @desc    Create a new canvas
// @route   POST /api/canvas/create
// @access  Private
export const createCanvas = async (req, res) => {
    const { name } = req.body;

    try {
        const canvasId = Math.random().toString(36).substring(2, 9); // Simple ID generation

        const canvas = await Canvas.create({
            canvasId,
            name: name || 'Untitled Canvas',
            owner: req.user._id,
        });

        res.status(201).json(canvas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join/Get canvas metadata
// @route   GET /api/canvas/:id
// @access  Private
export const getCanvas = async (req, res) => {
    try {
        const canvas = await Canvas.findOne({ canvasId: req.params.id })
            .populate('owner', 'name email')
            .populate('members.user', 'name email');

        if (!canvas) {
            return res.status(404).json({ message: 'Canvas not found' });
        }

        // Check permissions (Owner or Member)
        const isOwner = canvas.owner._id.equals(req.user._id);
        const isMember = canvas.members.some(m => m.user._id.equals(req.user._id));

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Not authorized to view this canvas' });
        }

        res.json(canvas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all canvases for current user
// @route   GET /api/canvas/my-canvases
// @access  Private
export const getMyCanvases = async (req, res) => {
    try {
        const canvases = await Canvas.find({
            $or: [
                { owner: req.user._id },
                { 'members.user': req.user._id }
            ]
        }).sort({ updatedAt: -1 });
        res.json(canvases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Invite user to canvas
// @route   POST /api/canvas/:id/invite
// @access  Private (Owner only)
export const inviteUser = async (req, res) => {
    const { email, role } = req.body; // role: 'editor' or 'viewer'

    try {
        const canvas = await Canvas.findOne({ canvasId: req.params.id });

        if (!canvas) {
            return res.status(404).json({ message: 'Canvas not found' });
        }

        // Only owner can invite
        if (!canvas.owner.equals(req.user._id)) {
            return res.status(403).json({ message: 'Only owner can invite collaborators' });
        }

        const userToInvite = await User.findOne({ email });
        if (!userToInvite) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (canvas.owner.equals(userToInvite._id)) {
            return res.status(400).json({ message: 'User is already the owner' });
        }

        // Check if already a member
        const alreadyMember = canvas.members.some(m => m.user.equals(userToInvite._id));
        if (alreadyMember) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        canvas.members.push({
            user: userToInvite._id,
            role: role || 'viewer'
        });

        await canvas.save();

        res.json({ message: 'User invited successfully', canvas });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a canvas
// @route   DELETE /api/canvas/:id
// @access  Private (Owner only)
export const deleteCanvas = async (req, res) => {
    try {
        const canvas = await Canvas.findOne({ canvasId: req.params.id });

        if (!canvas) {
            return res.status(404).json({ message: 'Canvas not found' });
        }

        // Only owner can delete
        if (canvas.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only owner can delete this canvas' });
        }

        await Canvas.deleteOne({ canvasId: req.params.id });

        res.json({ message: 'Canvas deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle favorite status
// @route   PUT /api/canvas/:id/favorite
// @access  Private
export const toggleFavorite = async (req, res) => {
    try {
        const canvas = await Canvas.findOne({ canvasId: req.params.id });
        if (!canvas) return res.status(404).json({ message: 'Canvas not found' });

        // Ensure user is owner or member
        const isOwner = canvas.owner.toString() === req.user._id.toString();
        const isMember = canvas.members.some(m => {
            const memberId = m.user._id ? m.user._id.toString() : m.user.toString();
            return memberId === req.user._id.toString();
        });

        if (!isOwner && !isMember) return res.status(403).json({ message: 'Not authorized' });

        // For simplicity, we'll store favorites in a metadata field or just toggle a boolean if we add it to schema
        // Let's assume we add a 'isFavorite' field to the schema or just use metadata
        canvas.isFavorite = !canvas.isFavorite;
        await canvas.save();
        res.json(canvas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update canvas name
// @route   PUT /api/canvas/:id/name
// @access  Private
export const updateCanvasName = async (req, res) => {
    const { name } = req.body;
    const { id } = req.params;

    console.log(`[API] Attempting to update canvas name. ID: ${id}, New Name: ${name}, User: ${req.user._id}`);

    try {
        const canvas = await Canvas.findOne({ canvasId: id });

        if (!canvas) {
            console.log(`[API] Canvas ${id} not found in DB`);
            return res.status(404).json({ message: 'Canvas not found' });
        }

        // Only owner can update name
        // Use toString() to be safe with ObjectId comparison if needed, or stick to .equals
        const isOwner = canvas.owner.toString() === req.user._id.toString();

        console.log(`[API] Ownership Check - Owner: ${canvas.owner}, Requestor: ${req.user._id}, Match: ${isOwner}`);

        if (!isOwner) {
            return res.status(403).json({ message: 'Only owner can update canvas name' });
        }

        canvas.name = name;
        const updatedCanvas = await canvas.save();

        console.log(`[API] Canvas name updated successfully: ${updatedCanvas.name}`);
        res.json(updatedCanvas);
    } catch (error) {
        console.error('[API] Update Canvas Name Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove member from canvas
// @route   DELETE /api/canvas/:id/members/:userId
// @access  Private (Owner only)
export const removeMember = async (req, res) => {
    try {
        const canvas = await Canvas.findOne({ canvasId: req.params.id });

        if (!canvas) {
            return res.status(404).json({ message: 'Canvas not found' });
        }

        // Only owner can remove members
        if (canvas.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only owner can remove collaborators' });
        }

        // Filter out the member
        canvas.members = canvas.members.filter(m => m.user.toString() !== req.params.userId);
        await canvas.save();

        res.json({ message: 'Member removed successfully', canvas });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
