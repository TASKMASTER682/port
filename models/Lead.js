// backend/models/Lead.js
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  service: {
    type: String,
    required: [true, 'Service is required']
  },
  message: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Converted', 'Lost'],
    default: 'New'
  },
  source: {
    type: String,
    enum: ['Website', 'Partner Referral', 'Direct'],
    default: 'Website'
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  convertedValue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);