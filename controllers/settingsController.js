// backend/controllers/settingsController.js
const Settings = require('../models/Settings');

// @desc    Get settings
// @route   GET /api/settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // If no settings exist, create default
    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
exports.updateSettings = async (req, res) => {
  try {
    // resumeUrl is managed exclusively by upload-resume endpoint (stores JSON blob);
    // never let a plain PUT overwrite it with a filename
    const { resumeUrl, ...payload } = req.body;

    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create new settings if none exist
      settings = await Settings.create(payload);
    } else {
      // Update existing settings
      Object.keys(payload).forEach(key => {
        settings[key] = payload[key];
      });
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
};

// @desc    Test WhatsApp connection
// @route   POST /api/settings/test-whatsapp
exports.testWhatsApp = async (req, res) => {
  try {
    const { sendWhatsAppNotification } = require('../utils/sendWhatsApp');
    
    await sendWhatsAppNotification('test', {
      message: 'Test message from Portfolio CRM'
    });

    res.status(200).json({
      success: true,
      message: 'WhatsApp test message sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'WhatsApp test failed',
      error: error.message
    });
  }
};

// @desc    Test Email connection
// @route   POST /api/settings/test-email
exports.testEmail = async (req, res) => {
  try {
    const { sendEmailNotification } = require('../utils/sendEmail');
    
    await sendEmailNotification('test', {
      message: 'Test email from Portfolio CRM'
    });

    res.status(200).json({
      success: true,
      message: 'Email test sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email test failed',
      error: error.message
    });
  }
};

// @desc    Upload resume/CV
// @route   POST /api/settings/upload-resume
exports.uploadResume = async (req, res) => {
  try {
    const { fileName, fileData, contentType } = req.body;
    
    if (!fileName || !fileData || !contentType) {
      return res.status(400).json({
        success: false,
        message: 'fileName, fileData, and contentType are required'
      });
    }

    const settings = await Settings.findOne();
    
    const resumeData = {
      fileName,
      data: fileData,
      contentType,
      uploadedAt: new Date()
    };
    
    if (settings) {
      settings.resumeUrl = JSON.stringify(resumeData);
      settings.resumeFileName = fileName;
      await settings.save();
    } else {
      await Settings.create({ resumeUrl: JSON.stringify(resumeData), resumeFileName: fileName });
    }

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading resume',
      error: error.message
    });
  }
};

// @desc    Get resume file
// @route   GET /api/settings/resume
exports.getResume = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    
    if (!settings?.resumeUrl) {
      return res.status(404).json({
        success: false,
        message: 'No resume found'
      });
    }

    let resumeData;
    try {
      resumeData = JSON.parse(settings.resumeUrl);
    } catch (parseError) {
      return res.status(404).json({
        success: false,
        message: 'Resume data invalid or corrupted — please re-upload resume'
      });
    }

    if (!resumeData?.data || !resumeData?.contentType) {
      return res.status(404).json({
        success: false,
        message: 'Resume data invalid or corrupted — please re-upload resume'
      });
    }

    res.setHeader('Content-Type', resumeData.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${resumeData.fileName}"`);
    res.send(Buffer.from(resumeData.data, 'base64'));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching resume',
      error: error.message
    });
  }
};