// routes/transactionRoutes.js
const express = require('express');
const {
  createInvoice,
  createPurchaseBill,
  getInvoiceById,
  getAllInvoices,
  getGSTSummary,
  deleteTransaction,
  updateTransactionStatus
} = require('../controllers/transactionController');
const { protectRoute } = require('../middleware/authMiddleware');

const router = express.Router();

// All transaction routes require authentication
router.use(protectRoute);

// POST /api/transaction/invoice - Create sale invoice
router.post('/invoice', createInvoice);

// POST /api/transaction/bill - Create purchase bill
router.post('/bill', createPurchaseBill);

// GET /api/transaction - Get all invoices/bills with filters
// Query parameters: ?startDate=2024-01-01&endDate=2024-12-31&Party_ID=1&Type=Sale&Status=Completed&sortBy=amount-high
router.get('/', getAllInvoices);

// GET /api/transaction/gst-summary - Get GST summary
// Query parameters: ?startDate=2024-01-01&endDate=2024-12-31
router.get('/gst-summary', getGSTSummary);

// GET /api/transaction/:transactionId - Get single transaction with line items
router.get('/:transactionId', getInvoiceById);

// DELETE /api/transaction/:transactionId - Soft delete transaction (reverses stock)
router.delete('/:transactionId', deleteTransaction);


// Update transaction status
router.patch('/:transactionId/status', updateTransactionStatus);

module.exports = router;