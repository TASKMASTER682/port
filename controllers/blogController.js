// backend/controllers/blogController.js
const Blog = require('../models/Blog');

// Get all published blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all blogs (including drafts) for admin
exports.getAllBlogsAdmin = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single blog by slug
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, tags, isPublished } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }
    
    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [];
    
    // Extract excerpt from content if not provided
    const plainText = content.replace(/<[^>]*>/g, '');
    const autoExcerpt = excerpt || plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
    
    const blog = new Blog({
      title,
      slug,
      content,
      excerpt: autoExcerpt,
      coverImage,
      tags: tagsArray,
      isPublished: isPublished !== undefined ? isPublished : true
    });
    
    await blog.save();
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update blog
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, coverImage, tags, isPublished } = req.body;
    
    const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [];
    
    // Generate new slug if title changed
    let slug;
    if (title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    const blog = await Blog.findByIdAndUpdate(
      id,
      { 
        ...(title && { title, slug }),
        content, 
        excerpt: excerpt || (content ? content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : ''),
        coverImage, 
        tags: tagsArray, 
        isPublished 
      },
      { new: true, runValidators: true }
    );
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete blog
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    res.json({ success: true, message: 'Blog deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};