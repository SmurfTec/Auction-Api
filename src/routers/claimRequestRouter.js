const express = require('express');
const claimRequestController = require('../controllers/ClaimRequstController');
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();

router.use(protect);

router.get('/', restrictTo('admin'), claimRequestController.getMyClaimRequests);
router.get('/me', claimRequestController.getMyClaimRequests);

router.patch('/:id/:status', claimRequestController.handleStatus);

router.post(
  '/:id/sendPaymentRequest',
  claimRequestController.createPaymentRequest
);

router.patch(
  '/:id/handlePaymentRequest',
  claimRequestController.handlePaymentRequest
);

module.exports = router;
