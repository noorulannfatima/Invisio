// models/TransactionLineItem.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TransactionLineItem = sequelize.define('TransactionLineItem', {
    Line_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    // Foreign Key to the Transaction header
    Transaction_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'transactions',
        key: 'Transaction_ID'
      }
    },
    // Foreign Key to the Item master list
    Item_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'items',
        key: 'Item_ID'
      }
    },
    Item_Name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    Quantity: {
      type: DataTypes.DECIMAL(10, 3), // Supports fractional quantities (e.g., 10.5 Kgs)
      allowNull: false,
      defaultValue: 0.000
    },
    Rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    Discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    Line_Total: {
      type: DataTypes.DECIMAL(14, 2), // Larger precision for calculated line total
      allowNull: false,
      defaultValue: 0.00
    }
  }, {
    tableName: 'transaction_line_items', // Use plural, underscored table name
    timestamps: true,
    underscored: false
  });

  return TransactionLineItem;
};