// backend/controllers/partnerController.js
const Partner = require('../models/Partner');
const { sendWhatsAppNotification } = require('../utils/sendWhatsApp');
const { sendEmailNotification } = require('../utils/sendEmail');

// @desc    Create new partner
// @route   POST /api/partners
exports.createPartner = async (req, res) => {
  try {
    const { name, email, phone, experience } = req.body;

    // Check if partner already exists
    const existingPartner = await Partner.findOne({ email });
    if (existingPartner) {
      return res.status(400).json({
        success: false,
        message: 'Partner with this email already exists'
      });
    }

    // Create partner
    const partner = await Partner.create({
      name,
      email,
      phone,
      experience
    });

    // Send notifications (async - don't wait)
    sendWhatsAppNotification('admin', {
      type: 'new_partner',
      partnerName: name,
      email: email
    }).catch(err => console.error('WhatsApp notification failed:', err));

    sendEmailNotification('admin', {
      type: 'new_partner',
      partnerData: partner
    }).catch(err => console.error('Admin email failed:', err));

    sendEmailNotification('partner', {
      type: 'welcome',
      email: email,
      name: name
    }).catch(err => console.error('Partner email failed:', err));

    res.status(201).json({
      success: true,
      message: 'Partner created successfully',
      data: partner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating partner',
      error: error.message
    });
  }
};

// @desc    Get all partners
// @route   GET /api/partners
exports.getPartners = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const partners = await Partner.find(query).sort({ totalEarned: -1 });

    res.status(200).json({
      success: true,
      count: partners.length,
      data: partners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching partners',
      error: error.message
    });
  }
};

// @desc    Get single partner
// @route   GET /api/partners/:id
exports.getPartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.status(200).json({
      success: true,
      data: partner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching partner',
      error: error.message
    });
  }
};

// @desc    Update partner
// @route   PUT /api/partners/:id
exports.updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Partner updated successfully',
      data: partner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating partner',
      error: error.message
    });
  }
};

// @desc    Delete partner
// @route   DELETE /api/partners/:id
exports.deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Partner deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting partner',
      error: error.message
    });
  }
};

// @desc    Add referral to partner
// @route   POST /api/partners/:id/referral
exports.addReferral = async (req, res) => {
  try {
    const { amount } = req.body;
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Get commission rate from settings (default 15%)
    const commissionRate = 15;
    const commission = (amount * commissionRate) / 100;

    partner.totalReferrals += 1;
    partner.outstandingCommission += commission;
    partner.totalEarned += commission;

    await partner.save();

    res.status(200).json({
      success: true,
      message: 'Referral added successfully',
      data: partner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding referral',
      error: error.message
    });
  }
};