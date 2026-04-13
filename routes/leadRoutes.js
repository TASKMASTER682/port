// backend/routes/leadRoutes.js
const express = require('express');
const router = express.Router();
const {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  getLeadStats
} = require('../controllers/leadController');

// Lead CRUD routes
router.route('/')
  .post(createLead)
  .get(getLeads);

router.route('/stats/summary')
  .get(getLeadStats);

router.route('/:id')
  .get(getLead)
  .put(updateLead)
  .delete(deleteLead);

module.exports = router;