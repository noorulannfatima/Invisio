// controllers/expenseController.js
// controllers/expenseController.js
const { Company, Party, Expense } = require('../models');
const { Op } = require('sequelize');

// Create a new expense
const createExpense = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { Date, Category, Amount, Description, Payment_Mode, Party_ID } = req.body;

    // Validate input
    if (!Category || Amount === undefined) {
      return res.status(400).json({ 
        message: "Category and Amount are required" 
      });
    }

    // Validate category
    if (Category.length < 2 || Category.length > 100) {
      return res.status(400).json({ message: "Category must be between 2 and 100 characters" });
    }

    // Validate amount
    if (isNaN(Amount) || Amount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company to record expenses" });
    }

    // Validate party if provided (optional vendor assignment)
    let party = null;
    if (Party_ID) {
      party = await Party.findOne({
        where: { Party_ID, Company_ID: company.Company_ID, is_deleted: false }
      });

      if (!party) {
        return res.status(404).json({ message: "Party not found" });
      }
    }

    // Create expense
    const expense = await Expense.create({
      Company_ID: company.Company_ID,
      Party_ID: Party_ID || null,
      Date: Date || new Date().toISOString().split('T')[0],
      Category,
      Amount: parseFloat(Amount),
      Description: Description || null,
      Payment_Mode: Payment_Mode || null,
      Is_Deleted: false
    });

    res.status(201).json({
      message: "Expense created successfully",
      expense: {
        Expense_ID: expense.Expense_ID,
        Company_ID: expense.Company_ID,
        Party_ID: expense.Party_ID,
        Party_Name: party ? party.Name : null,
        Date: expense.Date,
        Category: expense.Category,
        Amount: parseFloat(expense.Amount),
        Description: expense.Description,
        Payment_Mode: expense.Payment_Mode,
        createdAt: expense.createdAt
      }
    });
  } catch (error) {
    console.log("Error in createExpense controller", error.message);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// Get all expenses with filters
const getAllExpenses = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { startDate, endDate, Category, Party_ID, Payment_Mode, sortBy } = req.query;

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Build filters
    const where = {
      Company_ID: company.Company_ID,
      Is_Deleted: false
    };

    // Filter by date range
    if (startDate || endDate) {
      where.Date = {};
      if (startDate) where.Date[Op.gte] = startDate;
      if (endDate) where.Date[Op.lte] = endDate;
    }

    // Filter by category
    if (Category) {
      where.Category = { [Op.iLike]: `%${Category}%` };
    }

    // Filter by party
    if (Party_ID) {
      where.Party_ID = Party_ID;
    }

    // Filter by payment mode
    if (Payment_Mode) {
      where.Payment_Mode = { [Op.iLike]: `%${Payment_Mode}%` };
    }

    // Determine sort order
    let order = [['Date', 'DESC']];
    if (sortBy === 'amount-high') {
      order = [['Amount', 'DESC']];
    } else if (sortBy === 'amount-low') {
      order = [['Amount', 'ASC']];
    } else if (sortBy === 'oldest') {
      order = [['Date', 'ASC']];
    } else if (sortBy === 'category') {
      order = [['Category', 'ASC']];
    }

    const expenses = await Expense.findAll({
      where,
      include: [
        {
          model: Party,
          as: 'Vendor',
          attributes: ['Party_ID', 'Name'],
          required: false
        }
      ],
      order
    });

    res.json({
      count: expenses.length,
      expenses: expenses.map(exp => ({
        Expense_ID: exp.Expense_ID,
        Date: exp.Date,
        Category: exp.Category,
        Amount: parseFloat(exp.Amount),
        Description: exp.Description,
        Payment_Mode: exp.Payment_Mode,
        Vendor: exp.Vendor ? {
          Party_ID: exp.Vendor.Party_ID,
          Name: exp.Vendor.Name
        } : null,
        createdAt: exp.createdAt
      }))
    });
  } catch (error) {
    console.log("Error in getAllExpenses controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get single expense by ID
const getExpenseById = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { expenseId } = req.params;

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Find expense
    const expense = await Expense.findOne({
      where: {
        Expense_ID: expenseId,
        Company_ID: company.Company_ID,
        Is_Deleted: false
      },
      include: [
        {
          model: Party,
          as: 'Vendor',
          attributes: ['Party_ID', 'Name', 'Email', 'Mobile_Number', 'Address']
        }
      ]
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({
      Expense_ID: expense.Expense_ID,
      Company_ID: expense.Company_ID,
      Date: expense.Date,
      Category: expense.Category,
      Amount: parseFloat(expense.Amount),
      Description: expense.Description,
      Payment_Mode: expense.Payment_Mode,
      Vendor: expense.Vendor || null,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt
    });
  } catch (error) {
    console.log("Error in getExpenseById controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get expenses report by month
const getExpensesReport = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { year, month } = req.query;

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Validate year and month
    const currentYear = new Date().getFullYear();
    const reportYear = year ? parseInt(year) : currentYear;
    const reportMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    if (reportMonth < 1 || reportMonth > 12) {
      return res.status(400).json({ message: "Month must be between 1 and 12" });
    }

    if (reportYear < 2000 || reportYear > currentYear) {
      return res.status(400).json({ message: `Year must be between 2000 and ${currentYear}` });
    }

    // Build date range for the month
    const startOfMonth = new Date(reportYear, reportMonth - 1, 1).toISOString().split('T')[0];
    const endOfMonth = new Date(reportYear, reportMonth, 0).toISOString().split('T')[0];

    // Fetch expenses for the month
    const expenses = await Expense.findAll({
      where: {
        Company_ID: company.Company_ID,
        Is_Deleted: false,
        Date: {
          [Op.gte]: startOfMonth,
          [Op.lte]: endOfMonth
        }
      }
    });

    // Group by category
    const categoryBreakdown = {};
    let totalExpenses = 0;

    expenses.forEach(expense => {
      const category = expense.Category;
      const amount = parseFloat(expense.Amount);

      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = 0;
      }

      categoryBreakdown[category] += amount;
      totalExpenses += amount;
    });

    // Sort categories by amount (descending)
    const sortedCategories = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        Category: category,
        Amount: parseFloat(amount.toFixed(2)),
        Percentage: parseFloat(((amount / totalExpenses) * 100).toFixed(2))
      }));

    res.json({
      Report_Period: {
        Year: reportYear,
        Month: reportMonth,
        Month_Name: new Date(reportYear, reportMonth - 1).toLocaleDateString('en-US', { month: 'long' }),
        Start_Date: startOfMonth,
        End_Date: endOfMonth
      },
      Summary: {
        Total_Expenses: parseFloat(totalExpenses.toFixed(2)),
        Expense_Count: expenses.length,
        Category_Count: Object.keys(categoryBreakdown).length
      },
      Category_Breakdown: sortedCategories,
      Top_Categories: sortedCategories.slice(0, 5)
    });
  } catch (error) {
    console.log("Error in getExpensesReport controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get expenses by category
const getExpensesByCategory = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { startDate, endDate } = req.query;

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Build filters
    const where = {
      Company_ID: company.Company_ID,
      Is_Deleted: false
    };

    if (startDate || endDate) {
      where.Date = {};
      if (startDate) where.Date[Op.gte] = startDate;
      if (endDate) where.Date[Op.lte] = endDate;
    }

    // Fetch all expenses for the period
    const expenses = await Expense.findAll({
      where,
      attributes: ['Category', 'Amount'],
      raw: true
    });

    // Group by category
    const categoryData = {};

    expenses.forEach(expense => {
      if (!categoryData[expense.Category]) {
        categoryData[expense.Category] = {
          Category: expense.Category,
          Total: 0,
          Count: 0
        };
      }

      categoryData[expense.Category].Total += parseFloat(expense.Amount);
      categoryData[expense.Category].Count += 1;
    });

    const categories = Object.values(categoryData)
      .map(cat => ({
        Category: cat.Category,
        Total: parseFloat(cat.Total.toFixed(2)),
        Count: cat.Count,
        Average: parseFloat((cat.Total / cat.Count).toFixed(2))
      }))
      .sort((a, b) => b.Total - a.Total);

    res.json({
      Period: {
        Start_Date: startDate || 'N/A',
        End_Date: endDate || 'N/A'
      },
      Categories: categories,
      Total_Across_Categories: parseFloat(
        categories.reduce((sum, cat) => sum + cat.Total, 0).toFixed(2)
      )
    });
  } catch (error) {
    console.log("Error in getExpensesByCategory controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Assign expense to vendor (Party)
const assignExpenseToVendor = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { expenseId } = req.params;
    const { Party_ID } = req.body;

    // Validate input
    if (!Party_ID) {
      return res.status(400).json({ message: "Party_ID is required" });
    }

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Find expense
    const expense = await Expense.findOne({
      where: {
        Expense_ID: expenseId,
        Company_ID: company.Company_ID,
        Is_Deleted: false
      }
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Verify party exists and belongs to company
    const party = await Party.findOne({
      where: { Party_ID, Company_ID: company.Company_ID, is_deleted: false }
    });

    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    // Update expense with vendor
    expense.Party_ID = Party_ID;
    await expense.save();

    res.json({
      message: "Expense assigned to vendor successfully",
      expense: {
        Expense_ID: expense.Expense_ID,
        Category: expense.Category,
        Amount: parseFloat(expense.Amount),
        Date: expense.Date,
        Vendor: {
          Party_ID: party.Party_ID,
          Name: party.Name
        }
      }
    });
  } catch (error) {
    console.log("Error in assignExpenseToVendor controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { expenseId } = req.params;
    const { Date, Category, Amount, Description, Payment_Mode, Party_ID } = req.body;

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Find expense
    const expense = await Expense.findOne({
      where: {
        Expense_ID: expenseId,
        Company_ID: company.Company_ID,
        Is_Deleted: false
      }
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Update fields if provided
    if (Date !== undefined) {
      expense.Date = Date;
    }

    if (Category !== undefined) {
      if (Category.length < 2 || Category.length > 100) {
        return res.status(400).json({ message: "Category must be between 2 and 100 characters" });
      }
      expense.Category = Category;
    }

    if (Amount !== undefined) {
      if (isNaN(Amount) || Amount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
      expense.Amount = parseFloat(Amount);
    }

    if (Description !== undefined) {
      expense.Description = Description || null;
    }

    if (Payment_Mode !== undefined) {
      expense.Payment_Mode = Payment_Mode || null;
    }

    if (Party_ID !== undefined) {
      if (Party_ID) {
        const party = await Party.findOne({
          where: { Party_ID, Company_ID: company.Company_ID, is_deleted: false }
        });

        if (!party) {
          return res.status(404).json({ message: "Party not found" });
        }
      }
      expense.Party_ID = Party_ID || null;
    }

    await expense.save();

    res.json({
      message: "Expense updated successfully",
      expense: {
        Expense_ID: expense.Expense_ID,
        Company_ID: expense.Company_ID,
        Party_ID: expense.Party_ID,
        Date: expense.Date,
        Category: expense.Category,
        Amount: parseFloat(expense.Amount),
        Description: expense.Description,
        Payment_Mode: expense.Payment_Mode,
        updatedAt: expense.updatedAt
      }
    });
  } catch (error) {
    console.log("Error in updateExpense controller", error.message);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// Soft delete expense
const deleteExpense = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { expenseId } = req.params;

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Find expense
    const expense = await Expense.findOne({
      where: {
        Expense_ID: expenseId,
        Company_ID: company.Company_ID,
        Is_Deleted: false
      }
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Soft delete
    expense.Is_Deleted = true;
    await expense.save();

    res.json({
      message: "Expense deleted successfully",
      Expense_ID: expense.Expense_ID
    });
  } catch (error) {
    console.log("Error in deleteExpense controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  getExpensesReport,
  getExpensesByCategory,
  assignExpenseToVendor,
  updateExpense,
  deleteExpense
};