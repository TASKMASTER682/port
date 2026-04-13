// backend/controllers/leadController.js
const Lead = require('../models/Lead');
const { sendWhatsAppNotification } = require('../utils/sendWhatsApp');
const { sendEmailNotification } = require('../utils/sendEmail');

// @desc    Create new lead
// @route   POST /api/leads
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    // Create lead
    const lead = await Lead.create({
      name,
      email,
      phone,
      service,
      message
    });

    // Send notifications (async - don't wait)
    sendWhatsAppNotification('admin', {
      type: 'new_lead',
      leadName: name,
      service: service,
      message: message
    }).catch(err => console.error('WhatsApp notification failed:', err));

    sendEmailNotification('admin', {
      type: 'new_lead',
      leadData: lead
    }).catch(err => console.error('Email notification failed:', err));

    sendEmailNotification('client', {
      type: 'auto_reply',
      email: email,
      name: name
    }).catch(err => console.error('Client email failed:', err));

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating lead',
      error: error.message
    });
  }
};

// @desc    Get all leads
// @route   GET /api/leads
exports.getLeads = async (req, res) => {
  try {
    const { status, service, startDate, endDate } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (service) query.service = service;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const leads = await Lead.find(query)
      .populate('partnerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leads',
      error: error.message
    });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('partnerId', 'name email phone');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lead',
      error: error.message
    });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating lead',
      error: error.message
    });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting lead',
      error: error.message
    });
  }
};

// @desc    Get lead statistics
// @route   GET /api/leads/stats/summary
exports.getLeadStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'New' });
    const contactedLeads = await Lead.countDocuments({ status: 'Contacted' });
    const convertedLeads = await Lead.countDocuments({ status: 'Converted' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLeads = await Lead.countDocuments({ 
      createdAt: { $gte: today } 
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalLeads,
        new: newLeads,
        contacted: contactedLeads,
        converted: convertedLeads,
        today: todayLeads
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};