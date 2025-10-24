// controllers/partyController.js
const { Company, Party } = require('../models');
const { Op } = require('sequelize');

// Create a new party
const createParty = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { Name, Type, Mobile, Outstanding_Balance } = req.body;

    // Validate required fields
    if (!Name || !Type) {
      return res.status(400).json({ message: "Party name and type are required" });
    }

    // Validate name length
    if (Name.length < 2 || Name.length > 100) {
      return res.status(400).json({ message: "Party name must be between 2 and 100 characters" });
    }

    // Validate type (Customer, Supplier, or Both)
    const validTypes = ['Customer', 'Supplier', 'Both'];
    if (!validTypes.includes(Type)) {
      return res.status(400).json({ message: "Type must be 'Customer', 'Supplier', or 'Both'" });
    }

    // Validate mobile number if provided
    if (Mobile && (Mobile.length < 10 || Mobile.length > 20)) {
      return res.status(400).json({ message: "Mobile number must be between 10 and 20 characters" });
    }

    // Validate outstanding balance if provided
    if (Outstanding_Balance !== undefined && Outstanding_Balance !== null) {
      const balance = parseFloat(Outstanding_Balance);
      if (isNaN(balance) || balance < 0) {
        return res.status(400).json({ message: "Outstanding balance must be a positive number" });
      }
    }

    // Get user's company (use { paranoid: false } to bypass soft delete filter if needed)
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company to create a party" });
    }

    // Check if party name already exists for this company
    const partyExists = await Party.findOne({
      where: {
        Company_ID: company.Company_ID,
        Name: {
          [Op.iLike]: Name
        },
        is_deleted: false
      }
    });

    if (partyExists) {
      return res.status(400).json({ message: "Party with this name already exists for your company" });
    }

    // Create new party with only the fields that exist in the model
    const party = await Party.create({
      Company_ID: company.Company_ID,
      Name,
      Type,
      Mobile: Mobile || null,
      Outstanding_Balance: Outstanding_Balance ? parseFloat(Outstanding_Balance) : 0,
      is_deleted: false
    });

    res.status(201).json({
      message: "Party created successfully",
      party: {
        Party_ID: party.Party_ID,
        Company_ID: party.Company_ID,
        Name: party.Name,
        Type: party.Type,
        Mobile: party.Mobile,
        Outstanding_Balance: parseFloat(party.Outstanding_Balance ?? 0),
        is_deleted: party.is_deleted,
        createdAt: party.createdAt,
        updatedAt: party.updatedAt
      }
    });
  } catch (error) {
    console.log("Error in createParty controller:", error.message);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => e.message)
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: "A party with this name already exists"
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// Get all parties for user's company
const getAllParties = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { type, search } = req.query;

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

    // Filter by type if provided
    if (type) {
      const validTypes = ['Customer', 'Supplier', 'Both'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid party type" });
      }
      where.Type = type;
    }

    // Search by name if provided
    if (search && search.trim()) {
      where.Name = { [Op.iLike]: `%${search.trim()}%` };
    }

    const parties = await Party.findAll({
      where,
      order: [['createdAt', 'DESC']],
      attributes: ['Party_ID', 'Company_ID', 'Name', 'Type', 'Mobile', 'Outstanding_Balance', 'is_deleted', 'createdAt', 'updatedAt']
    });

    // Convert Outstanding_Balance to number
    const formattedParties = parties.map(party => ({
      ...party.toJSON(),
      Outstanding_Balance: parseFloat(party.Outstanding_Balance) || 0
    }));

    res.json({
      count: formattedParties.length,
      parties: formattedParties
    });
  } catch (error) {
    console.log("Error in getAllParties controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get single party by ID
const getPartyById = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { partyId } = req.params;

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Find party
    const party = await Party.findOne({
      where: {
        Party_ID: partyId,
        Company_ID: company.Company_ID,
        is_deleted: false
      }
    });

    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    res.json({
      ...party.toJSON(),
      Outstanding_Balance: parseFloat(party.Outstanding_Balance) || 0
    });
  } catch (error) {
    console.log("Error in getPartyById controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Update party details
const updateParty = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { partyId } = req.params;
    const { Name, Type, Mobile, Outstanding_Balance } = req.body;

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Find party
    const party = await Party.findOne({
      where: {
        Party_ID: partyId,
        Company_ID: company.Company_ID,
        is_deleted: false
      }
    });

    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    // Validate and update name if provided
    if (Name !== undefined && Name !== null) {
      if (Name.trim().length < 2 || Name.length > 100) {
        return res.status(400).json({ message: "Party name must be between 2 and 100 characters" });
      }

      // Check if new name already exists for this company (excluding current party)
      const nameExists = await Party.findOne({
        where: {
          Company_ID: company.Company_ID,
          Name: {
            [Op.iLike]: Name.trim()
          },
          Party_ID: { [Op.ne]: partyId },
          is_deleted: false
        }
      });

      if (nameExists) {
        return res.status(400).json({ message: "Party with this name already exists for your company" });
      }

      party.Name = Name.trim();
    }

    // Validate and update type if provided
    if (Type !== undefined && Type !== null) {
      const validTypes = ['Customer', 'Supplier', 'Both'];
      if (!validTypes.includes(Type)) {
        return res.status(400).json({ message: "Type must be 'Customer', 'Supplier', or 'Both'" });
      }
      party.Type = Type;
    }

    // Validate and update mobile number if provided
    if (Mobile !== undefined) {
      if (Mobile && (Mobile.length < 10 || Mobile.length > 20)) {
        return res.status(400).json({ message: "Mobile number must be between 10 and 20 characters" });
      }
      party.Mobile = Mobile || null;
    }

    // Validate and update outstanding balance if provided
    if (Outstanding_Balance !== undefined && Outstanding_Balance !== null) {
      const balance = parseFloat(Outstanding_Balance);
      if (isNaN(balance) || balance < 0) {
        return res.status(400).json({ message: "Outstanding balance must be a positive number" });
      }
      party.Outstanding_Balance = balance;
    }

    await party.save();

    res.status(200).json({
      message: "Party updated successfully",
      party: {
        Party_ID: party.Party_ID,
        Company_ID: party.Company_ID,
        Name: party.Name,
        Type: party.Type,
        Mobile: party.Mobile,
        Outstanding_Balance: parseFloat(party.Outstanding_Balance) || 0,
        is_deleted: party.is_deleted,
        createdAt: party.createdAt,
        updatedAt: party.updatedAt
      }
    });
  } catch (error) {
    console.log("Error in updateParty controller:", error.message);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// Soft delete party
const deleteParty = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { partyId } = req.params;

    // Get user's company
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(400).json({ message: "User must have an active company" });
    }

    // Find party
    const party = await Party.findOne({
      where: {
        Party_ID: partyId,
        Company_ID: company.Company_ID,
        is_deleted: false
      }
    });

    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    // Soft delete the party
    party.is_deleted = true;
    await party.save();

    res.json({
      message: "Party deleted successfully",
      Party_ID: party.Party_ID
    });
  } catch (error) {
    console.log("Error in deleteParty controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createParty,
  getAllParties,
  getPartyById,
  updateParty,
  deleteParty
};