// models/Party.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Party = sequelize.define('Party', {
    Party_ID: {
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
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    Type: {
      type: DataTypes.ENUM('Customer', 'Supplier', 'Both'),
      allowNull: false,
      defaultValue: 'Customer'
    },
    Mobile: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    Outstanding_Balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    // 👇 ADDED FIELD for soft-deletion
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false 
    }
    // 👆 END OF ADDED FIELD
  }, {
    tableName: 'parties',
    timestamps: true,
    underscored: false,
    // Add default scope to filter out deleted parties
    defaultScope: {
      where: {
        is_deleted: false
      }
    }
  });

  return Party;
};