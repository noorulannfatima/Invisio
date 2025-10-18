// controllers/partyController.js
const { Company, Party } = require('../models');
const { Op } = require('sequelize');

// Create a new party
const createParty = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { Name, Type, Email, Mobile_Number, Address, GST_Number } = req.body;

    // Validate input
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

    // Validate email if provided
    if (Email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(Email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
    }

    // Validate mobile number if provided
    if (Mobile_Number && (Mobile_Number.length < 10 || Mobile_Number.length > 20)) {
      return res.status(400).json({ message: "Mobile number must be between 10 and 20 characters" });
    }

    // Get user's company
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
        Name,
        is_deleted: false
      }
    });

    if (partyExists) {
      return res.status(400).json({ message: "Party with this name already exists for your company" });
    }

    // Create new party
    const party = await Party.create({
      Company_ID: company.Company_ID,
      Name,
      Type,
      Email: Email || null,
      Mobile_Number: Mobile_Number || null,
      Address: Address || null,
      GST_Number: GST_Number || null,
      is_deleted: false
    });

    res.status(201).json({
      message: "Party created successfully",
      party: {
        Party_ID: party.Party_ID,
        Company_ID: party.Company_ID,
        Name: party.Name,
        Type: party.Type,
        Email: party.Email,
        Mobile_Number: party.Mobile_Number,
        Address: party.Address,
        GST_Number: party.GST_Number,
        createdAt: party.createdAt,
        updatedAt: party.updatedAt
      }
    });
  } catch (error) {
    console.log("Error in createParty controller", error.message);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => e.message)
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

    // Search by name or email if provided
    if (search) {
      where[Op.or] = [
        { Name: { [Op.iLike]: `%${search}%` } },
        { Email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const parties = await Party.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      count: parties.length,
      parties
    });
  } catch (error) {
    console.log("Error in getAllParties controller", error.message);
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

    res.json(party);
  } catch (error) {
    console.log("Error in getPartyById controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Update party details
const updateParty = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { partyId } = req.params;
    const { Name, Type, Email, Mobile_Number, Address, GST_Number } = req.body;

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
    if (Name !== undefined) {
      if (Name.length < 2 || Name.length > 100) {
        return res.status(400).json({ message: "Party name must be between 2 and 100 characters" });
      }

      // Check if new name already exists for this company
      const nameExists = await Party.findOne({
        where: {
          Company_ID: company.Company_ID,
          Name,
          Party_ID: { [Op.ne]: partyId },
          is_deleted: false
        }
      });

      if (nameExists) {
        return res.status(400).json({ message: "Party with this name already exists for your company" });
      }

      party.Name = Name;
    }

    // Validate and update type if provided
    if (Type !== undefined) {
      const validTypes = ['Customer', 'Supplier', 'Both'];
      if (!validTypes.includes(Type)) {
        return res.status(400).json({ message: "Type must be 'Customer', 'Supplier', or 'Both'" });
      }
      party.Type = Type;
    }

    // Validate and update email if provided
    if (Email !== undefined) {
      if (Email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(Email)) {
          return res.status(400).json({ message: "Invalid email format" });
        }
      }
      party.Email = Email || null;
    }

    // Validate and update mobile number if provided
    if (Mobile_Number !== undefined) {
      if (Mobile_Number && (Mobile_Number.length < 10 || Mobile_Number.length > 20)) {
        return res.status(400).json({ message: "Mobile number must be between 10 and 20 characters" });
      }
      party.Mobile_Number = Mobile_Number || null;
    }

    // Update address if provided
    if (Address !== undefined) {
      party.Address = Address || null;
    }

    // Update GST number if provided
    if (GST_Number !== undefined) {
      party.GST_Number = GST_Number || null;
    }

    await party.save();

    res.json({
      message: "Party updated successfully",
      party: {
        Party_ID: party.Party_ID,
        Company_ID: party.Company_ID,
        Name: party.Name,
        Type: party.Type,
        Email: party.Email,
        Mobile_Number: party.Mobile_Number,
        Address: party.Address,
        GST_Number: party.GST_Number,
        createdAt: party.createdAt,
        updatedAt: party.updatedAt
      }
    });
  } catch (error) {
    console.log("Error in updateParty controller", error.message);

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
    console.log("Error in deleteParty controller", error.message);
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