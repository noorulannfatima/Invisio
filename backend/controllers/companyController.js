// controllers/companyController.js
const { Company, User } = require('../models');

// Create a new company
const createCompany = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { Name, Address, Email } = req.body;

    // Validate input
    if (!Name) {
      return res.status(400).json({ message: "Company name is required" });
    }

    // Validate name length
    if (Name.length < 2 || Name.length > 100) {
      return res.status(400).json({ message: "Company name must be between 2 and 100 characters" });
    }

    // Validate email format if provided
    if (Email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(Email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
    }

    // Check if user already has an active company
    const existingCompany = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (existingCompany) {
      return res.status(400).json({ message: "User already has an active company" });
    }

    // Check if company name is already taken
    const nameExists = await Company.findOne({
      where: { Name },
      paranoid: false // Check even soft-deleted companies
    });

    if (nameExists) {
      return res.status(400).json({ message: "Company name already exists" });
    }

    // Create new company
    const company = await Company.create({
      User_ID: userId,
      Name,
      Address: Address || null,
      Email: Email || null,
      is_deleted: false
    });

    res.status(201).json({
      message: "Company created successfully",
      company: {
        Company_ID: company.Company_ID,
        User_ID: company.User_ID,
        Name: company.Name,
        Address: company.Address,
        Email: company.Email,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }
    });
  } catch (error) {
    console.log("Error in createCompany controller", error.message);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => e.message)
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Company name already exists" });
    }

    res.status(500).json({ message: error.message });
  }
};

// Get company details for logged-in user
const getMyCompany = async (req, res) => {
  try {
    const userId = req.user.User_ID;

    // Find company for the user
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false },
      include: [{
        model: User,
        as: 'Owner',
        attributes: ['User_ID', 'Username', 'Email', 'Mobile_Number']
      }]
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({
      Company_ID: company.Company_ID,
      User_ID: company.User_ID,
      Name: company.Name,
      Address: company.Address,
      Email: company.Email,
      Owner: company.Owner,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    });
  } catch (error) {
    console.log("Error in getMyCompany controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Update company details
const updateCompany = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { Name, Address, Email } = req.body;

    // Find company for the user
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Verify user is the owner
    if (company.User_ID !== userId) {
      return res.status(403).json({ message: "You are not authorized to update this company" });
    }

    // Validate and update name if provided
    if (Name !== undefined) {
      if (Name.length < 2 || Name.length > 100) {
        return res.status(400).json({ message: "Company name must be between 2 and 100 characters" });
      }

      // Check if new name is already taken by another company
      const nameExists = await Company.findOne({
        where: {
          Name,
          Company_ID: { [require('sequelize').Op.ne]: company.Company_ID }
        },
        paranoid: false
      });

      if (nameExists) {
        return res.status(400).json({ message: "Company name already exists" });
      }

      company.Name = Name;
    }

    // Validate and update address if provided
    if (Address !== undefined) {
      company.Address = Address || null;
    }

    // Validate and update email if provided
    if (Email !== undefined) {
      if (Email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(Email)) {
          return res.status(400).json({ message: "Invalid email format" });
        }
      }
      company.Email = Email || null;
    }

    await company.save();

    res.json({
      message: "Company updated successfully",
      company: {
        Company_ID: company.Company_ID,
        User_ID: company.User_ID,
        Name: company.Name,
        Address: company.Address,
        Email: company.Email,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }
    });
  } catch (error) {
    console.log("Error in updateCompany controller", error.message);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// Soft delete company
const deleteCompany = async (req, res) => {
  try {
    const userId = req.user.User_ID;

    // Find company for the user
    const company = await Company.findOne({
      where: { User_ID: userId, is_deleted: false }
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Verify user is the owner
    if (company.User_ID !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this company" });
    }

    // Soft delete the company
    company.is_deleted = true;
    await company.save();

    res.json({
      message: "Company deleted successfully",
      Company_ID: company.Company_ID
    });
  } catch (error) {
    console.log("Error in deleteCompany controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCompany,
  getMyCompany,
  updateCompany,
  deleteCompany
};