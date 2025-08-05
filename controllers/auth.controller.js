//controllers/auth.controller.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Utility to generate JWT token
function generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Register controller
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const user = await User.create({ name, email, password });
        console.log('Registered user:', user._id, user.email);
        const token = generateToken(user._id);
        res.json({ access_token: token });
    } catch (e) {
        console.error('Register error:', e);
        res.status(500).json({ error: e.message });
    }
};

// Login controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate user and password
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user._id);
        res.json({ access_token: token });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// Get current user controller
exports.getMe = async (req, res) => {
    try {
        console.log('Decoded user:', req.user); // Should log the full object with id

        const user = await User.findById(req.user.id).select('-password'); // ✅ fixed here

        console.log('User record fetched:', user);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('GetMe error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ error: 'User not found' });

        const { name, email } = req.body;

        if (name) user.name = name;
        if (email) user.email = email;

        await user.save();

        res.json({
            message: 'Profile updated',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update password
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ error: 'User not found' });

        const { current_password, new_password } = req.body;

        const isMatch = await user.comparePassword(current_password);
        if (!isMatch) return res.status(400).json({ error: 'Incorrect current password' });

        user.password = new_password;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};