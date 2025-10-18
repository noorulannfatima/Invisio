//app.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const { sequelize } = require("./models");
// routes
const authRoutes = require("./routes/authRoutes"); 
const companyRoutes = require('./routes/companyRoutes');
const partyRoutes = require("./routes/partyRoutes")
const itemRoutes = require('./routes/itemRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cookieParser());
app.use(cors({
    origin: true, // Allows requests from any origin
    credentials: true, // Important for cookies
}));
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/party', partyRoutes)
app.use('/api/item', itemRoutes)
app.use('/api/transaction', transactionRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);



app.get("/status", (req, res) => {
  console.log("testing")
  res.send("🚀 Server is live and ready!");
});


const startServer = async () => {
  try {
    // Authenticate Sequelize connection
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    app.listen(PORT, () => {
      console.log(`🚀 Server is listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1); 
  }
};

startServer();
