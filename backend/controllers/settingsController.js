// controllers/settingsController.js
const { Company } = require('../models');
const fs = require('fs').promises;
const path = require('path');

// Get company settings
const getSettings = async (req, res) => {
  try {
    const userId = req.user.User_ID;

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Parse settings from company metadata or return defaults
    const settings = {
      Company_ID: company.Company_ID,
      Company_Name: company.Name,
      Company_Email: company.Email,
      Company_Address: company.Address,
      Invoice_Settings: {
        Prefix: company.Invoice_Prefix || 'INV',
        Auto_Numbering: company.Auto_Numbering !== false, // Default true
        Starting_Number: company.Starting_Number || 1000,
        Current_Number: company.Current_Number || 1000,
        Increment_By: company.Increment_By || 1,
        GST_Enabled: company.GST_Enabled !== false // Default true
      },
      Backup_Last_Date: company.Backup_Last_Date || null
    };

    res.json(settings);
  } catch (error) {
    console.log("Error in getSettings controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Update invoice settings
const updateInvoiceSettings = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { Prefix, Auto_Numbering, Starting_Number, Increment_By, GST_Enabled } = req.body;

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Validate prefix
    if (Prefix !== undefined) {
      if (Prefix.length < 1 || Prefix.length > 10) {
        return res.status(400).json({ message: "Invoice prefix must be between 1 and 10 characters" });
      }
      company.Invoice_Prefix = Prefix;
    }

    // Validate auto numbering
    if (Auto_Numbering !== undefined) {
      company.Auto_Numbering = Auto_Numbering;
    }

    // Validate starting number
    if (Starting_Number !== undefined) {
      if (isNaN(Starting_Number) || Starting_Number < 1) {
        return res.status(400).json({ message: "Starting number must be a positive number" });
      }
      company.Starting_Number = parseInt(Starting_Number);
      company.Current_Number = parseInt(Starting_Number);
    }

    // Validate increment by
    if (Increment_By !== undefined) {
      if (isNaN(Increment_By) || Increment_By < 1) {
        return res.status(400).json({ message: "Increment by must be a positive number" });
      }
      company.Increment_By = parseInt(Increment_By);
    }

    // Validate GST enabled
    if (GST_Enabled !== undefined) {
      company.GST_Enabled = GST_Enabled;
    }

    await company.save();

    res.json({
      message: "Invoice settings updated successfully",
      settings: {
        Company_ID: company.Company_ID,
        Prefix: company.Invoice_Prefix,
        Auto_Numbering: company.Auto_Numbering,
        Starting_Number: company.Starting_Number,
        Current_Number: company.Current_Number,
        Increment_By: company.Increment_By,
        GST_Enabled: company.GST_Enabled
      }
    });
  } catch (error) {
    console.log("Error in updateInvoiceSettings controller", error.message);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// Backup Database - Export entire data
const backupDatabase = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { dataType } = req.query; // Optional: specific data type (all, transactions, items, etc.)

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    const { Company: CompanyModel, User: UserModel, Party, Item, Transaction, TransactionLineItem, Expense } = require('../models');

    // Fetch all company data
    const backupData = {
      Metadata: {
        Backup_Date: new Date().toISOString(),
        Company_ID: company.Company_ID,
        Company_Name: company.Name,
        Backup_Type: 'Full Company Data'
      },
      Company: {
        Company_ID: company.Company_ID,
        Name: company.Name,
        Address: company.Address,
        Email: company.Email
      },
      Parties: [],
      Items: [],
      Transactions: [],
      TransactionLineItems: [],
      Expenses: []
    };

    // Fetch related data
    if (!dataType || dataType === 'all' || dataType === 'parties') {
      const parties = await Party.findAll({
        where: { Company_ID: company.Company_ID }
      });
      backupData.Parties = parties.map(p => ({
        Party_ID: p.Party_ID,
        Name: p.Name,
        Type: p.Type,
        Email: p.Email,
        Mobile_Number: p.Mobile_Number,
        Address: p.Address,
        GST_Number: p.GST_Number
      }));
    }

    if (!dataType || dataType === 'all' || dataType === 'items') {
      const items = await Item.findAll({
        where: { Company_ID: company.Company_ID }
      });
      backupData.Items = items.map(i => ({
        Item_ID: i.Item_ID,
        Name: i.Name,
        Unit: i.Unit,
        Description: i.Description,
        Selling_Price: i.Selling_Price,
        Purchase_Price: i.Purchase_Price,
        Current_Stock: i.Current_Stock
      }));
    }

    if (!dataType || dataType === 'all' || dataType === 'transactions') {
      const transactions = await Transaction.findAll({
        where: { Company_ID: company.Company_ID }
      });
      backupData.Transactions = transactions.map(t => ({
        Transaction_ID: t.Transaction_ID,
        Party_ID: t.Party_ID,
        Date: t.Date,
        Type: t.Type,
        Total_Amount: t.Total_Amount,
        Status: t.Status,
        Payment_Mode: t.Payment_Mode
      }));

      const lineItems = await TransactionLineItem.findAll();
      backupData.TransactionLineItems = lineItems.map(li => ({
        Line_ID: li.Line_ID,
        Transaction_ID: li.Transaction_ID,
        Item_ID: li.Item_ID,
        Item_Name: li.Item_Name,
        Quantity: li.Quantity,
        Rate: li.Rate,
        Discount: li.Discount,
        Line_Total: li.Line_Total
      }));
    }

    if (!dataType || dataType === 'all' || dataType === 'expenses') {
      const expenses = await Expense.findAll({
        where: { Company_ID: company.Company_ID }
      });
      backupData.Expenses = expenses.map(e => ({
        Expense_ID: e.Expense_ID,
        Party_ID: e.Party_ID,
        Date: e.Date,
        Category: e.Category,
        Amount: e.Amount,
        Description: e.Description,
        Payment_Mode: e.Payment_Mode
      }));
    }

    // Update backup date
    company.Backup_Last_Date = new Date();
    await company.save();

    // Return backup data as file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="backup_${company.Company_ID}_${Date.now()}.json"`);
    res.json(backupData);
  } catch (error) {
    console.log("Error in backupDatabase controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Restore Data - From backup file
const restoreData = async (req, res) => {
  try {
    const userId = req.user.User_ID;

    if (!req.file) {
      return res.status(400).json({ message: "Backup file is required" });
    }

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Parse backup file
    let backupData;
    try {
      backupData = JSON.parse(req.file.buffer.toString());
    } catch (e) {
      return res.status(400).json({ message: "Invalid backup file format" });
    }

    // Validate backup structure
    if (!backupData.Metadata || !backupData.Company) {
      return res.status(400).json({ message: "Invalid backup file structure" });
    }

    // Verify backup belongs to same company (optional security check)
    if (backupData.Company.Company_ID !== company.Company_ID) {
      return res.status(400).json({ message: "Backup does not match current company" });
    }

    const { Party, Item, Transaction, TransactionLineItem, Expense } = require('../models');

    // Restore parties
    if (backupData.Parties && Array.isArray(backupData.Parties)) {
      for (const partyData of backupData.Parties) {
        await Party.findOrCreate({
          where: { Party_ID: partyData.Party_ID },
          defaults: {
            Company_ID: company.Company_ID,
            ...partyData
          }
        });
      }
    }

    // Restore items
    if (backupData.Items && Array.isArray(backupData.Items)) {
      for (const itemData of backupData.Items) {
        await Item.findOrCreate({
          where: { Item_ID: itemData.Item_ID },
          defaults: {
            Company_ID: company.Company_ID,
            ...itemData
          }
        });
      }
    }

    // Restore transactions and line items
    if (backupData.Transactions && Array.isArray(backupData.Transactions)) {
      for (const txnData of backupData.Transactions) {
        await Transaction.findOrCreate({
          where: { Transaction_ID: txnData.Transaction_ID },
          defaults: {
            Company_ID: company.Company_ID,
            ...txnData
          }
        });
      }
    }

    if (backupData.TransactionLineItems && Array.isArray(backupData.TransactionLineItems)) {
      for (const lineItemData of backupData.TransactionLineItems) {
        await TransactionLineItem.findOrCreate({
          where: { Line_ID: lineItemData.Line_ID },
          defaults: lineItemData
        });
      }
    }

    // Restore expenses
    if (backupData.Expenses && Array.isArray(backupData.Expenses)) {
      for (const expenseData of backupData.Expenses) {
        await Expense.findOrCreate({
          where: { Expense_ID: expenseData.Expense_ID },
          defaults: {
            Company_ID: company.Company_ID,
            ...expenseData
          }
        });
      }
    }

    res.json({
      message: "Data restored successfully from backup",
      Restored_Data: {
        Parties: backupData.Parties ? backupData.Parties.length : 0,
        Items: backupData.Items ? backupData.Items.length : 0,
        Transactions: backupData.Transactions ? backupData.Transactions.length : 0,
        LineItems: backupData.TransactionLineItems ? backupData.TransactionLineItems.length : 0,
        Expenses: backupData.Expenses ? backupData.Expenses.length : 0
      },
      Restore_Date: new Date().toISOString()
    });
  } catch (error) {
    console.log("Error in restoreData controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get invoice number
const getNextInvoiceNumber = async (req, res) => {
  try {
    const userId = req.user.User_ID;

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    const prefix = company.Invoice_Prefix || 'INV';
    const currentNumber = company.Current_Number || 1000;
    const nextNumber = currentNumber + (company.Increment_By || 1);
    const invoiceNumber = `${prefix}-${String(currentNumber).padStart(5, '0')}`;

    // Update current number
    company.Current_Number = nextNumber;
    await company.save();

    res.json({
      Invoice_Number: invoiceNumber,
      Prefix: prefix,
      Current_Sequence: currentNumber,
      Next_Sequence: nextNumber
    });
  } catch (error) {
    console.log("Error in getNextInvoiceNumber controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateInvoiceSettings,
  backupDatabase,
  restoreData,
  getNextInvoiceNumber
};