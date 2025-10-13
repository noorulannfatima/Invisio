'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('companies', {
      Company_ID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      // Foreign Key Definition
      User_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Name of the target table
          key: 'User_ID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Define how deletion of a user affects the company
      },
      Name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      Address: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      Email: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      is_deleted: {
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
    await queryInterface.dropTable('companies');
  }
};