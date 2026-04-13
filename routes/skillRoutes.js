// backend/routes/skillRoutes.js
const express = require('express');
const router = express.Router();
const { getAllSkills, createSkill, updateSkill, deleteSkill } = require('../controllers/skillController');

router.get('/', getAllSkills);
router.post('/', createSkill);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);

module.exports = router;