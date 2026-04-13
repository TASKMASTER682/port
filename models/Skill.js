// backend/models/Skill.js
const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  color: {
    type: String,
    default: "#00f5ff"
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);