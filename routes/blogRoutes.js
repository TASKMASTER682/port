// backend/routes/blogRoutes.js
const express = require('express');
const router = express.Router();
const { getAllBlogs, getAllBlogsAdmin, getBlogBySlug, createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');

router.get('/', getAllBlogs);
router.get('/admin', getAllBlogsAdmin);
router.post('/', createBlog);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);
router.get('/:slug', getBlogBySlug);

module.exports = router;