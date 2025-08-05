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
        console.log('Decoded userId:', req.userId);
        const user = await User.findById(req.userId).select('-password');
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
