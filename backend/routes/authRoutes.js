const express = require('express');
const router = express.Router();
// Use require() and no .js extension for local imports
const { signup, login, logout, refreshToken, getUserProfile } = require('../controllers/authController');
const { protectRoute } = require('../middleware/authMiddleware'); 

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes (require valid access token via protectRoute middleware)
router.post('/logout', protectRoute, logout); 
router.get('/me', protectRoute, getUserProfile); 

// Export the router using module.exports
module.exports = router;
