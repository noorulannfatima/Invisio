// models/Item.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Item = sequelize.define('Item', {
    Item_ID: {
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
        model: 'companies', // Name of the target table
        key: 'Company_ID'
      }
    },
    Name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    Unit: {
      type: DataTypes.STRING(20), // e.g., 'pcs', 'kg', 'hr'
      allowNull: false
    },
    // ⬇️ MODIFIED: The 'field' property is REMOVED
    Description: {
      type: DataTypes.STRING(255),
      allowNull: true
      // Sequelize will now use 'Description' as the column name
    },
    // ⬆️ END OF MODIFIED SECTION
    Selling_Price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    Purchase_Price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    Current_Stock: {
      type: DataTypes.DECIMAL(10, 3), // Using 3 decimal places for stock quantity
      allowNull: false,
      defaultValue: 0.000
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'items',
    timestamps: true,
    underscored: false, // Column name in DB will likely be "Description"
    defaultScope: {
      where: {
        is_deleted: false
      }
    }
  });

  return Item;
};