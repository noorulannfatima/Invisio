// routes/expenseRoutes.js
// routes/expenseRoutes.js
const express = require('express');
const {
  createExpense,
  getAllExpenses,
  getExpenseById,
  getExpensesReport,
  getExpensesByCategory,
  assignExpenseToVendor,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');
const { protectRoute } = require('../middleware/authMiddleware');

const router = express.Router();

// All expense routes require authentication
router.use(protectRoute);

// POST /api/expense/create - Create a new expense
router.post('/create', createExpense);

// GET /api/expense - Get all expenses with filters
// Query parameters: ?startDate=2024-01-01&endDate=2024-12-31&Category=Rent&Party_ID=1&Payment_Mode=Cash&sortBy=amount-high
router.get('/', getAllExpenses);

// GET /api/expense/report - Get monthly expense report
// Query parameters: ?year=2024&month=10
router.get('/report', getExpensesReport);

// GET /api/expense/by-category - Get expenses grouped by category
// Query parameters: ?startDate=2024-01-01&endDate=2024-12-31
router.get('/by-category', getExpensesByCategory);

// GET /api/expense/:expenseId - Get single expense by ID
router.get('/:expenseId', getExpenseById);

// PUT /api/expense/:expenseId - Update expense details
router.put('/:expenseId', updateExpense);

// POST /api/expense/:expenseId/assign-vendor - Assign expense to vendor (Party)
router.post('/:expenseId/assign-vendor', assignExpenseToVendor);

// DELETE /api/expense/:expenseId - Soft delete expense
router.delete('/:expenseId', deleteExpense);

module.exports = router;