'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('items', {
      Item_ID: {
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
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      Unit: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      // Note: Sequelize uses 'field' to map model attribute to column name
      Replaced_Code: { 
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      Selling_Price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      Purchase_Price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      Current_Stock: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0.000
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
    await queryInterface.dropTable('items');
  }
};