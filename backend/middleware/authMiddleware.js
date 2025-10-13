// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in cookies or Authorization header
    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user still exists
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['Password_Hash'] }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists'
        });
      }

      // Check if user is deleted
      if (user.is_deleted) {
        return res.status(403).json({
          success: false,
          message: 'Account has been deactivated'
        });
      }

      // Attach user to request object
      req.user = {
        userId: user.User_ID,
        username: user.Username,
        email: user.Email
      };

      next();

    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

