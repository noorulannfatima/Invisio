// models/index.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false, // change to true for SQL debugging
  }
);

// Import models
const User = require("./User")(sequelize);
const Company = require("./Company")(sequelize); 
const Party = require("./Party")(sequelize); 
const Item = require("./Item")(sequelize);
const Transaction = require("./Transaction")(sequelize); 
const TransactionLineItem = require("./TransactionLineItem")(sequelize); 
const Expense = require("./Expense")(sequelize);

// Define associations

// --------------------------------------------------
// 1. USER <--> COMPANY (One-to-One)
// --------------------------------------------------

// A Company belongs to a User (FK: User_ID on Company)
Company.belongsTo(User, {
    foreignKey: 'User_ID',
    as: 'Owner' 
});

// A User has one Company
User.hasOne(Company, {
    foreignKey: 'User_ID',
    as: 'Company' 
});

// --------------------------------------------------
// 2. COMPANY <--> PARTY (One-to-Many) 
// --------------------------------------------------

// A Company has many Parties (FK: Company_ID on Party)
Company.hasMany(Party, {
    foreignKey: 'Company_ID',
    as: 'Parties' 
});

// A Party belongs to one Company
Party.belongsTo(Company, {
    foreignKey: 'Company_ID',
    as: 'Company' 
});

// --------------------------------------------------
// 3. COMPANY <--> ITEM (One-to-Many)
// --------------------------------------------------

// A Company has many Items (FK: Company_ID on Item)
Company.hasMany(Item, {
    foreignKey: 'Company_ID',
    as: 'Items' 
});

// An Item belongs to one Company
Item.belongsTo(Company, {
    foreignKey: 'Company_ID',
    as: 'Company' 
});

// --------------------------------------------------
// 4. COMPANY <--> TRANSACTION (One-to-Many) 
// --------------------------------------------------

// A Company has many Transactions
Company.hasMany(Transaction, {
    foreignKey: 'Company_ID',
    as: 'Transactions'
});

// A Transaction belongs to one Company
Transaction.belongsTo(Company, {
    foreignKey: 'Company_ID',
    as: 'Company'
});

// --------------------------------------------------
// 5. PARTY <--> TRANSACTION (One-to-Many) 
// --------------------------------------------------

// A Party can be associated with many Transactions (as Customer or Supplier)
Party.hasMany(Transaction, {
    foreignKey: 'Party_ID',
    as: 'Transactions'
});

// A Transaction belongs to one Party
Transaction.belongsTo(Party, {
    foreignKey: 'Party_ID',
    as: 'Party'
});

// --------------------------------------------------
// 6. TRANSACTION <--> TRANSACTION LINE ITEM (One-to-Many) 
// --------------------------------------------------

// A Transaction has many Line Items
Transaction.hasMany(TransactionLineItem, {
    foreignKey: 'Transaction_ID',
    as: 'Line_Items',
    onDelete: 'CASCADE' // If the header is deleted, delete all line items
});

// A Transaction Line Item belongs to one Transaction
TransactionLineItem.belongsTo(Transaction, {
    foreignKey: 'Transaction_ID',
    as: 'Transaction'
});

// A Transaction Line Item belongs to one Item
TransactionLineItem.belongsTo(Item, {
    foreignKey: 'Item_ID',
    as: 'Item_Master'
});

// --------------------------------------------------
// 7. COMPANY <--> EXPENSE (One-to-Many) 
// --------------------------------------------------

// A Company has many Expenses
Company.hasMany(Expense, {
    foreignKey: 'Company_ID',
    as: 'Expenses'
});

// An Expense belongs to one Company
Expense.belongsTo(Company, {
    foreignKey: 'Company_ID',
    as: 'Company'
});

// --------------------------------------------------
// 8. PARTY <--> EXPENSE (Optional Association) 
// --------------------------------------------------

// A Party can be optionally associated with many Expenses (as the vendor)
Party.hasMany(Expense, {
    foreignKey: 'Party_ID',
    as: 'Vendor_Expenses'
});

// An Expense belongs optionally to one Party
Expense.belongsTo(Party, {
    foreignKey: 'Party_ID',
    as: 'Vendor'
});


module.exports = {
  sequelize,
  User,
  Company,
  Party,
  Item,
  Transaction,
  TransactionLineItem,
  Expense, 
};