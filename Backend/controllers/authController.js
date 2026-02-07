import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
    try {
        let { name, username, email, password } = req.body;
        email = email.toLowerCase().trim();
        
        if (!username) {
            username = email.split('@')[0] + Math.floor(Math.random() * 1000);
        }
        username = username.toLowerCase().trim();

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email or username already exists' });
        }

        const user = await User.create({ name, username, email, password });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;
        email = email.toLowerCase().trim();

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Get user data
export const getMe = async (req, res) => {
    const user = {
        _id: req.user._id,
        name: req.user.name,
        username: req.user.username,
        email: req.user.email,
    };
    res.status(200).json(user);
};

// @desc    Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { name, username } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            if (username && username !== user.username) {
                const exists = await User.findOne({ username: username.toLowerCase(), _id: { $ne: user._id } });
                if (exists) return res.status(400).json({ message: 'Username is taken' });
                user.username = username.toLowerCase().trim();
            }
            user.name = name || user.name;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                username: updatedUser.username,
                email: updatedUser.email,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update password
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);
        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword;
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};