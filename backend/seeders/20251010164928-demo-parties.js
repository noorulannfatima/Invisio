'use strict';
const { Op } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    // 1. Fetch the ID of an existing company to link the parties to
    const companies = await queryInterface.sequelize.query(
      `SELECT "Company_ID" FROM "companies" LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (!companies.length) {
        console.log("No companies found. Skipping party seeding.");
        return; 
    }

    const companyId = companies[0].Company_ID;

    // 2. Insert the parties using the retrieved Company_ID
    await queryInterface.bulkInsert('parties', [
      {
        Company_ID: companyId,
        Name: 'Acme Hardware Store',
        Type: 'Customer',
        Mobile: '+923001111111',
        Outstanding_Balance: 550.50,
        is_deleted: false, // ⬅️ ADDED
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        Company_ID: companyId,
        Name: 'Global Raw Materials Inc.',
        Type: 'Supplier',
        Mobile: '+923002222222',
        Outstanding_Balance: -1200.00,
        is_deleted: false, // ⬅️ ADDED
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        Company_ID: companyId,
        Name: 'Biz Services (Deleted)',
        Type: 'Both',
        Mobile: '+923003333333',
        Outstanding_Balance: 0.00,
        is_deleted: true, // ⬅️ Example of a soft-deleted record
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('parties', {
      Name: {
        [Sequelize.Op.in]: ['Acme Hardware Store', 'Global Raw Materials Inc.', 'Biz Services (Deleted)']
      }
    }, {});
  }
};