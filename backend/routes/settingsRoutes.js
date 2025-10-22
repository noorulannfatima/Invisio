// routes/settingsRoutes.js
const express = require('express');
const { protectRoute } = require('../middleware/authMiddleware');
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
  getCompanyDetails,
  updateCompanyDetails,
  deleteCompany,
  getCompanyStats
} = require('../controllers/settingsController');

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// ========== USER PROFILE ROUTES ==========

/**
 * GET /api/settings/profile
 * Get current user profile
 */
router.get('/profile', getUserProfile);

/**
 * PUT /api/settings/profile
 * Update user profile (email, mobile, username)
 * Body: { Email?, Mobile_Number?, Username? }
 */
router.put('/profile', updateUserProfile);

/**
 * PUT /api/settings/change-password
 * Change user password
 * Body: { oldPassword, newPassword, confirmPassword }
 */
router.put('/change-password', changePassword);

/**
 * DELETE /api/settings/delete-account
 * Delete user account (soft delete)
 * Body: { password }
 */
router.delete('/delete-account', deleteUserAccount);

// ========== COMPANY SETTINGS ROUTES ==========

/**
 * GET /api/settings/company
 * Get company details
 */
router.get('/company', getCompanyDetails);

/**
 * PUT /api/settings/company
 * Update company details (name, address, email)
 * Body: { Name?, Address?, Email? }
 */
router.put('/company', updateCompanyDetails);

/**
 * DELETE /api/settings/company
 * Delete company (soft delete)
 * Body: { password }
 */
router.delete('/company', deleteCompany);

/**
 * GET /api/settings/company/stats
 * Get company statistics (parties, transactions, expenses count)
 */
router.get('/company/stats', getCompanyStats);

module.exports = router;