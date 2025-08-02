const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    try {
        req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
        next();
    } catch {
        res.sendStatus(401);
    }
}

router.get('/', authMiddleware, async (req, res) => {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
});

module.exports = router;
