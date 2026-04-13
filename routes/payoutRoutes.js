// backend/routes/payoutRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPayout,
  getPayouts,
  getPayout,
  updatePayout,
  deletePayout,
  getPayoutStats
} = require('../controllers/payoutController');

// Payout CRUD routes
router.route('/')
  .post(createPayout)
  .get(getPayouts);

router.route('/stats/summary')
  .get(getPayoutStats);

router.route('/:id')
  .get(getPayout)
  .put(updatePayout)
  .delete(deletePayout);

module.exports = router;