// backend/models/Payout.js
const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Failed'],
    default: 'Pending'
  },
  transactionId: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  paidAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
payoutSchema.index({ partnerId: 1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payout', payoutSchema);