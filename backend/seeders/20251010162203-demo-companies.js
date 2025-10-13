'use strict';
const { Op } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Fetch the Sequelize instance to use model lookups
    const User = queryInterface.sequelize.models.User; 
    
    // 2. Find the actual User_ID values for the usernames we seeded
    const users = await queryInterface.sequelize.query(
      `SELECT "User_ID", "Username" FROM "users" WHERE "Username" IN ('john_doe', 'jane_smith', 'bob_wilson', 'charlie_davis');`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Map the usernames to their actual User_IDs
    const userIdMap = users.reduce((acc, user) => {
      acc[user.Username] = user.User_ID;
      return acc;
    }, {});

    // 3. Insert the companies using the retrieved IDs
    await queryInterface.bulkInsert('companies', [
      {
        User_ID: userIdMap['john_doe'], 
        Name: 'Global Tech Solutions',
        Address: '100 Main St, New York, NY',
        Email: 'contact@globaltech.com',
        is_deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        User_ID: userIdMap['jane_smith'], 
        Name: 'Innovative Designs Co.',
        Address: '45 Second Ave, Seattle, WA',
        Email: 'info@innovativedesigns.co',
        is_deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        User_ID: userIdMap['bob_wilson'], 
        Name: 'Wilson Logistics Group',
        Address: '789 Commerce Way, Miami, FL',
        Email: 'support@wlg.net',
        is_deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        User_ID: userIdMap['charlie_davis'], 
        Name: 'Davis Consulting (DELETED)',
        Address: '33 Fictional Blvd, CA',
        Email: 'old@davisconsult.com',
        is_deleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    // Deletes the specific company records created by this seeder
    await queryInterface.bulkDelete('companies', {
      Name: { 
        [Sequelize.Op.in]: [
          'Global Tech Solutions', 
          'Innovative Designs Co.', 
          'Wilson Logistics Group', 
          'Davis Consulting (DELETED)'
        ]
      }
    }, {});
  }
};