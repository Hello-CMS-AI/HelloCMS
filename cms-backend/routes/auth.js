const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/authmiddleware'); // Import authMiddleware

// POST /api/auth/login - Login endpoint
router.post('/login', loginLimiter, login);

// Example of a protected route
// GET /api/auth/protected - Protected route that requires valid token
router.get('/protected', authMiddleware, (req, res) => {
  res.status(200).json({ message: `Hello, ${req.user.username}. You are authenticated!` });
});

module.exports = router;
