'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      User_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      Username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      Password_Hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      Email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      Mobile_Number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('users', ['Username']);
    await queryInterface.addIndex('users', ['Email']);
    await queryInterface.addIndex('users', ['Mobile_Number']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};