const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const sendNotificationEvent = require('./NotificationController');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

//* BID
exports.createBid = catchAsync(async (req, res, next) => {
  const { biddingPrice, bidBeaten: bidBeatenId } = req.body;
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
  auction.winningPrice = bid.biddingPrice;
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

  // * Send Realtime notifications to auction owner
  const { io } = require('../../server');
  io.sockets.emit('newBid', { updatedAuction: auction });

  //* send Email notificaiton to Auction owner
  sendNotificationEvent({
    title: `New Bid made on your auction ${auction.title}`,
    description: `at amount ${biddingPrice}`,
    type: 'bid',
    link: `/auctionDetails/${auction._id}`,
    userId: auction.user._id,
  });

  //* send notificaiton to bidder jiss ki bid beat hue hai
  if (!bidBeatenId) return;
  const bidBeaten = await Bid.findById(bidBeatenId);
  if (!bidBeaten) return;
  sendNotificationEvent({
    title: `Your bid got beaten on auction: "${auction.title}".`,
    description: `at amount ${biddingPrice}`,
    type: 'bid',
    link: `/auctionDetails/${auction._id}`,
    userId: bidBeaten.user?._id,
  });
});

exports.getBid = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let query;
  if (req.user.role === 'admin') query = Bid.findById(id);
  else
    query = Bid.findOne({
      _id: id,
      user: req.user._id,
    });

  const bid = await query;
  if (!bid) return next(new AppError(`Can't find any bid with id ${id}`, 404));

  res.json({
    status: 'success',
    bid,
  });
});
