const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require('../models'); 

//Generate JWT access and refresh tokens for a user
const generateTokens = (userId) => {
  // Generate short-lived access token (15 minutes)
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  // Generate long-lived refresh token (7 days)
  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};
// Set HTTP-only cookies for access and refresh tokens
const setCookies = (res, accessToken, refreshToken) => {
  // Set access token cookie (15 minutes)
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  
  // Set refresh token cookie (7 days)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
// Register a new user 
const signup = async (req, res) => {
  const { Email, Password, Username, Mobile_Number } = req.body;
  try {
    // Validate input
    if (!Email || !Password || !Username || !Mobile_Number) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate username length
    if (Username.length < 3 || Username.length > 50) {
      return res.status(400).json({ message: "Username must be between 3 and 50 characters" });
    }

    // Validate mobile number length
    if (Mobile_Number.length < 10 || Mobile_Number.length > 20) {
      return res.status(400).json({ message: "Mobile number must be between 10 and 20 characters" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ 
      where: { Email },
      paranoid: false // Check even soft-deleted users
    });

    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Check if username already exists
    const usernameExists = await User.findOne({ 
      where: { Username },
      paranoid: false
    });

    if (usernameExists) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Check if mobile number already exists
    const mobileExists = await User.findOne({ 
      where: { Mobile_Number },
      paranoid: false
    });

    if (mobileExists) {
      return res.status(400).json({ message: "Mobile number already registered" });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const Password_Hash = await bcrypt.hash(Password, salt);

    // Create new user
    const user = await User.create({ 
      Username, 
      Email, 
      Password_Hash, 
      Mobile_Number 
    });

    // Generate authentication tokens
    const { accessToken, refreshToken } = generateTokens(user.User_ID);

    // Set cookies and return user data
    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      User_ID: user.User_ID,
      Username: user.Username,
      Email: user.Email,
      Mobile_Number: user.Mobile_Number,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors.map(e => e.message) 
      });
    }
    
    res.status(500).json({ message: error.message });
  }
};
// Authenticate existing user
const login = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    // Validate input
    if (!Email || !Password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email (only non-deleted users due to defaultScope)
    const user = await User.findOne({ where: { Email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(Password, user.Password_Hash);

    if (isPasswordValid) {
      const { accessToken, refreshToken } = generateTokens(user.User_ID);
      setCookies(res, accessToken, refreshToken);

      res.json({
        User_ID: user.User_ID,
        Username: user.Username,
        Email: user.Email,
        Mobile_Number: user.Mobile_Number,
      });
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: error.message });
  }
};
// Logout user and clear cookies 
const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
//Refresh access token using refresh token
const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Verify user still exists and is not deleted
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId }, 
      process.env.JWT_SECRET, 
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.log("Error in refreshToken controller", error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    
    // Return user data without password hash
    res.json({
      User_ID: user.User_ID,
      Username: user.Username,
      Email: user.Email,
      Mobile_Number: user.Mobile_Number,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.log("Error in getUserProfile controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = {
  signup,
  login,
  logout,
  refreshToken,
  getUserProfile,
};
