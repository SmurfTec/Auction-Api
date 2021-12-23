const express = require('express');
const auctionController = require('../controllers/auctionController');
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();

router
  .route('/')
  .get(auctionController.getFaqs)
  .post(protect, auctionController.createFaqs);

//* only update and delete the auction if its not published yet!

router
  .route('/:id')
  .patch(protect, auctionController.updateFaqs)
  .delete(protect, auctionController.deleteFaqs);

module.exports = router;
