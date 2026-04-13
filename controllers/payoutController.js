// backend/controllers/payoutController.js
const Payout = require('../models/Payout');
const Partner = require('../models/Partner');
const { sendWhatsAppNotification } = require('../utils/sendWhatsApp');
const { sendEmailNotification } = require('../utils/sendEmail');

// @desc    Create new payout
// @route   POST /api/payouts
exports.createPayout = async (req, res) => {
  try {
    const { partnerId, amount, notes } = req.body;

    // Verify partner exists
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Check if partner has enough outstanding commission
    if (partner.outstandingCommission < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient outstanding commission'
      });
    }

    // Create payout
    const payout = await Payout.create({
      partnerId,
      amount,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Payout created successfully',
      data: payout
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating payout',
      error: error.message
    });
  }
};

// @desc    Get all payouts
// @route   GET /api/payouts
exports.getPayouts = async (req, res) => {
  try {
    const { status, partnerId } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (partnerId) query.partnerId = partnerId;

    const payouts = await Payout.find(query)
      .populate('partnerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payouts.length,
      data: payouts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payouts',
      error: error.message
    });
  }
};

// @desc    Get single payout
// @route   GET /api/payouts/:id
exports.getPayout = async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id)
      .populate('partnerId', 'name email phone bankDetails');

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payout
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payout',
      error: error.message
    });
  }
};

// @desc    Update payout status
// @route   PUT /api/payouts/:id
exports.updatePayout = async (req, res) => {
  try {
    const { status, transactionId, notes } = req.body;
    
    const payout = await Payout.findById(req.params.id);

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    // Update payout
    payout.status = status || payout.status;
    payout.transactionId = transactionId || payout.transactionId;
    payout.notes = notes || payout.notes;

    // If marking as completed
    if (status === 'Completed' && payout.status !== 'Completed') {
      payout.paidAt = new Date();
      
      // Update partner's outstanding commission
      const partner = await Partner.findById(payout.partnerId);
      if (partner) {
        partner.outstandingCommission -= payout.amount;
        if (partner.outstandingCommission < 0) partner.outstandingCommission = 0;
        await partner.save();
      }

      // Send notification
      sendWhatsAppNotification('partner', {
        type: 'payout_completed',
        amount: payout.amount,
        partnerId: payout.partnerId
      }).catch(err => console.error('WhatsApp notification failed:', err));

      sendEmailNotification('partner', {
        type: 'payout_completed',
        payoutData: payout,
        partner: partner
      }).catch(err => console.error('Email notification failed:', err));
    }

    await payout.save();

    res.status(200).json({
      success: true,
      message: 'Payout updated successfully',
      data: payout
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating payout',
      error: error.message
    });
  }
};

// @desc    Delete payout
// @route   DELETE /api/payouts/:id
exports.deletePayout = async (req, res) => {
  try {
    const payout = await Payout.findByIdAndDelete(req.params.id);

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payout deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting payout',
      error: error.message
    });
  }
};

// @desc    Get payout statistics
// @route   GET /api/payouts/stats/summary
exports.getPayoutStats = async (req, res) => {
  try {
    const totalPayouts = await Payout.countDocuments();
    const pendingPayouts = await Payout.countDocuments({ status: 'Pending' });
    const completedPayouts = await Payout.countDocuments({ status: 'Completed' });
    
    const pendingAmount = await Payout.aggregate([
      { $match: { status: 'Pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const completedAmount = await Payout.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalPayouts,
        pending: pendingPayouts,
        completed: completedPayouts,
        pendingAmount: pendingAmount[0]?.total || 0,
        completedAmount: completedAmount[0]?.total || 0
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