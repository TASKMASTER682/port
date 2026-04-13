// backend/routes/settingsRoutes.js
const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  testWhatsApp,
  testEmail,
  uploadResume,
  getResume
} = require('../controllers/settingsController');

// Settings routes
router.route('/')
  .get(getSettings)
  .put(updateSettings);

router.post('/upload-resume', uploadResume);
router.get('/resume', getResume);

router.post('/test-whatsapp', testWhatsApp);
router.post('/test-email', testEmail);

module.exports = router;