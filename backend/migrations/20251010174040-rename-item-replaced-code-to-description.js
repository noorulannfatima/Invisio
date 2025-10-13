'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Renames the column from the old name ('Replaced_Code') to the new name ('Description')
    await queryInterface.renameColumn('items', 'Replaced_Code', 'Description');
  },

  async down (queryInterface, Sequelize) {
    // Reverts the column name back if you ever need to undo this migration
    await queryInterface.renameColumn('items', 'Description', 'Replaced_Code');
  }
};