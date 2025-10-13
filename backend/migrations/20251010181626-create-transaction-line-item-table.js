'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('transaction_line_items', {
      Line_ID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Transaction_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'transactions',
          key: 'Transaction_ID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // If Transaction is deleted
      },
      Item_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'items',
          key: 'Item_ID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // Prevent deleting Item if still used in a transaction
      },
      Item_Name: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      Quantity: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0.000
      },
      Rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      Discount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      Line_Total: {
        type: Sequelize.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0.00
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
    await queryInterface.dropTable('transaction_line_items');
  }
};