'use strict';
const { Op } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    // 1. Fetch the ID of an existing company to link the items to
    const companies = await queryInterface.sequelize.query(
      `SELECT "Company_ID" FROM "companies" LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (!companies.length) {
        console.log("No companies found. Skipping item seeding.");
        return; 
    }

    const companyId = companies[0].Company_ID;

    // 2. Insert the demo items
    await queryInterface.bulkInsert('items', [
      {
        Company_ID: companyId,
        Name: '4K Ultra Monitor',
        Unit: 'pcs',
        // ⬇️ UPDATED KEY NAME
        Description: 'MON4KU01', 
        // ⬆️ END OF UPDATED KEY
        Selling_Price: 350.99,
        Purchase_Price: 280.50,
        Current_Stock: 50.000,
        is_deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        Company_ID: companyId,
        Name: 'Consulting Service (Hourly)',
        Unit: 'hr',
        // ⬇️ UPDATED KEY NAME
        Description: 'SERVCON01',
        // ⬆️ END OF UPDATED KEY
        Selling_Price: 150.00,
        Purchase_Price: 0.00,
        Current_Stock: 9999.000,
        is_deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        Company_ID: companyId,
        Name: 'Discontinued Keyboard',
        Unit: 'pcs',
        // ⬇️ UPDATED KEY NAME
        Description: 'KEYB-OLD',
        // ⬆️ END OF UPDATED KEY
        Selling_Price: 10.00,
        Purchase_Price: 5.00,
        Current_Stock: 0.000,
        is_deleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    // Note: The down function uses the Name for deletion, so it is unchanged.
    await queryInterface.bulkDelete('items', {
      Name: {
        [Sequelize.Op.in]: ['4K Ultra Monitor', 'Consulting Service (Hourly)', 'Discontinued Keyboard']
      }
    }, {});
  }
};