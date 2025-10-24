// controllers/settingsController.js
const { User, Company, Party, Transaction, Expense } = require('../models');
const bcrypt = require("bcryptjs");


// ========== USER SETTINGS ==========

/**
 * Get user profile settings
 * GET /api/settings/profile
 */
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.User_ID;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['Password_Hash'] }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: user
    });
  } catch (error) {
    console.error("Error in getUserProfile:", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * Update user profile
 * PUT /api/settings/profile
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { Email, Mobile_Number, Username } = req.body;

    // Validate input
    if (!Email && !Mobile_Number && !Username) {
      return res.status(400).json({ message: "Provide at least one field to update" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    if (Email) user.Email = Email;
    if (Mobile_Number) user.Mobile_Number = Mobile_Number;
    if (Username) user.Username = Username;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: user
    });
  } catch (error) {
    console.error("Error in updateUserProfile:", error.message);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Email, Username, or Mobile Number already exists" });
    }
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * Change user password
 * PUT /api/settings/change-password
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All password fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.Password_Hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.Password_Hash = hashedPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Error in changePassword:", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * Delete user account (soft delete)
 * DELETE /api/settings/delete-account
 */
const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required to delete account" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password for security
    const isPasswordValid = await bcrypt.compare(password, user.Password_Hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password is incorrect" });
    }

    // Soft delete user
    user.is_deleted = true;
    await user.save();

    // Also soft delete associated company
    await Company.update(
      { is_deleted: true },
      { where: { User_ID: userId } }
    );

    return res.status(200).json({
      success: true,
      message: "User account deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteUserAccount:", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ========== COMPANY SETTINGS ==========

/**
 * Get company details
 * GET /api/settings/company
 */
const getCompanyDetails = async (req, res) => {
  try {
    const userId = req.user.User_ID;

    const company = await Company.findOne({
      where: { User_ID: userId },
      include: {
        model: User,
        as: 'Owner',
        attributes: { exclude: ['Password_Hash'] }
      }
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Company details retrieved successfully",
      data: company
    });
  } catch (error) {
    console.error("Error in getCompanyDetails:", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * Update company details
 * PUT /api/settings/company
 */
const updateCompanyDetails = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { Name, Address, Email } = req.body;

    // Validate input
    if (!Name && !Address && !Email) {
      return res.status(400).json({ message: "Provide at least one field to update" });
    }

    const company = await Company.findOne({
      where: { User_ID: userId }
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Update fields if provided
    if (Name) company.Name = Name;
    if (Address) company.Address = Address;
    if (Email) company.Email = Email;

    await company.save();

    return res.status(200).json({
      success: true,
      message: "Company details updated successfully",
      data: company
    });
  } catch (error) {
    console.error("Error in updateCompanyDetails:", error.message);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Company name already exists" });
    }
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * Delete company (soft delete)
 * DELETE /api/settings/company
 */
const deleteCompany = async (req, res) => {
  try {
    const userId = req.user.User_ID;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required to delete company" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password for security
    const isPasswordValid = await bcrypt.compare(password, user.Password_Hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password is incorrect" });
    }

    const company = await Company.findOne({
      where: { User_ID: userId }
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Soft delete company
    company.is_deleted = true;
    await company.save();

    return res.status(200).json({
      success: true,
      message: "Company deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteCompany:", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * Get company statistics
 * GET /api/settings/company/stats
 */
const getCompanyStats = async (req, res) => {
  try {
    const userId = req.user.User_ID;

    const company = await Company.findOne({
      where: { User_ID: userId }
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const companyId = company.Company_ID;

    // Get statistics
    const partiesCount = await Party.count({ where: { Company_ID: companyId } });
    const transactionsCount = await Transaction.count({ where: { Company_ID: companyId } });
    const expensesCount = await Expense.count({ where: { Company_ID: companyId } });

    return res.status(200).json({
      success: true,
      message: "Company statistics retrieved successfully",
      data: {
        companyName: company.Name,
        partiesCount,
        transactionsCount,
        expensesCount
      }
    });
  } catch (error) {
    console.error("Error in getCompanyStats:", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  // User settings
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
  // Company settings
  getCompanyDetails,
  updateCompanyDetails,
  deleteCompany,
  getCompanyStats
};