const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const { sequelize } = require("./models");

const authRoutes = require("./routes/authRoutes"); 

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
