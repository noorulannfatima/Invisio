// models/Transaction.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    Transaction_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    // Foreign Key to the Company table
    Company_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'Company_ID'
      }
    },
    // Foreign Key to the Party table (Customer/Supplier)
    Party_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'parties',
        key: 'Party_ID'
      }
    },
    Date: {
      type: DataTypes.DATEONLY, // Stores only the date (YYYY-MM-DD)
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    Type: {
      type: DataTypes.ENUM('Sale', 'Purchase', 'Estimate'),
      allowNull: false,
      defaultValue: 'Sale'
    },
    Total_Amount: {
      type: DataTypes.DECIMAL(14, 2), // Larger precision for total amount
      allowNull: false,
      defaultValue: 0.00
    },
    Status: {
      type: DataTypes.ENUM('Pending', 'Completed', 'Cancelled'),
      allowNull: false,
      defaultValue: 'Pending'
    },
    Payment_Mode: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Is_Deleted: { // Using Is_Deleted for consistency with the prompt's casing
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'transactions',
    timestamps: true,
    underscored: false,
    defaultScope: {
      where: {
        Is_Deleted: false
      }
    }
  });

  return Transaction;
};