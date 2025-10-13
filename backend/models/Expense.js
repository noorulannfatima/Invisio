// models/Expense.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Expense = sequelize.define('Expense', {
    Expense_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    // Foreign Key to the Company table (Required)
    Company_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'Company_ID'
      }
    },
    // Foreign Key to the Party table (Optional, for vendor/supplier)
    Party_ID: {
      type: DataTypes.INTEGER,
      allowNull: true, // ⬅️ Optional field
      references: {
        model: 'parties',
        key: 'Party_ID'
      }
    },
    Date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'Expense_Date', // Use a more explicit DB column name
      defaultValue: DataTypes.NOW
    },
    Category: {
      type: DataTypes.STRING(100), // e.g., 'Rent', 'Utilities', 'Salaries'
      allowNull: false
    },
    Amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    Description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Payment_Mode: {
      type: DataTypes.STRING(50), // e.g., 'Cash', 'Credit Card', 'Bank'
      allowNull: true
    },
    Is_Deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'expenses',
    timestamps: true,
    underscored: false,
    defaultScope: {
      where: {
        Is_Deleted: false
      }
    }
  });

  return Expense;
};