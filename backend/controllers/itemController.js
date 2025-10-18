// controllers/itemController.js
const { Company, Item } = require('../models');
const { Op } = require('sequelize');

// Create a new item
const createItem = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { Name, Unit, Description, Selling_Price, Purchase_Price, Current_Stock, GST_Rate } = req.body;

    // Validate input
    if (!Name || !Unit || Selling_Price === undefined || Purchase_Price === undefined) {
      return res.status(400).json({ 
        message: "Name, Unit, Selling_Price, and Purchase_Price are required" 
      });
    }

    // Validate name length
    if (Name.length < 2 || Name.length > 150) {
      return res.status(400).json({ message: "Item name must be between 2 and 150 characters" });
    }

    // Validate unit
    if (Unit.length < 1 || Unit.length > 20) {
      return res.status(400).json({ message: "Unit must be between 1 and 20 characters" });
    }

    // Validate prices
    if (isNaN(Selling_Price) || Selling_Price < 0) {
      return res.status(400).json({ message: "Selling Price must be a valid positive number" });
    }

    if (isNaN(Purchase_Price) || Purchase_Price < 0) {
      return res.status(400).json({ message: "Purchase Price must be a valid positive number" });
    }

    // Validate stock if provided
    const stock = Current_Stock || 0;
    if (isNaN(stock) || stock < 0) {
      return res.status(400).json({ message: "Current Stock must be a valid non-negative number" });
    }

    // Validate GST rate if provided
    if (GST_Rate !== undefined) {
      if (isNaN(GST_Rate) || GST_Rate < 0 || GST_Rate > 100) {
        return res.status(400).json({ message: "GST Rate must be between 0 and 100" });
      }
    }

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company to create an item" });
    }

    // Check if item name already exists for this company
    const itemExists = await Item.findOne({
      where: {
        Company_ID: company.Company_ID,
        Name,
        is_deleted: false
      }
    });

    if (itemExists) {
      return res.status(400).json({ message: "Item with this name already exists for your company" });
    }

    // Create new item
    const item = await Item.create({
      Company_ID: company.Company_ID,
      Name,
      Unit,
      Description: Description || null,
      Selling_Price: parseFloat(Selling_Price),
      Purchase_Price: parseFloat(Purchase_Price),
      Current_Stock: parseFloat(stock),
      is_deleted: false
    });

    res.status(201).json({
      message: "Item created successfully",
      item: {
        Item_ID: item.Item_ID,
        Company_ID: item.Company_ID,
        Name: item.Name,
        Unit: item.Unit,
        Description: item.Description,
        Selling_Price: parseFloat(item.Selling_Price),
        Purchase_Price: parseFloat(item.Purchase_Price),
        Current_Stock: parseFloat(item.Current_Stock),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }
    });
  } catch (error) {
    console.log("Error in createItem controller", error.message);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// Get all items for user's company
const getAllItems = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { category, stockFilter, search, sortBy } = req.query;

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Build query filters
    const where = {
      Company_ID: company.Company_ID,
      is_deleted: false
    };

    // Filter by stock status
    if (stockFilter) {
      if (stockFilter === 'low') {
        where.Current_Stock = { [Op.lt]: 10 }; // Low stock < 10 units
      } else if (stockFilter === 'out') {
        where.Current_Stock = { [Op.lte]: 0 };
      } else if (stockFilter === 'in') {
        where.Current_Stock = { [Op.gt]: 0 };
      }
    }

    // Search by name or description
    if (search) {
      where[Op.or] = [
        { Name: { [Op.iLike]: `%${search}%` } },
        { Description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Determine sort order
    let order = [['createdAt', 'DESC']];
    if (sortBy === 'name') {
      order = [['Name', 'ASC']];
    } else if (sortBy === 'price-high') {
      order = [['Selling_Price', 'DESC']];
    } else if (sortBy === 'price-low') {
      order = [['Selling_Price', 'ASC']];
    } else if (sortBy === 'stock-low') {
      order = [['Current_Stock', 'ASC']];
    } else if (sortBy === 'stock-high') {
      order = [['Current_Stock', 'DESC']];
    }

    const items = await Item.findAll({
      where,
      order
    });

    res.json({
      count: items.length,
      items: items.map(item => ({
        Item_ID: item.Item_ID,
        Name: item.Name,
        Unit: item.Unit,
        Description: item.Description,
        Selling_Price: parseFloat(item.Selling_Price),
        Purchase_Price: parseFloat(item.Purchase_Price),
        Current_Stock: parseFloat(item.Current_Stock),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))
    });
  } catch (error) {
    console.log("Error in getAllItems controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get single item by ID
const getItemById = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { itemId } = req.params;

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Find item
    const item = await Item.findOne({
      where: {
        Item_ID: itemId,
        Company_ID: company.Company_ID,
        is_deleted: false
      }
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({
      Item_ID: item.Item_ID,
      Company_ID: item.Company_ID,
      Name: item.Name,
      Unit: item.Unit,
      Description: item.Description,
      Selling_Price: parseFloat(item.Selling_Price),
      Purchase_Price: parseFloat(item.Purchase_Price),
      Current_Stock: parseFloat(item.Current_Stock),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    });
  } catch (error) {
    console.log("Error in getItemById controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Update item details
const updateItem = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { itemId } = req.params;
    const { Name, Unit, Description, Selling_Price, Purchase_Price } = req.body;

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Find item
    const item = await Item.findOne({
      where: {
        Item_ID: itemId,
        Company_ID: company.Company_ID,
        is_deleted: false
      }
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Validate and update name if provided
    if (Name !== undefined) {
      if (Name.length < 2 || Name.length > 150) {
        return res.status(400).json({ message: "Item name must be between 2 and 150 characters" });
      }

      // Check if new name already exists for this company
      const nameExists = await Item.findOne({
        where: {
          Company_ID: company.Company_ID,
          Name,
          Item_ID: { [Op.ne]: itemId },
          is_deleted: false
        }
      });

      if (nameExists) {
        return res.status(400).json({ message: "Item with this name already exists for your company" });
      }

      item.Name = Name;
    }

    // Validate and update unit if provided
    if (Unit !== undefined) {
      if (Unit.length < 1 || Unit.length > 20) {
        return res.status(400).json({ message: "Unit must be between 1 and 20 characters" });
      }
      item.Unit = Unit;
    }

    // Update description if provided
    if (Description !== undefined) {
      item.Description = Description || null;
    }

    // Validate and update selling price if provided
    if (Selling_Price !== undefined) {
      if (isNaN(Selling_Price) || Selling_Price < 0) {
        return res.status(400).json({ message: "Selling Price must be a valid positive number" });
      }
      item.Selling_Price = parseFloat(Selling_Price);
    }

    // Validate and update purchase price if provided
    if (Purchase_Price !== undefined) {
      if (isNaN(Purchase_Price) || Purchase_Price < 0) {
        return res.status(400).json({ message: "Purchase Price must be a valid positive number" });
      }
      item.Purchase_Price = parseFloat(Purchase_Price);
    }

    await item.save();

    res.json({
      message: "Item updated successfully",
      item: {
        Item_ID: item.Item_ID,
        Company_ID: item.Company_ID,
        Name: item.Name,
        Unit: item.Unit,
        Description: item.Description,
        Selling_Price: parseFloat(item.Selling_Price),
        Purchase_Price: parseFloat(item.Purchase_Price),
        Current_Stock: parseFloat(item.Current_Stock),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }
    });
  } catch (error) {
    console.log("Error in updateItem controller", error.message);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// Adjust stock (manual adjustment entry)
const adjustStock = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { itemId } = req.params;
    const { quantity, reason, notes } = req.body;

    // Validate input
    if (quantity === undefined || isNaN(quantity)) {
      return res.status(400).json({ message: "Quantity adjustment is required and must be a number" });
    }

    if (!reason) {
      return res.status(400).json({ message: "Reason for adjustment is required (e.g., 'damage', 'recount', 'receipt')" });
    }

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Find item
    const item = await Item.findOne({
      where: {
        Item_ID: itemId,
        Company_ID: company.Company_ID,
        is_deleted: false
      }
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Store previous stock
    const previousStock = parseFloat(item.Current_Stock);

    // Adjust stock
    const newStock = previousStock + parseFloat(quantity);

    // Validate new stock is not negative
    if (newStock < 0) {
      return res.status(400).json({ 
        message: `Cannot reduce stock below zero. Current stock: ${previousStock}` 
      });
    }

    item.Current_Stock = newStock;
    await item.save();

    res.json({
      message: "Stock adjusted successfully",
      adjustment: {
        Item_ID: item.Item_ID,
        Item_Name: item.Name,
        Reason: reason,
        Notes: notes || null,
        Previous_Stock: previousStock,
        Adjusted_Quantity: parseFloat(quantity),
        New_Stock: parseFloat(item.Current_Stock),
        Timestamp: item.updatedAt
      }
    });
  } catch (error) {
    console.log("Error in adjustStock controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get inventory valuation with low-stock warnings
const getInventoryValuation = async (req, res) => {
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

    // Calculate valuations
    const threshold = parseInt(lowStockThreshold) || 10;
    let totalInventoryValue = 0;
    let totalPurchaseValue = 0;
    const lowStockItems = [];
    const outOfStockItems = [];

    const itemValuations = items.map(item => {
      const sellingValue = parseFloat(item.Selling_Price) * parseFloat(item.Current_Stock);
      const purchaseValue = parseFloat(item.Purchase_Price) * parseFloat(item.Current_Stock);
      const profit = sellingValue - purchaseValue;

      totalInventoryValue += sellingValue;
      totalPurchaseValue += purchaseValue;

      // Track low/out of stock items
      if (parseFloat(item.Current_Stock) === 0) {
        outOfStockItems.push({
          Item_ID: item.Item_ID,
          Name: item.Name,
          Unit: item.Unit
        });
      } else if (parseFloat(item.Current_Stock) < threshold) {
        lowStockItems.push({
          Item_ID: item.Item_ID,
          Name: item.Name,
          Current_Stock: parseFloat(item.Current_Stock),
          Unit: item.Unit
        });
      }

      return {
        Item_ID: item.Item_ID,
        Name: item.Name,
        Unit: item.Unit,
        Current_Stock: parseFloat(item.Current_Stock),
        Purchase_Price: parseFloat(item.Purchase_Price),
        Selling_Price: parseFloat(item.Selling_Price),
        Inventory_Value: parseFloat(sellingValue.toFixed(2)),
        Purchase_Value: parseFloat(purchaseValue.toFixed(2)),
        Profit: parseFloat(profit.toFixed(2))
      };
    });

    const totalProfit = totalInventoryValue - totalPurchaseValue;

    res.json({
      Summary: {
        Total_Items: items.length,
        Total_Inventory_Value: parseFloat(totalInventoryValue.toFixed(2)),
        Total_Purchase_Value: parseFloat(totalPurchaseValue.toFixed(2)),
        Total_Profit: parseFloat(totalProfit.toFixed(2))
      },
      Warnings: {
        Low_Stock_Threshold: threshold,
        Low_Stock_Items: lowStockItems,
        Out_Of_Stock_Items: outOfStockItems,
        Total_Low_Stock: lowStockItems.length,
        Total_Out_Of_Stock: outOfStockItems.length
      },
      Items: itemValuations
    });
  } catch (error) {
    console.log("Error in getInventoryValuation controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Soft delete item
const deleteItem = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { itemId } = req.params;

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Find item
    const item = await Item.findOne({
      where: {
        Item_ID: itemId,
        Company_ID: company.Company_ID,
        is_deleted: false
      }
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Soft delete the item
    item.is_deleted = true;
    await item.save();

    res.json({
      message: "Item deleted successfully",
      Item_ID: item.Item_ID
    });
  } catch (error) {
    console.log("Error in deleteItem controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  adjustStock,
  getInventoryValuation,
  deleteItem
};