import Canvas from '../models/Canvas.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
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
            groupId: canvasId, // Root of a new family
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

        // --- GUEST BYPASS ---
        if (req.params.id.startsWith('guest-')) {
            return res.json(canvas);
        }

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, login required for this canvas' });
        }

        // Check permissions (Owner or Member)
        const isOwner = canvas.owner?._id.equals(req.user._id);
        const isMember = canvas.members.some(m => m.user?._id.equals(req.user._id));

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
            $and: [
                {
                    $or: [
                        { owner: req.user._id },
                        { 'members.user': req.user._id }
                    ]
                },
                {
                    // A canvas is a "Master" if it has no parentId
                    $or: [
                        { parentId: { $exists: false } },
                        { parentId: null },
                        { parentId: "" }
                    ]
                }
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

        // --- GUEST BYPASS ---
        // For non-guest canvases, ensure ownership
        if (!req.params.id.startsWith('guest-')) {
            if (!req.user || (canvas.owner && canvas.owner.toString() !== req.user._id.toString())) {
                return res.status(403).json({ message: 'Not authorized to delete this canvas' });
            }
        }

        // If it's a master canvas (no parentId), perform cascading delete
        if (!canvas.parentId) {
            console.log(`[API] Master canvas deletion detected. Performing cascading delete for groupId: ${canvas.groupId}`);
            await Canvas.deleteMany({ groupId: canvas.groupId || canvas.canvasId });
            res.json({ message: 'Master canvas and all its branches deleted successfully' });
        } else {
            console.log(`[API] Branch deletion detected for canvasId: ${req.params.id}`);
            await Canvas.deleteOne({ canvasId: req.params.id });
            res.json({ message: 'Branch deleted successfully' });
        }
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

    console.log(`[API] Attempting to update canvas name. ID: ${id}, New Name: ${name}`);

    try {
        const canvas = await Canvas.findOne({ canvasId: id });

        if (!canvas) {
            console.log(`[API] Canvas ${id} not found in DB`);
            return res.status(404).json({ message: 'Canvas not found' });
        }

        // --- GUEST BYPASS ---
        // Allow anyone to rename a guest canvas
        if (!id.startsWith('guest-')) {
            if (!req.user) {
                return res.status(401).json({ message: 'Login required to rename this canvas' });
            }

            // Only owner can update name
            const isOwner = canvas.owner && canvas.owner.toString() === req.user._id.toString();
            if (!isOwner) {
                return res.status(403).json({ message: 'Only owner can update canvas name' });
            }
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

// @desc    Branch a canvas
// @route   POST /api/canvas/:id/branch
// @access  Private
export const branchCanvas = async (req, res) => {
    try {
        const sourceCanvas = await Canvas.findOne({ canvasId: req.params.id });

        if (!sourceCanvas) {
            return res.status(404).json({ message: 'Source canvas not found' });
        }

        const newCanvasId = Math.random().toString(36).substring(2, 9);
        const finalId = req.params.id.startsWith('guest-') ? `guest-${newCanvasId}` : newCanvasId;

        const branchedCanvas = await Canvas.create({
            canvasId: finalId,
            name: `Branch of ${sourceCanvas.name}`,
            owner: req.user?._id || undefined, // Set owner if token exists, else undefined
            members: sourceCanvas.members,
            documentState: sourceCanvas.documentState,
            groupId: sourceCanvas.groupId || sourceCanvas.canvasId,
            parentId: sourceCanvas.canvasId,
        });

        res.status(201).json(branchedCanvas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all branches in a group
// @route   GET /api/canvas/:id/branches
// @access  Private
export const getRelatedBranches = async (req, res) => {
    console.log('>>> [API ENTRY] getRelatedBranches called for ID:', req.params.id);
    try {
        const canvas = await Canvas.findOne({ canvasId: req.params.id }).lean();
        if (!canvas) {
            return res.status(404).json({ message: 'Canvas not found' });
        }

        // The absolute master ID is the groupId, or the canvasId itself if no groupId exists
        const rootMasterId = canvas.groupId || (canvas.parentId ? canvas.parentId : canvas.canvasId);

        let branches = await Canvas.find({
            $or: [
                { groupId: rootMasterId },
                { canvasId: rootMasterId }
            ]
        })
            .select('canvasId name updatedAt createdAt owner groupId parentId')
            .sort({ createdAt: 1 })
            .lean();

        // Map through branches to add isMaster flag and ensure self is included if missing
        let processedBranches = branches.map(b => ({
            ...b,
            createdAt: b.createdAt || b.updatedAt || new Date(), // Robust fallback
            isMaster: (!b.parentId || b.parentId === "")
        }));

        console.log(`[DEBUG] getRelatedBranches for ${req.params.id}: returning ${processedBranches.length} branches`);
        processedBranches.forEach(pb => {
            console.log(`  - Branch: ${pb.name}, isMaster: ${pb.isMaster}, createdAt: ${pb.createdAt}`);
        });

        // Ensure the source/master canvas itself is included in the list (fallback)
        const hasSelf = processedBranches.some(b => b.canvasId === canvas.canvasId);
        if (!hasSelf) {
            processedBranches.push({
                canvasId: canvas.canvasId,
                name: canvas.name,
                updatedAt: canvas.updatedAt,
                createdAt: canvas.createdAt,
                owner: canvas.owner,
                groupId: canvas.groupId,
                parentId: canvas.parentId,
                isMaster: (!canvas.parentId || canvas.parentId === "")
            });
        }

        res.json(processedBranches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// US1: Get timeline events for replay
export const getTimeline = async (req, res) => {
    try {
        const { id: canvasId } = req.params;

        // Check if canvas exists
        const canvas = await Canvas.findOne({ canvasId });
        if (!canvas) {
            return res.status(404).json({ message: 'Canvas not found' });
        }

        // Fetch all events for this canvas, sorted by time
        const events = await Event.find({ canvasId }).sort({ createdAt: 1 });

        res.status(200).json({
            canvasId,
            totalEvents: events.length,
            events: events.map(e => ({
                id: e._id,
                update: e.update.toString('base64'), // Send as base64 for JSON transport
                timestamp: e.createdAt,
                type: e.type
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default {
    createCanvas,
    getCanvas,
    getMyCanvases,
    inviteUser,
    deleteCanvas,
    toggleFavorite,
    updateCanvasName,
    removeMember,
    branchCanvas,
    getRelatedBranches,
    getTimeline
};
