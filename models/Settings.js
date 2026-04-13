// backend/models/Settings.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // WhatsApp Configuration
  whatsappNumber: {
    type: String,
    default: ''
  },
  whatsappToken: {
    type: String,
    default: ''
  },
  
  // Email Configuration
  smtpHost: {
    type: String,
    default: 'smtp.gmail.com'
  },
  smtpPort: {
    type: Number,
    default: 587
  },
  smtpEmail: {
    type: String,
    default: ''
  },
  smtpPassword: {
    type: String,
    default: ''
  },
  
  // Commission Settings
  commissionRate: {
    type: Number,
    default: 15,
    min: 0,
    max: 100
  },
  
  // Email Templates
  clientAutoReply: {
    type: String,
    default: 'Thank you for contacting us! We will get back to you soon.'
  },
  partnerWelcomeEmail: {
    type: String,
    default: 'Welcome to our Partner Program! We are excited to work with you.'
  },
  
  // Notification Settings
  notifyOnNewLead: {
    type: Boolean,
    default: true
  },
  notifyOnNewPartner: {
    type: Boolean,
    default: true
  },

  // Resume/CV (stored as JSON string with base64 data)
  resumeUrl: {
    type: String,
    default: ''
  },

  resumeFileName: {
    type: String,
    default: ''
  },

  // Social Links
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    email: { type: String, default: '' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);