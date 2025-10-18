// routes/reportRoutes.js
const express = require('express');
const {
  getSalesReport,
  getPurchaseReport,
  getGSTReport,
  getProfitLossReport,
  getStockSummary,
  getPartyLedger
} = require('../controllers/reportController');
const { protectRoute } = require('../middleware/authMiddleware');

const router = express.Router();

// All report routes require authentication
router.use(protectRoute);

// GET /api/reports/sales - Sales report with daily/weekly/monthly breakdown
// Query parameters: ?period=monthly&startDate=2024-01-01&endDate=2024-12-31&partyId=1
router.get('/sales', getSalesReport);

// GET /api/reports/purchase - Purchase report showing incoming bills and suppliers
// Query parameters: ?startDate=2024-01-01&endDate=2024-12-31&supplierId=1
router.get('/purchase', getPurchaseReport);

// GET /api/reports/gst - GST report (GSTR-1 & GSTR-3B ready data)
// Query parameters: ?startDate=2024-01-01&endDate=2024-12-31
router.get('/gst', getGSTReport);

// GET /api/reports/profit-loss - Profit & Loss statement
// Query parameters: ?startDate=2024-01-01&endDate=2024-12-31
router.get('/profit-loss', getProfitLossReport);

// GET /api/reports/stock-summary - Real-time stock valuation with alerts
// Query parameters: ?lowStockThreshold=10
router.get('/stock-summary', getStockSummary);

// GET /api/reports/party-ledger - Complete party statement and transaction history
// Query parameters: ?partyId=1&startDate=2024-01-01&endDate=2024-12-31
router.get('/party-ledger', getPartyLedger);

module.exports = router;