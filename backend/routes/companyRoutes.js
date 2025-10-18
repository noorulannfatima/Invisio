// routes/companyRoutes.js
const express = require('express');
const {
  createCompany,
  getMyCompany,
  updateCompany,
  deleteCompany
} = require('../controllers/companyController');
const { protectRoute } = require('../middleware/authMiddleware');

const router = express.Router();

// All company routes require authentication
router.use(protectRoute);

// POST /api/company/create - Create a new company
router.post('/create', createCompany);

// GET /api/company/me - Get logged-in user's company
router.get('/me', getMyCompany);

// PUT /api/company/update - Update company details
router.put('/update', updateCompany);

// DELETE /api/company/delete - Soft delete company
router.delete('/delete', deleteCompany);

module.exports = router;