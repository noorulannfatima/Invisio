'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('expenses', {
      Expense_ID: {
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
        allowNull: true,
        references: {
          model: 'parties',
          key: 'Party_ID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // If a Party is deleted, set Party_ID on expense to NULL
      },
      Expense_Date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      Category: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      Amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      Description: {
        type: Sequelize.STRING(255),
        allowNull: true
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
    await queryInterface.dropTable('expenses');
  }
};