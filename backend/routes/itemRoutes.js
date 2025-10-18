// routes/itemRoutes.js
const express = require('express');
const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  adjustStock,
  getInventoryValuation,
  deleteItem
} = require('../controllers/itemController');
const { protectRoute } = require('../middleware/authMiddleware');

const router = express.Router();

// All item routes require authentication
router.use(protectRoute);

// POST /api/item/create - Create a new item
router.post('/create', createItem);

// GET /api/item - Get all items for user's company
// Query parameters: ?stockFilter=low&search=xyz&sortBy=price-high
router.get('/', getAllItems);

// GET /api/item/valuation - Get inventory valuation summary
// Query parameters: ?lowStockThreshold=10
router.get('/valuation', getInventoryValuation);

// GET /api/item/:itemId - Get single item by ID
router.get('/:itemId', getItemById);

// PUT /api/item/:itemId - Update item details
router.put('/:itemId', updateItem);

// POST /api/item/:itemId/adjust-stock - Adjust stock manually
router.post('/:itemId/adjust-stock', adjustStock);

// DELETE /api/item/:itemId - Soft delete item
router.delete('/:itemId', deleteItem);

module.exports = router;