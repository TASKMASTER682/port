// backend/routes/partnerRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPartner,
  getPartners,
  getPartner,
  updatePartner,
  deletePartner,
  addReferral
} = require('../controllers/partnerController');

// Partner CRUD routes
router.route('/')
  .post(createPartner)
  .get(getPartners);

router.route('/:id')
  .get(getPartner)
  .put(updatePartner)
  .delete(deletePartner);

router.route('/:id/referral')
  .post(addReferral);

module.exports = router;