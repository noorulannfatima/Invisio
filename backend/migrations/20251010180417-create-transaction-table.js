'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      Transaction_ID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Company_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'companies',
          key: 'Company_ID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' 
      },
      Party_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'parties',
          key: 'Party_ID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' 
      },
      Date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      Type: {
        type: Sequelize.ENUM('Sale', 'Purchase', 'Estimate'),
        allowNull: false,
        defaultValue: 'Sale'
      },
      Total_Amount: {
        type: Sequelize.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      Status: {
        type: Sequelize.ENUM('Pending', 'Completed', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Pending'
      },
      Payment_Mode: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      Is_Deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
  }
};