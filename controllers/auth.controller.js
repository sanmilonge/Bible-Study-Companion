require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const user = await User.create({ name, email, password });
        const token = generateToken(user._id);
        res.json({ access_token: token });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = generateToken(user._id);
        res.json({ access_token: token });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
