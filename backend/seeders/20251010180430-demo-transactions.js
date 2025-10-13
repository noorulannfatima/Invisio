'use strict';
const { Op } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    // 1. Fetch necessary IDs for FKs
    const company = await queryInterface.sequelize.query(
      `SELECT "Company_ID" FROM "companies" LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const party = await queryInterface.sequelize.query(
      `SELECT "Party_ID" FROM "parties" WHERE "Type" = 'Customer' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (!company.length || !party.length) {
        console.log("Missing Company or Customer Party. Skipping transaction seeding.");
        return; 
    }

    const companyId = company[0].Company_ID;
    const partyId = party[0].Party_ID;

    // 2. Insert the demo transactions
    await queryInterface.bulkInsert('transactions', [
      {
        Company_ID: companyId,
        Party_ID: partyId,
        Date: new Date(),
        Type: 'Sale',
        Total_Amount: 550.50,
        Status: 'Completed',
        Payment_Mode: 'Bank Transfer',
        Is_Deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        Company_ID: companyId,
        Party_ID: partyId,
        Date: new Date(Date.now() - 86400000), // Yesterday
        Type: 'Estimate',
        Total_Amount: 1200.00,
        Status: 'Pending',
        Payment_Mode: null,
        Is_Deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        Company_ID: companyId,
        Party_ID: partyId,
        Date: new Date(Date.now() - 172800000), // Two days ago
        Type: 'Purchase',
        Total_Amount: 95.00,
        Status: 'Cancelled',
        Payment_Mode: 'Cash',
        Is_Deleted: true, // Example of a soft-deleted transaction
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    // Note: Deleting all transactions for simplicity in a demo down function
    await queryInterface.bulkDelete('transactions', null, {});
  }
};