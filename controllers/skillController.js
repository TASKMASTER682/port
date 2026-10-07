// backend/controllers/skillController.js
const Skill = require('../models/Skill');
const triggerRevalidate = require('../utils/nextRevalidate');

// Get all skills
exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({ displayOrder: 1 });
    res.json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create skill
exports.createSkill = async (req, res) => {
  try {
    const { name, percentage, color, category, familiar } = req.body;
    
    const skill = new Skill({
      name,
      percentage,
      color: color || "#00f5ff",
      category,
      familiar
    });
    
    await skill.save();
    triggerRevalidate(['/']);
    res.status(201).json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update skill
exports.updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, percentage, color, displayOrder, category, familiar } = req.body;
    
    const skill = await Skill.findByIdAndUpdate(
      id,
      { name, percentage, color, displayOrder, category, familiar },
      { new: true, runValidators: true }
    );
    
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }
    
    triggerRevalidate(['/']);
    res.json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete skill
exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findByIdAndDelete(id);
    
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }
    
    triggerRevalidate(['/']);
    res.json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};