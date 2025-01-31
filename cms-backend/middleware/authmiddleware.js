const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract Bearer token
  if (!token) {
    return res.status(401).json({ message: 'No token provided. Authorization denied.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.user = decoded; // Attach decoded data to the request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
};

module.exports = verifyToken;
