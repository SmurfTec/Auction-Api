const express = require('express');
const auctionController = require('../controllers/auctionController');
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();

router
  .route('/')
  .get(auctionController.getAllAuctions) //* only published/live One's or
  .post(protect, auctionController.createAuction);

router
  .route('/publish')
  .patch(protect, auctionController.publishAuction);

//* claim Auction
router.route('/claim').patch(protect, auctionController.claimAuction);

router
  .route('/watchlist')
  .get(protect, auctionController.getmyWatchList);

//* only update and delete the auction if its not published yet
router
  .route('/:id')
  .patch(protect, auctionController.updateAuction)
  .delete(protect, auctionController.deleteAuction);

//* Auction will be autmatically remove when its archived or completed

router
  .route('/:id/watchlist')
  .post(protect, auctionController.addtoWatchList)
  .delete(protect, auctionController.removefromWatchList);

module.exports = router;
