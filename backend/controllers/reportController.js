// controllers/reportController.js
const { Company, Party, Item, Transaction, TransactionLineItem, Expense } = require('../models');
const { Op, sequelize } = require('sequelize');

// Sales Report - Daily, weekly, monthly summary
const getSalesReport = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { period, startDate, endDate, partyId } = req.query; // period: daily, weekly, monthly

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
      Type: 'Sale',
      Is_Deleted: false,
      Status: 'Completed'
    };

    if (startDate || endDate) {
      where.Date = {};
      if (startDate) where.Date[Op.gte] = startDate;
      if (endDate) where.Date[Op.lte] = endDate;
    }

    if (partyId) {
      where.Party_ID = partyId;
    }

    const transactions = await Transaction.findAll({
      where,
      include: [
        {
          model: TransactionLineItem,
          as: 'Line_Items',
          attributes: ['Quantity', 'Rate', 'Line_Total']
        },
        {
          model: Party,
          as: 'Party',
          attributes: ['Party_ID', 'Name']
        }
      ]
    });

    let totalSales = 0;
    let totalQuantity = 0;
    let totalTransactions = 0;
    const dailyBreakdown = {};

    transactions.forEach(txn => {
      const saleAmount = parseFloat(txn.Total_Amount);
      totalSales += saleAmount;
      totalTransactions += 1;

      const dateKey = txn.Date;
      if (!dailyBreakdown[dateKey]) {
        dailyBreakdown[dateKey] = {
          Date: dateKey,
          Sales: 0,
          Quantity: 0,
          Transactions: 0,
          Average_Transaction: 0
        };
      }

      dailyBreakdown[dateKey].Sales += saleAmount;
      dailyBreakdown[dateKey].Transactions += 1;

      txn.Line_Items.forEach(item => {
        dailyBreakdown[dateKey].Quantity += parseFloat(item.Quantity);
        totalQuantity += parseFloat(item.Quantity);
      });

      dailyBreakdown[dateKey].Average_Transaction = 
        parseFloat((dailyBreakdown[dateKey].Sales / dailyBreakdown[dateKey].Transactions).toFixed(2));
    });

    const sortedDailyData = Object.values(dailyBreakdown).sort((a, b) => 
      new Date(a.Date) - new Date(b.Date)
    );

    res.json({
      Report_Type: 'Sales Report',
      Period: period || 'Custom',
      Summary: {
        Total_Sales: parseFloat(totalSales.toFixed(2)),
        Total_Transactions: totalTransactions,
        Average_Transaction_Value: parseFloat((totalSales / totalTransactions).toFixed(2)),
        Total_Quantity_Sold: parseFloat(totalQuantity.toFixed(3))
      },
      Daily_Breakdown: sortedDailyData.map(day => ({
        Date: day.Date,
        Sales: parseFloat(day.Sales.toFixed(2)),
        Quantity: parseFloat(day.Quantity.toFixed(3)),
        Transactions: day.Transactions,
        Average_Transaction_Value: day.Average_Transaction
      }))
    });
  } catch (error) {
    console.log("Error in getSalesReport controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Purchase Report - Show incoming bills and credit days
const getPurchaseReport = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { startDate, endDate, supplierId } = req.query;

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
      Type: 'Purchase',
      Is_Deleted: false,
      Status: 'Completed'
    };

    if (startDate || endDate) {
      where.Date = {};
      if (startDate) where.Date[Op.gte] = startDate;
      if (endDate) where.Date[Op.lte] = endDate;
    }

    if (supplierId) {
      where.Party_ID = supplierId;
    }

    const transactions = await Transaction.findAll({
      where,
      include: [
        {
          model: TransactionLineItem,
          as: 'Line_Items',
          attributes: ['Item_Name', 'Quantity', 'Rate', 'Line_Total']
        },
        {
          model: Party,
          as: 'Party',
          attributes: ['Party_ID', 'Name', 'Mobile_Number']
        }
      ]
    });

    let totalPurchases = 0;
    const supplierBreakdown = {};

    transactions.forEach(txn => {
      const purchaseAmount = parseFloat(txn.Total_Amount);
      totalPurchases += purchaseAmount;
      const supplierId = txn.Party_ID;

      if (!supplierBreakdown[supplierId]) {
        supplierBreakdown[supplierId] = {
          Supplier_ID: txn.Party.Party_ID,
          Supplier_Name: txn.Party.Name,
          Supplier_Phone: txn.Party.Mobile_Number,
          Total_Purchase: 0,
          Bill_Count: 0,
          Bills: []
        };
      }

      supplierBreakdown[supplierId].Total_Purchase += purchaseAmount;
      supplierBreakdown[supplierId].Bill_Count += 1;
      supplierBreakdown[supplierId].Bills.push({
        Transaction_ID: txn.Transaction_ID,
        Date: txn.Date,
        Amount: parseFloat(purchaseAmount.toFixed(2)),
        Items_Count: txn.Line_Items.length,
        Payment_Mode: txn.Payment_Mode || 'Not specified'
      });
    });

    const suppliers = Object.values(supplierBreakdown).map(sup => ({
      ...sup,
      Total_Purchase: parseFloat(sup.Total_Purchase.toFixed(2)),
      Average_Bill_Value: parseFloat((sup.Total_Purchase / sup.Bill_Count).toFixed(2))
    }));

    res.json({
      Report_Type: 'Purchase Report',
      Summary: {
        Total_Purchases: parseFloat(totalPurchases.toFixed(2)),
        Total_Bills: transactions.length,
        Supplier_Count: suppliers.length,
        Average_Bill_Value: parseFloat((totalPurchases / transactions.length).toFixed(2))
      },
      Suppliers: suppliers
    });
  } catch (error) {
    console.log("Error in getPurchaseReport controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// GST Report (simplified GSTR-1 & GSTR-3B ready data)
const getGSTReport = async (req, res) => {
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
      Is_Deleted: false,
      Status: 'Completed'
    };

    if (startDate || endDate) {
      where.Date = {};
      if (startDate) where.Date[Op.gte] = startDate;
      if (endDate) where.Date[Op.lte] = endDate;
    }

    const transactions = await Transaction.findAll({
      where,
      include: [
        {
          model: TransactionLineItem,
          as: 'Line_Items',
          attributes: ['Line_Total']
        },
        {
          model: Party,
          as: 'Party',
          attributes: ['Party_ID', 'Name', 'GST_Number']
        }
      ]
    });

    let outwardSupplies = 0;
    let inwardSupplies = 0;
    const gstRate = 5; // Default 5%

    transactions.forEach(txn => {
      const subtotal = txn.Line_Items.reduce((sum, item) => sum + parseFloat(item.Line_Total), 0);

      if (txn.Type === 'Sale') {
        outwardSupplies += subtotal;
      } else if (txn.Type === 'Purchase') {
        inwardSupplies += subtotal;
      }
    });

    const outputGST = (outwardSupplies * gstRate) / 100;
    const inputGST = (inwardSupplies * gstRate) / 100;
    const netGST = outputGST - inputGST;

    res.json({
      Report_Type: 'GST Report (GSTR-1 & GSTR-3B)',
      Period: {
        Start_Date: startDate || 'N/A',
        End_Date: endDate || 'N/A'
      },
      GSTR_1_Data: {
        Outward_Supplies: parseFloat(outwardSupplies.toFixed(2)),
        Output_GST: parseFloat(outputGST.toFixed(2))
      },
      GSTR_3B_Data: {
        Outward_Supplies: parseFloat(outwardSupplies.toFixed(2)),
        Inward_Supplies: parseFloat(inwardSupplies.toFixed(2)),
        Output_GST: parseFloat(outputGST.toFixed(2)),
        Input_GST: parseFloat(inputGST.toFixed(2)),
        Net_GST_Liability: netGST >= 0 ? parseFloat(netGST.toFixed(2)) : 0,
        Net_GST_Credit: netGST < 0 ? parseFloat(Math.abs(netGST).toFixed(2)) : 0
      },
      Total_Transactions: transactions.length
    });
  } catch (error) {
    console.log("Error in getGSTReport controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Profit & Loss Report
const getProfitLossReport = async (req, res) => {
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

    // Build transaction filters
    const txnWhere = {
      Company_ID: company.Company_ID,
      Is_Deleted: false,
      Status: 'Completed'
    };

    if (startDate || endDate) {
      txnWhere.Date = {};
      if (startDate) txnWhere.Date[Op.gte] = startDate;
      if (endDate) txnWhere.Date[Op.lte] = endDate;
    }

    // Fetch sales and purchases
    const sales = await Transaction.findAll({
      where: { ...txnWhere, Type: 'Sale' },
      include: [{ model: TransactionLineItem, as: 'Line_Items' }]
    });

    const purchases = await Transaction.findAll({
      where: { ...txnWhere, Type: 'Purchase' },
      include: [{ model: TransactionLineItem, as: 'Line_Items' }]
    });

    // Fetch expenses
    const expenseWhere = {
      Company_ID: company.Company_ID,
      Is_Deleted: false
    };

    if (startDate || endDate) {
      expenseWhere.Date = {};
      if (startDate) expenseWhere.Date[Op.gte] = startDate;
      if (endDate) expenseWhere.Date[Op.lte] = endDate;
    }

    const expenses = await Expense.findAll({ where: expenseWhere });

    // Calculate revenue
    let totalRevenue = 0;
    sales.forEach(sale => {
      totalRevenue += parseFloat(sale.Total_Amount);
    });

    // Calculate cost of goods sold
    let totalCOGS = 0;
    purchases.forEach(purchase => {
      totalCOGS += parseFloat(purchase.Total_Amount);
    });

    // Calculate expenses
    let totalExpenses = 0;
    expenses.forEach(exp => {
      totalExpenses += parseFloat(exp.Amount);
    });

    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0;

    res.json({
      Report_Type: 'Profit & Loss Report',
      Period: {
        Start_Date: startDate || 'N/A',
        End_Date: endDate || 'N/A'
      },
      Income: {
        Total_Revenue: parseFloat(totalRevenue.toFixed(2)),
        Sales_Count: sales.length
      },
      Expenses: {
        Cost_of_Goods_Sold: parseFloat(totalCOGS.toFixed(2)),
        Purchase_Count: purchases.length,
        Operating_Expenses: parseFloat(totalExpenses.toFixed(2)),
        Expense_Count: expenses.length
      },
      Profit_Loss: {
        Gross_Profit: parseFloat(grossProfit.toFixed(2)),
        Net_Profit: parseFloat(netProfit.toFixed(2)),
        Profit_Margin_Percentage: parseFloat(profitMargin)
      }
    });
  } catch (error) {
    console.log("Error in getProfitLossReport controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Stock Summary Report - Real-time stock valuation
const getStockSummary = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { lowStockThreshold } = req.query;

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Fetch all items
    const items = await Item.findAll({
      where: {
        Company_ID: company.Company_ID,
        is_deleted: false
      }
    });

    const threshold = parseInt(lowStockThreshold) || 10;
    let totalValue = 0;
    let totalItems = 0;
    const categoryStock = {};

    const itemDetails = items.map(item => {
      const inventory_value = parseFloat(item.Selling_Price) * parseFloat(item.Current_Stock);
      totalValue += inventory_value;
      totalItems += parseFloat(item.Current_Stock);

      return {
        Item_ID: item.Item_ID,
        Name: item.Name,
        Unit: item.Unit,
        Current_Stock: parseFloat(item.Current_Stock),
        Selling_Price: parseFloat(item.Selling_Price),
        Inventory_Value: parseFloat(inventory_value.toFixed(2)),
        Status: parseFloat(item.Current_Stock) === 0 ? 'Out of Stock' : 
                parseFloat(item.Current_Stock) < threshold ? 'Low Stock' : 'In Stock'
      };
    });

    const outOfStock = itemDetails.filter(item => item.Status === 'Out of Stock');
    const lowStock = itemDetails.filter(item => item.Status === 'Low Stock');

    res.json({
      Report_Type: 'Stock Summary Report',
      Summary: {
        Total_Items_Variety: items.length,
        Total_Stock_Units: parseFloat(totalItems.toFixed(3)),
        Total_Inventory_Value: parseFloat(totalValue.toFixed(2)),
        Low_Stock_Threshold: threshold
      },
      Alerts: {
        Out_of_Stock_Count: outOfStock.length,
        Low_Stock_Count: lowStock.length,
        Out_of_Stock_Items: outOfStock.map(item => ({
          Item_ID: item.Item_ID,
          Name: item.Name
        })),
        Low_Stock_Items: lowStock.map(item => ({
          Item_ID: item.Item_ID,
          Name: item.Name,
          Current_Stock: item.Current_Stock,
          Unit: item.Unit
        }))
      },
      Items: itemDetails
    });
  } catch (error) {
    console.log("Error in getStockSummary controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Party Ledger / Statement - Complete transaction history with party
const getPartyLedger = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { partyId, startDate, endDate } = req.query;

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    if (!partyId) {
      return res.status(400).json({ message: "Party_ID is required" });
    }

    // Verify party
    const party = await Party.findOne({
      where: { Party_ID: partyId, Company_ID: company.Company_ID, is_deleted: false }
    });

    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    // Build transaction filters
    const txnWhere = {
      Company_ID: company.Company_ID,
      Party_ID: partyId,
      Is_Deleted: false,
      Status: 'Completed'
    };

    if (startDate || endDate) {
      txnWhere.Date = {};
      if (startDate) txnWhere.Date[Op.gte] = startDate;
      if (endDate) txnWhere.Date[Op.lte] = endDate;
    }

    // Get all transactions with party
    const transactions = await Transaction.findAll({
      where: txnWhere,
      order: [['Date', 'ASC']]
    });

    // Get expenses linked to party
    const expenseWhere = {
      Company_ID: company.Company_ID,
      Party_ID: partyId,
      Is_Deleted: false
    };

    if (startDate || endDate) {
      expenseWhere.Date = {};
      if (startDate) expenseWhere.Date[Op.gte] = startDate;
      if (endDate) expenseWhere.Date[Op.lte] = endDate;
    }

    const expenses = await Expense.findAll({ where: expenseWhere });

    // Calculate balance
    let totalDebit = 0; // Purchases
    let totalCredit = 0; // Sales
    let totalExpenses = 0;

    transactions.forEach(txn => {
      if (txn.Type === 'Sale') {
        totalCredit += parseFloat(txn.Total_Amount);
      } else if (txn.Type === 'Purchase') {
        totalDebit += parseFloat(txn.Total_Amount);
      }
    });

    expenses.forEach(exp => {
      totalExpenses += parseFloat(exp.Amount);
    });

    const balance = totalDebit - totalCredit - totalExpenses;

    res.json({
      Report_Type: 'Party Ledger / Statement',
      Party: {
        Party_ID: party.Party_ID,
        Name: party.Name,
        Type: party.Type,
        Email: party.Email,
        Mobile_Number: party.Mobile_Number,
        GST_Number: party.GST_Number
      },
      Summary: {
        Total_Purchases: parseFloat(totalDebit.toFixed(2)),
        Total_Sales: parseFloat(totalCredit.toFixed(2)),
        Total_Expenses: parseFloat(totalExpenses.toFixed(2)),
        Net_Balance: parseFloat(balance.toFixed(2)),
        Balance_Status: balance > 0 ? 'Party Owes' : balance < 0 ? 'You Owe' : 'Settled'
      },
      Transactions: transactions.map(txn => ({
        Transaction_ID: txn.Transaction_ID,
        Date: txn.Date,
        Type: txn.Type,
        Amount: parseFloat(txn.Total_Amount),
        Payment_Mode: txn.Payment_Mode
      })),
      Expenses: expenses.map(exp => ({
        Expense_ID: exp.Expense_ID,
        Date: exp.Date,
        Category: exp.Category,
        Amount: parseFloat(exp.Amount)
      }))
    });
  } catch (error) {
    console.log("Error in getPartyLedger controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSalesReport,
  getPurchaseReport,
  getGSTReport,
  getProfitLossReport,
  getStockSummary,
  getPartyLedger
};