const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Ensure this is the correct path to your User model

// Middleware to check if the user is an admin
const isAdmin = async (req, res, next) => {
  try {
    // Extract token from request headers (Authorization Bearer token)
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is set in your environment variables

    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    req.user = user; // Add user info to the request for future use
    next(); // Allow the action (delete, edit) to proceed
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized access' });
  }
};

module.exports = isAdmin;
