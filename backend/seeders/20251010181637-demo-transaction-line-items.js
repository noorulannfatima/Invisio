'use strict';
const { Op } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    // 1. Fetch necessary IDs for FKs
    const transaction = await queryInterface.sequelize.query(
      `SELECT "Transaction_ID" FROM "transactions" WHERE "Is_Deleted" = false AND "Type" = 'Sale' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const item = await queryInterface.sequelize.query(
      `SELECT "Item_ID", "Name", "Selling_Price" FROM "items" WHERE "is_deleted" = false LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (!transaction.length || !item.length) {
        console.log("Missing valid Transaction or Item. Skipping line item seeding.");
        return; 
    }

    const transactionId = transaction[0].Transaction_ID;
    const itemId = item[0].Item_ID;
    const itemName = item[0].Name;
    const itemRate = parseFloat(item[0].Selling_Price); // Use the item's current selling price

    const quantity1 = 5.000;
    const discount1 = 5.00;
    const lineTotal1 = (quantity1 * itemRate) - discount1;
    
    const quantity2 = 2.500;
    const discount2 = 0.00;
    const lineTotal2 = quantity2 * itemRate;

    // 2. Insert the demo line items
    await queryInterface.bulkInsert('transaction_line_items', [
      {
        Transaction_ID: transactionId,
        Item_ID: itemId,
        Item_Name: itemName,
        Quantity: quantity1,
        Rate: itemRate,
        Discount: discount1,
        Line_Total: lineTotal1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        Transaction_ID: transactionId,
        Item_ID: itemId,
        Item_Name: 'Installation Fee', // Example of a service or second item
        Quantity: quantity2,
        Rate: 50.00, // A custom rate for this item/service
        Discount: discount2,
        Line_Total: lineTotal2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    // Note: This simply deletes all line items for cleanup
    await queryInterface.bulkDelete('transaction_line_items', null, {});
  }
};