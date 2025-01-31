const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const FAILED_LOGIN_LIMIT = 5; // Maximum allowed failed attempts
const LOCK_TIME = 15 * 60 * 1000; // Lock for 15 minutes

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check if the account is locked
    if (user.isLocked()) {
      return res.status(403).json({
        message: 'Account is temporarily locked. Please try again later.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed login attempts
      user.failedAttempts += 1;

      if (user.failedAttempts >= FAILED_LOGIN_LIMIT) {
        user.lockUntil = Date.now() + LOCK_TIME; // Lock account temporarily
      }

      await user.save();
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Reset failed attempts and lock status on successful login
    user.failedAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // Generate JWT token and include role in the payload
    const token = jwt.sign(
      { id: user._id, username, role: user.role },  // Include 'role' in JWT payload
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // Send the token and role in the response
    res.status(200).json({
      token,
      role: user.role  // Include 'role' in the response
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

module.exports = { login };