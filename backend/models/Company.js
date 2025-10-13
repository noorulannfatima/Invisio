// models/Company.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Company = sequelize.define('Company', {
    Company_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    // Foreign Key to the User table
    User_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // NOTE: This reference will be fully defined in models/index.js
      references: {
        model: 'users', // Name of the target table (as defined in the User model's tableName)
        key: 'User_ID'  // Key in the target table
      }
    },
    Name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    Address: {
      type: DataTypes.STRING(255),
      allowNull: true // Assuming address can be nullable
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: true, // Assuming email can be nullable/optional
      validate: {
        isEmail: true
      }
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false // Default to false for soft deletion
    }
  }, {
    tableName: 'companies',
    timestamps: true, // Adds createdAt and updatedAt
    underscored: false,
    // Default scope to automatically filter out soft-deleted records
    defaultScope: {
      where: {
        is_deleted: false
      }
    }
  });

  return Company;
};