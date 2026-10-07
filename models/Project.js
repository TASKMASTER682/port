// backend/models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  icon: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  liveLink: {
    type: String,
    required: true
  },
  // Case-study fields
  type: {
    type: String,
    enum: ['own', 'client'],
    default: 'own'
  },
  clientType: {
    type: String,
    default: ''
  },
  problem: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: ''
  },
  timeline: {
    type: String,
    default: ''
  },
  result: {
    type: String,
    default: ''
  },
  hardProblem: {
    type: String,
    default: ''
  },
  featured: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);