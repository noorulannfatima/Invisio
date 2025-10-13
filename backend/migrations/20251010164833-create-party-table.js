'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('parties', {
      Party_ID: {
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
      Name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      Type: {
        type: Sequelize.ENUM('Customer', 'Supplier', 'Both'),
        allowNull: false,
        defaultValue: 'Customer'
      },
      Mobile: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      Outstanding_Balance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      // 👇 ADDED FIELD
      is_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      // 👆 END OF ADDED FIELD
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
    await queryInterface.dropTable('parties');
  }
};