const rateLimit = require('express-rate-limit');

// Create a rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many login attempts. Please try again after 15 minutes.',
    });
  },
});


module.exports = { loginLimiter };
