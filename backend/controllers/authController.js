// controllers/authController.js (Debug Version)

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper function to set cookie
const setCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  
  res.cookie('token', token, cookieOptions);
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    console.log('📝 Signup request received:', { ...req.body, Password: '***' });
    
    const { Username, Email, Password, Mobile_Number } = req.body;

    // Validate required fields
    if (!Username || !Email || !Password || !Mobile_Number) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
        required: ['Username', 'Email', 'Password', 'Mobile_Number']
      });
    }

    // Check if user already exists (use unscoped to check deleted users too)
    console.log('🔍 Checking for existing user...');
    const existingUser = await User.unscoped().findOne({
      where: {
        [Op.or]: [
          { Email },
          { Username },
          { Mobile_Number }
        ]
      }
    });

    if (existingUser) {
      let field = 'User';
      if (existingUser.Email === Email) field = 'Email';
      else if (existingUser.Username === Username) field = 'Username';
      else if (existingUser.Mobile_Number === Mobile_Number) field = 'Mobile number';
      
      console.log(`❌ ${field} already exists`);
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const Password_Hash = await bcrypt.hash(Password, salt);

    // Create user
    console.log('👤 Creating user...');
    const user = await User.create({
      Username,
      Email,
      Password_Hash,
      Mobile_Number,
      is_deleted: false // Explicitly set to false
    });

    console.log('✅ User created:', user.User_ID);

    // Generate token
    const token = generateToken(user.User_ID);
    console.log('🎫 Token generated');

    // Set cookie
    setCookie(res, token);
    console.log('🍪 Cookie set');

    // Send response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          User_ID: user.User_ID,
          Username: user.Username,
          Email: user.Email,
          Mobile_Number: user.Mobile_Number,
          is_deleted: user.is_deleted
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    console.log('🔐 Login request received for:', req.body.login);
    
    const { login, Password } = req.body;

    // Validate required fields
    if (!login || !Password) {
      console.log('❌ Missing login or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide login credentials and password'
      });
    }

    // Find user by Email, Username, or Mobile_Number
    console.log('🔍 Finding user...');
    const user = await User.unscoped().findOne({
      where: {
        [Op.or]: [
          { Email: login },
          { Username: login },
          { Mobile_Number: login }
        ]
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ User found:', user.User_ID, 'is_deleted:', user.is_deleted);

    // Check if user is deleted
    if (user.is_deleted) {
      console.log('❌ User account is deleted');
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    console.log('🔐 Verifying password...');
    const isPasswordValid = await bcrypt.compare(Password, user.Password_Hash);

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ Password valid');

    // Generate token
    const token = generateToken(user.User_ID);
    console.log('🎫 Token generated');

    // Set cookie
    setCookie(res, token);
    console.log('🍪 Cookie set');

    // Send response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          User_ID: user.User_ID,
          Username: user.Username,
          Email: user.Email,
          Mobile_Number: user.Mobile_Number,
          is_deleted: user.is_deleted
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    console.log('👋 Logout request received');
    
    // Clear the cookie
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
    });

    console.log('✅ Logged out successfully');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getUser = async (req, res) => {
  try {
    console.log('👤 Get user request for:', req.user?.userId);
    
    // req.user is set by the auth middleware
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['Password_Hash'] }
    });

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User found:', user.User_ID);

    res.status(200).json({
      success: true,
      data: {
        user: {
          User_ID: user.User_ID,
          Username: user.Username,
          Email: user.Email,
          Mobile_Number: user.Mobile_Number,
          is_deleted: user.is_deleted,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};