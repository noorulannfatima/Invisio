// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  logout,
  getUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getUser);

module.exports = router;