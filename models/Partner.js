// backend/models/Partner.js
const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  experience: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending'],
    default: 'Active'
  },
  totalReferrals: {
    type: Number,
    default: 0
  },
  totalEarned: {
    type: Number,
    default: 0
  },
  outstandingCommission: {
    type: Number,
    default: 0
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String
  }
}, {
  timestamps: true
});

// Index for faster queries
partnerSchema.index({ email: 1 });
partnerSchema.index({ status: 1 });

module.exports = mongoose.model('Partner', partnerSchema);