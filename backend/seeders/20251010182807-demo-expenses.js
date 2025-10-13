'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    // 1. Fetch necessary IDs for FKs
    const company = await queryInterface.sequelize.query(
      `SELECT "Company_ID" FROM "companies" LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const supplierParty = await queryInterface.sequelize.query(
      `SELECT "Party_ID" FROM "parties" WHERE "Type" IN ('Supplier', 'Both') LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (!company.length) {
        console.log("Missing Company. Skipping expense seeding.");
        return; 
    }

    const companyId = company[0].Company_ID;
    const supplierId = supplierParty.length ? supplierParty[0].Party_ID : null;

    // 2. Insert the demo expenses
    await queryInterface.bulkInsert('expenses', [
      {
        Company_ID: companyId,
        Party_ID: supplierId, // Linked to a supplier
        Expense_Date: new Date(),
        Category: 'Rent',
        Amount: 2500.00,
        Description: 'Office rent for October',
        Payment_Mode: 'Bank Transfer',
        Is_Deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        Company_ID: companyId,
        Party_ID: null, // No specific vendor/party
        Expense_Date: new Date(Date.now() - 86400000 * 5), // 5 days ago
        Category: 'Utilities',
        Amount: 150.55,
        Description: 'Electricity bill payment',
        Payment_Mode: 'Cash',
        Is_Deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        Company_ID: companyId,
        Party_ID: supplierId,
        Expense_Date: new Date(Date.now() - 86400000 * 10), // 10 days ago
        Category: 'Marketing',
        Amount: 450.00,
        Description: 'Ad campaign costs (deleted)',
        Payment_Mode: 'Credit Card',
        Is_Deleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('expenses', null, {});
  }
};