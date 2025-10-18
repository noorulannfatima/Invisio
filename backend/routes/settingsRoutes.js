// routes/settingsRoutes.js
const express = require('express');
const multer = require('multer');
const {
  getSettings,
  updateInvoiceSettings,
  backupDatabase,
  restoreData,
  getNextInvoiceNumber
} = require('../controllers/settingsController');
const { protectRoute } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure multer for file uploads (for restore)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Only accept JSON files
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'));
    }
  }
});

// All settings routes require authentication
router.use(protectRoute);

// GET /api/settings - Get all company settings
router.get('/', getSettings);

// PUT /api/settings/invoice - Update invoice settings (prefix, numbering, GST)
router.put('/invoice', updateInvoiceSettings);

// GET /api/settings/backup - Download backup of entire company data
router.get('/backup', backupDatabase);

// POST /api/settings/restore - Restore data from backup file
router.post('/restore', upload.single('backupFile'), restoreData);

// GET /api/settings/next-invoice-number - Get next invoice number and increment counter
router.get('/next-invoice-number', getNextInvoiceNumber);

module.exports = router;