// backend/models/Blog.js
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    default: ""
  },
  coverImage: {
    type: String,
    default: ""
  },
  tags: [{
    type: String
  }],
  author: {
    type: String,
    default: "Sayed"
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  readTime: {
    type: Number,
    default: 5
  }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);