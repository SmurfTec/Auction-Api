const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const sendNotificationEvent = require('./NotificationController');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

//* BID
exports.createBid = catchAsync(async (req, res, next) => {
  const { biddingPrice } = req.body;
  const { id } = req.params;

  const auction = await Auction.findById(id).populate('bids');
  if (!auction) {
    return next(new AppError(`Can't find any auction with id ${id}`, 404));
  }

  if (biddingPrice <= auction.startingPrice) {
    return next(new AppError(`Bid must be greater than startingPrice`, 400));
  }

  const check = auction.bids.find((bid) => bid.biddingPrice >= biddingPrice);
  if (check) {
    return next(new AppError(`Bid must be greater than last bid`, 400));
  }

  const bid = await Bid.create({
    user: req.user._id,
    biddingPrice,
  });

  auction.bids.unshift(bid._id);
  await auction.save();
  await Auction.populate(auction, 'bids');
  await Auction.populate(auction, {
    path: 'user',
    select: 'firstName lastName name',
  });

  res.status(200).json({
    status: 'success',
    auction,
  });

  //* send notificaiton to staffers
  sendNotificationEvent({
    title: `New Bid made on your auction ${auction.title}`,
    description: `at amount ${biddingPrice}`,
    type: 'bid',
    link: `/auctionDetails/${auction._id}`,
    userId: auction.user._id,
  });
  const { io } = require('../server');
  io.sockets.emit('newBid', { updatedAuction: auction });
});
