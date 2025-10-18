// transactionController.js
// controllers/transactionController.js
const { Company, Party, Item, Transaction, TransactionLineItem } = require('../models');
const { Op, sequelize } = require('sequelize');

// Create invoice (Sale transaction with line items)
const createInvoice = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.User_ID;
    const { Party_ID, Date, Payment_Mode, Line_Items, GST_Rate } = req.body;

    // Validate input
    if (!Party_ID || !Line_Items || !Array.isArray(Line_Items) || Line_Items.length === 0) {
      return res.status(400).json({ 
        message: "Party_ID and Line_Items array (non-empty) are required" 
      });
    }

    if (!GST_Rate || isNaN(GST_Rate) || GST_Rate < 0 || GST_Rate > 100) {
      return res.status(400).json({ message: "Valid GST_Rate (0-100) is required" });
    }

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    }, { transaction: t });

    if (!company) {
      await t.rollback();
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Verify party belongs to company
    const party = await Party.findOne({
      where: { Party_ID, Company_ID: company.Company_ID, is_deleted: false }
    }, { transaction: t });

    if (!party) {
      await t.rollback();
      return res.status(404).json({ message: "Party not found" });
    }

    // Validate party type
    if (party.Type !== 'Customer' && party.Type !== 'Both') {
      await t.rollback();
      return res.status(400).json({ message: "Party must be a Customer to create invoice" });
    }

    // Validate and process line items
    let subtotal = 0;
    const processedLineItems = [];

    for (const lineItem of Line_Items) {
      if (!lineItem.Item_ID || !lineItem.Quantity || !lineItem.Rate) {
        await t.rollback();
        return res.status(400).json({ 
          message: "Each line item must have Item_ID, Quantity, and Rate" 
        });
      }

      // Fetch item
      const item = await Item.findOne({
        where: { Item_ID: lineItem.Item_ID, Company_ID: company.Company_ID, is_deleted: false }
      }, { transaction: t });

      if (!item) {
        await t.rollback();
        return res.status(404).json({ message: `Item ${lineItem.Item_ID} not found` });
      }

      const quantity = parseFloat(lineItem.Quantity);
      const rate = parseFloat(lineItem.Rate);
      const discount = parseFloat(lineItem.Discount) || 0;
      const lineTotal = (quantity * rate) - discount;

      subtotal += lineTotal;

      processedLineItems.push({
        Item_ID: item.Item_ID,
        Item_Name: item.Name,
        Quantity: quantity,
        Rate: rate,
        Discount: discount,
        Line_Total: lineTotal,
        item // Store item reference for stock update
      });
    }

    // Calculate taxes
    const taxableAmount = subtotal;
    const totalTax = (taxableAmount * GST_Rate) / 100;
    const totalAmount = taxableAmount + totalTax;

    // Create transaction header
    const transaction = await Transaction.create({
      Company_ID: company.Company_ID,
      Party_ID: party.Party_ID,
      Date: Date || new Date().toISOString().split('T')[0],
      Type: 'Sale',
      Total_Amount: totalAmount,
      Status: 'Completed',
      Payment_Mode: Payment_Mode || null,
      Is_Deleted: false
    }, { transaction: t });

    // Create line items and update stock
    for (const lineItem of processedLineItems) {
      await TransactionLineItem.create({
        Transaction_ID: transaction.Transaction_ID,
        Item_ID: lineItem.Item_ID,
        Item_Name: lineItem.Item_Name,
        Quantity: lineItem.Quantity,
        Rate: lineItem.Rate,
        Discount: lineItem.Discount,
        Line_Total: lineItem.Line_Total
      }, { transaction: t });

      // Decrease stock for sale
      lineItem.item.Current_Stock -= lineItem.Quantity;
      await lineItem.item.save({ transaction: t });
    }

    await t.commit();

    res.status(201).json({
      message: "Invoice created successfully",
      invoice: {
        Transaction_ID: transaction.Transaction_ID,
        Company_ID: transaction.Company_ID,
        Party_ID: transaction.Party_ID,
        Party_Name: party.Name,
        Date: transaction.Date,
        Type: transaction.Type,
        Subtotal: parseFloat(subtotal.toFixed(2)),
        GST_Rate: GST_Rate,
        Tax_Amount: parseFloat(totalTax.toFixed(2)),
        Total_Amount: parseFloat(totalAmount.toFixed(2)),
        Status: transaction.Status,
        Line_Items: processedLineItems.map(li => ({
          Item_ID: li.Item_ID,
          Item_Name: li.Item_Name,
          Quantity: li.Quantity,
          Rate: li.Rate,
          Discount: li.Discount,
          Line_Total: li.Line_Total
        })),
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    await t.rollback();
    console.log("Error in createInvoice controller", error.message);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// Create purchase bill
const createPurchaseBill = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.User_ID;
    const { Party_ID, Date, Payment_Mode, Line_Items, GST_Rate } = req.body;

    // Validate input
    if (!Party_ID || !Line_Items || !Array.isArray(Line_Items) || Line_Items.length === 0) {
      return res.status(400).json({ 
        message: "Party_ID and Line_Items array (non-empty) are required" 
      });
    }

    if (!GST_Rate || isNaN(GST_Rate) || GST_Rate < 0 || GST_Rate > 100) {
      return res.status(400).json({ message: "Valid GST_Rate (0-100) is required" });
    }

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    }, { transaction: t });

    if (!company) {
      await t.rollback();
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Verify party belongs to company
    const party = await Party.findOne({
      where: { Party_ID, Company_ID: company.Company_ID, is_deleted: false }
    }, { transaction: t });

    if (!party) {
      await t.rollback();
      return res.status(404).json({ message: "Party not found" });
    }

    // Validate party type
    if (party.Type !== 'Supplier' && party.Type !== 'Both') {
      await t.rollback();
      return res.status(400).json({ message: "Party must be a Supplier to create purchase bill" });
    }

    // Validate and process line items
    let subtotal = 0;
    const processedLineItems = [];

    for (const lineItem of Line_Items) {
      if (!lineItem.Item_ID || !lineItem.Quantity || !lineItem.Rate) {
        await t.rollback();
        return res.status(400).json({ 
          message: "Each line item must have Item_ID, Quantity, and Rate" 
        });
      }

      // Fetch item
      const item = await Item.findOne({
        where: { Item_ID: lineItem.Item_ID, Company_ID: company.Company_ID, is_deleted: false }
      }, { transaction: t });

      if (!item) {
        await t.rollback();
        return res.status(404).json({ message: `Item ${lineItem.Item_ID} not found` });
      }

      const quantity = parseFloat(lineItem.Quantity);
      const rate = parseFloat(lineItem.Rate);
      const discount = parseFloat(lineItem.Discount) || 0;
      const lineTotal = (quantity * rate) - discount;

      subtotal += lineTotal;

      processedLineItems.push({
        Item_ID: item.Item_ID,
        Item_Name: item.Name,
        Quantity: quantity,
        Rate: rate,
        Discount: discount,
        Line_Total: lineTotal,
        item // Store item reference for stock update
      });
    }

    // Calculate taxes
    const taxableAmount = subtotal;
    const totalTax = (taxableAmount * GST_Rate) / 100;
    const totalAmount = taxableAmount + totalTax;

    // Create transaction header
    const transaction = await Transaction.create({
      Company_ID: company.Company_ID,
      Party_ID: party.Party_ID,
      Date: Date || new Date().toISOString().split('T')[0],
      Type: 'Purchase',
      Total_Amount: totalAmount,
      Status: 'Completed',
      Payment_Mode: Payment_Mode || null,
      Is_Deleted: false
    }, { transaction: t });

    // Create line items and update stock
    for (const lineItem of processedLineItems) {
      await TransactionLineItem.create({
        Transaction_ID: transaction.Transaction_ID,
        Item_ID: lineItem.Item_ID,
        Item_Name: lineItem.Item_Name,
        Quantity: lineItem.Quantity,
        Rate: lineItem.Rate,
        Discount: lineItem.Discount,
        Line_Total: lineItem.Line_Total
      }, { transaction: t });

      // Increase stock for purchase
      lineItem.item.Current_Stock += lineItem.Quantity;
      await lineItem.item.save({ transaction: t });
    }

    await t.commit();

    res.status(201).json({
      message: "Purchase bill created successfully",
      bill: {
        Transaction_ID: transaction.Transaction_ID,
        Company_ID: transaction.Company_ID,
        Party_ID: transaction.Party_ID,
        Party_Name: party.Name,
        Date: transaction.Date,
        Type: transaction.Type,
        Subtotal: parseFloat(subtotal.toFixed(2)),
        GST_Rate: GST_Rate,
        Tax_Amount: parseFloat(totalTax.toFixed(2)),
        Total_Amount: parseFloat(totalAmount.toFixed(2)),
        Status: transaction.Status,
        Line_Items: processedLineItems.map(li => ({
          Item_ID: li.Item_ID,
          Item_Name: li.Item_Name,
          Quantity: li.Quantity,
          Rate: li.Rate,
          Discount: li.Discount,
          Line_Total: li.Line_Total
        })),
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    await t.rollback();
    console.log("Error in createPurchaseBill controller", error.message);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// Get invoice by ID with line items
const getInvoiceById = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { transactionId } = req.params;

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Find transaction with line items
    const transaction = await Transaction.findOne({
      where: {
        Transaction_ID: transactionId,
        Company_ID: company.Company_ID,
        Is_Deleted: false
      },
      include: [
        {
          model: Party,
          as: 'Party',
          attributes: ['Party_ID', 'Name', 'Type', 'Email', 'Mobile_Number', 'Address', 'GST_Number']
        },
        {
          model: TransactionLineItem,
          as: 'Line_Items',
          attributes: ['Line_ID', 'Item_ID', 'Item_Name', 'Quantity', 'Rate', 'Discount', 'Line_Total']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Calculate tax and subtotal
    const subtotal = transaction.Line_Items.reduce((sum, item) => sum + parseFloat(item.Line_Total), 0);

    res.json({
      Transaction_ID: transaction.Transaction_ID,
      Company_ID: transaction.Company_ID,
      Party: transaction.Party,
      Date: transaction.Date,
      Type: transaction.Type,
      Status: transaction.Status,
      Payment_Mode: transaction.Payment_Mode,
      Subtotal: parseFloat(subtotal.toFixed(2)),
      Total_Amount: parseFloat(transaction.Total_Amount),
      Line_Items: transaction.Line_Items,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    });
  } catch (error) {
    console.log("Error in getInvoiceById controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get all invoices with filters
const getAllInvoices = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { startDate, endDate, Party_ID, Type, Status, sortBy } = req.query;

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

    // Filter by party
    if (Party_ID) {
      where.Party_ID = Party_ID;
    }

    // Filter by transaction type
    if (Type) {
      const validTypes = ['Sale', 'Purchase', 'Estimate'];
      if (!validTypes.includes(Type)) {
        return res.status(400).json({ message: "Invalid Type" });
      }
      where.Type = Type;
    }

    // Filter by status
    if (Status) {
      const validStatuses = ['Pending', 'Completed', 'Cancelled'];
      if (!validStatuses.includes(Status)) {
        return res.status(400).json({ message: "Invalid Status" });
      }
      where.Status = Status;
    }

    // Determine sort order
    let order = [['Date', 'DESC']];
    if (sortBy === 'amount-high') {
      order = [['Total_Amount', 'DESC']];
    } else if (sortBy === 'amount-low') {
      order = [['Total_Amount', 'ASC']];
    } else if (sortBy === 'oldest') {
      order = [['Date', 'ASC']];
    }

    const transactions = await Transaction.findAll({
      where,
      include: [
        {
          model: Party,
          as: 'Party',
          attributes: ['Party_ID', 'Name']
        }
      ],
      order
    });

    res.json({
      count: transactions.length,
      transactions: transactions.map(txn => ({
        Transaction_ID: txn.Transaction_ID,
        Party_ID: txn.Party_ID,
        Party_Name: txn.Party.Name,
        Date: txn.Date,
        Type: txn.Type,
        Total_Amount: parseFloat(txn.Total_Amount),
        Status: txn.Status,
        createdAt: txn.createdAt
      }))
    });
  } catch (error) {
    console.log("Error in getAllInvoices controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get GST summary
const getGSTSummary = async (req, res) => {
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

    // Fetch all completed transactions
    const transactions = await Transaction.findAll({
      where,
      include: [
        {
          model: TransactionLineItem,
          as: 'Line_Items',
          attributes: ['Line_Total']
        }
      ]
    });

    // Calculate GST breakdown (simplified - assumes uniform GST rate)
    let outwardSupplies = 0; // Sales
    let inwardSupplies = 0; // Purchases
    let totalGST = 0;

    transactions.forEach(txn => {
      const subtotal = txn.Line_Items.reduce((sum, item) => sum + parseFloat(item.Line_Total), 0);
      
      if (txn.Type === 'Sale') {
        outwardSupplies += subtotal;
      } else if (txn.Type === 'Purchase') {
        inwardSupplies += subtotal;
      }
    });

    // Assuming GST rate used (this is simplified; in real scenario, track per transaction)
    const gstRate = 5; // Default 5% for demonstration
    const outputGST = (outwardSupplies * gstRate) / 100;
    const inputGST = (inwardSupplies * gstRate) / 100;
    const netGST = outputGST - inputGST;

    res.json({
      Period: {
        Start_Date: startDate || 'N/A',
        End_Date: endDate || 'N/A'
      },
      Outward_Supplies: parseFloat(outwardSupplies.toFixed(2)),
      Inward_Supplies: parseFloat(inwardSupplies.toFixed(2)),
      Output_GST: parseFloat(outputGST.toFixed(2)),
      Input_GST: parseFloat(inputGST.toFixed(2)),
      Net_GST_Liability: netGST >= 0 ? parseFloat(netGST.toFixed(2)) : 0,
      Net_GST_Credit: netGST < 0 ? parseFloat(Math.abs(netGST).toFixed(2)) : 0,
      Total_Transactions: transactions.length
    });
  } catch (error) {
    console.log("Error in getGSTSummary controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createInvoice,
  createPurchaseBill,
  getInvoiceById,
  getAllInvoices,
  getGSTSummary
};