'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash passwords before inserting
    const salt = await bcrypt.genSalt(10);
    
    await queryInterface.bulkInsert('users', [
      {
        Username: 'john_doe',
        Password_Hash: await bcrypt.hash('password123', salt),
        Email: 'john.doe@example.com',
        Mobile_Number: '+1234567890',
        is_deleted: false, // ⬅️ ADDED is_deleted
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        Username: 'jane_smith',
        Password_Hash: await bcrypt.hash('password456', salt),
        Email: 'jane.smith@example.com',
        Mobile_Number: '+1234567891',
        is_deleted: false, // ⬅️ ADDED is_deleted
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        Username: 'bob_wilson',
        Password_Hash: await bcrypt.hash('password789', salt),
        Email: 'bob.wilson@example.com',
        Mobile_Number: '+1234567892',
        is_deleted: false, // ⬅️ ADDED is_deleted
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        Username: 'alice_brown',
        Password_Hash: await bcrypt.hash('passwordabc', salt),
        Email: 'alice.brown@example.com',
        Mobile_Number: '+1234567893',
        is_deleted: false, // ⬅️ ADDED is_deleted
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        Username: 'charlie_davis',
        Password_Hash: await bcrypt.hash('passworddef', salt),
        Email: 'charlie.davis@example.com',
        Mobile_Number: '+1234567894',
        is_deleted: false, // ⬅️ ADDED is_deleted
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // Use a WHERE clause to only delete the users inserted by this seeder
    await queryInterface.bulkDelete('users', {
      Username: {
        [Sequelize.Op.in]: ['john_doe', 'jane_smith', 'bob_wilson', 'alice_brown', 'charlie_davis']
      }
    }, {});
  }
};