// backend/controllers/projectController.js
const Project = require('../models/Project');
const triggerRevalidate = require('../utils/nextRevalidate');

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create project
exports.createProject = async (req, res) => {
  try {
    const { icon, title, description, tags, liveLink, type, clientType, problem, role, timeline, result, hardProblem, featured } = req.body;
    
    // Parse tags from comma-separated string
    const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [];
    
    const project = new Project({
      icon,
      title,
      description,
      tags: tagsArray,
      liveLink,
      type,
      clientType,
      problem,
      role,
      timeline,
      result,
      hardProblem,
      featured
    });
    
    await project.save();
    triggerRevalidate(['/', '/work/[id]']);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { icon, title, description, tags, liveLink, displayOrder, isActive, type, clientType, problem, role, timeline, result, hardProblem, featured } = req.body;
    
    const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [];
    
    const project = await Project.findByIdAndUpdate(
      id,
      { icon, title, description, tags: tagsArray, liveLink, displayOrder, isActive, type, clientType, problem, role, timeline, result, hardProblem, featured },
      { new: true, runValidators: true }
    );
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    triggerRevalidate(['/', '/work/[id]', `/work/${id}`]);
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    triggerRevalidate(['/', '/work/[id]', `/work/${id}`]);
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};