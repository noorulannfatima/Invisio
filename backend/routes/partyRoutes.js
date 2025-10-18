// routes/partyRoutes.js
const express = require('express');
const {
  createParty,
  getAllParties,
  getPartyById,
  updateParty,
  deleteParty
} = require('../controllers/partyController');
const { protectRoute } = require('../middleware/authMiddleware');

const router = express.Router();

// All party routes require authentication
router.use(protectRoute);

// POST /api/party/create - Create a new party
router.post('/create', createParty);

// GET /api/party - Get all parties for user's company
// Query parameters: ?type=Customer&search=xyz
router.get('/', getAllParties);

// GET /api/party/:partyId - Get single party by ID
router.get('/:partyId', getPartyById);

// PUT /api/party/:partyId - Update party details
router.put('/:partyId', updateParty);

// DELETE /api/party/:partyId - Soft delete party
router.delete('/:partyId', deleteParty);

module.exports = router;