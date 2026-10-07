// backend/controllers/testimonialController.js
const Testimonial = require('../models/Testimonial');
const triggerRevalidate = require('../utils/nextRevalidate');

// Get all active testimonials (public)
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create testimonial
exports.createTestimonial = async (req, res) => {
  try {
    const { name, role, quote, avatar, displayOrder, isActive } = req.body;

    const testimonial = new Testimonial({
      name,
      role,
      quote,
      avatar,
      displayOrder,
      isActive
    });

    await testimonial.save();
    triggerRevalidate(['/']);
    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update testimonial
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, quote, avatar, displayOrder, isActive } = req.body;

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { name, role, quote, avatar, displayOrder, isActive },
      { new: true, runValidators: true }
    );

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    triggerRevalidate(['/']);
    res.json({ success: true, data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    triggerRevalidate(['/']);
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
