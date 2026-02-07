import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
    canvas: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Canvas',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    role: {
        type: String,
        enum: ['viewer', 'editor'],
        default: 'viewer',
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    }
}, { timestamps: true });

const Invitation = mongoose.model('Invitation', invitationSchema);

export default Invitation;
