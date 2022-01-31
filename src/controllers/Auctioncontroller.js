const User = require('../models/User');
const Client = require('../models/Client');
const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const WatchList = require('../models/WatchList');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendNotification = require('./NotificationController');
const sendAuctionTweet = require('../services/sendAuctionTweet');
const ClaimRequest = require('../models/ClaimRequests');
const sendNotificationEvent = require('../controllers/NotificationController');

exports.createAuction = catchAsync(async (req, res, next) => {
  const { timeLine } = req.body;
  console.log('timeLine :>> ', timeLine);

  const timeline = new Date();
  timeline.setHours(new Date().getHours() + 24 * timeLine);

  // console.log('timeLine-Date:>> ', timeline.getDate());
  // console.log('timeLine-Day:>> ', timeline.getDay());
  // console.log('timeLine-Month:>> ', timeline.getMonth());
  // console.log('timeLine-Year:>> ', timeline.getFullYear());

  const claimExpiry = new Date(timeline);
  claimExpiry.setHours(new Date().getHours() + 24 * 30);

  // console.log('claimExpiry-Date:>> ', claimExpiry.getDate());
  // console.log('claimExpiry-Day:>> ', claimExpiry.getDay());
  // console.log('claimExpiry-Month:>> ', claimExpiry.getMonth());
  // console.log('claimExpiry-Year:>> ', claimExpiry.getFullYear());

  let publishDate;
  if (req.body.status === 'published') publishDate = new Date();

  const auction = await Auction.create({
    ...req.body,
    user: req.user._id,
    claimExpiry: claimExpiry,
    timeLine: timeline,
    publishDate: publishDate,
  });

  await Auction.populate(auction, { path: 'categories' });
  await Auction.populate(auction, {
    path: 'user',
    model: User,
    select: 'firstName lastName name twitter',
  });

  res.status(200).json({
    status: 'success',
    auction,
  });

  if (auction.type === 'specific' && auction.status === 'published') {
    sendAuctionTweet({
      twitterTarget: auction.twitterTarget,
      title: auction.title,
      startingPrice: auction.startingPrice,
    });
  }
});

exports.getAllAuctions = catchAsync(async (req, res, next) => {
  let auctions = await Auction.find({
    status: { $ne: 'inProgress' },
  }).populate({
    path: 'user',
    model: User,
    select: 'firstName lastName name',
  });

  res.status(200).json({
    status: 'success',
    results: auctions.length,
    auctions,
  });
});

exports.myAuctions = catchAsync(async (req, res, next) => {
  // const auctions = await Auction.find({ user: req.user._id }).populate({
  let query = Auction.find({
    user: req.user._id,
    // status: 'inProgress',
  });

  if (req.query.status) query = query.find({ status: req.query.status });

  query = query.populate({
    path: 'user',
    model: User,
    select: 'firstName lastName name',
  });

  const auctions = await query;

  res.status(200).json({
    status: 'success',
    results: auctions.length,
    auctions,
  });
});

exports.getAuction = catchAsync(async (req, res, next) => {
  const auction = await Auction.findById(req.params.id)
    .populate('bids')
    .populate({
      path: 'user',
      model: User,
      select: 'firstName lastName name',
    });

  if (!auction)
    return next(
      new AppError(`No Auction found against id ${req.params.id}`, 404)
    );

  // console.log('timeLine-Date:>> ', auction.timeLine.getDate());
  // console.log('timeLine-Day:>> ', auction.timeLine.getDay());
  // console.log('timeLine-Month:>> ', auction.timeLine.getMonth());
  // console.log('timeLine-Year:>> ', auction.timeLine.getFullYear());

  // console.log('claimExpiry-Date:>> ', auction.claimExpiry.getDate());
  // console.log('claimExpiry-Day:>> ', auction.claimExpiry.getDay());
  // console.log(
  //   'claimExpiry-Month:>> ',
  //   auction.claimExpiry.getMonth()
  // );
  // console.log(
  //   'claimExpiry-Year:>> ',
  //   auction.claimExpiry.getFullYear()
  // );

  res.status(200).json({
    status: 'success',
    auction,
  });
});

//* publish-Auction
exports.publishAuction = catchAsync(async (req, res, next) => {
  const auction = await Auction.findOne({
    user: req.user._id,
    _id: req.params.id,
  });

  if (!auction)
    return next(
      new AppError(`No Auction found against id ${req.params.id}`, 404)
    );

  auction.status = 'published';
  await auction.save();

  res.status(200).json({
    status: 'success',
    auction,
  });
});

//* ClaimAuction
exports.claimAuction = catchAsync(async (req, res, next) => {
  const { message } = req.body;
  const { auctionId, bidId } = req.params;

  const auction = await Auction.findById(auctionId);

  if (!auction)
    return next(new AppError(`No Auction found against id ${auctionId}`, 404));

  //* Check if user is the targetUser in case of specified auction
  if (
    auction.type === 'specific' &&
    auction.twitterTarget !== req.user.twitterProfile?.username
  )
    return next(
      new AppError('Only Tagged person in the auction can claim', 400)
    );

  // * If auction is specific, then bid is winnerBid
  let bidQuery;
  console.log('auction.winningBid', auction.winningBid);
  if (auction.type === 'specific') bidQuery = Bid.findById(auction.winningBid);
  else bidQuery = Bid.findById(bidId);

  let bid = await bidQuery;
  if (!bid) return next(new AppError(`No Bid found against id ${bidId}`, 404));

  // * If user already exists in claimRequests, then DB will generate cast error
  // * because of compound index in ClaimRequest Schemsa
  const claimRequest = await ClaimRequest.create({
    user: req.user._id,
    message: message,
    auction: auction._id,
    claimBid: bid._id,
  });

  auction.claimRequests = [claimRequest._id, ...auction.claimRequests];
  auction.status = 'claimed';
  await auction.save();

  sendNotificationEvent({
    title: `You got a Claim Request on auction: "${auction.title}".`,
    description: `with message ${message.slice(0, 20)}...`,
    type: 'claimRequest',
    link: `/myauctions/claim-requests/?auction=${auction._id}&claimRequest=${claimRequest._id}`,
    userId: bid.user?._id,
  });

  res.status(200).json({
    status: 'success',
    auction,
  });
});

exports.updateAuction = catchAsync(async (req, res, next) => {
  const auction = await Auction.findOne({
    user: req.user._id,
    _id: req.params.id,
  });

  if (!auction) {
    return next(
      new AppError(`Can't find any auction with id ${req.params.id}`, 404)
    );
  }
  if (auction.status !== 'inProgress') {
    return next(
      new AppError(`you can Only update the UnPublished auctions`, 400)
    );
  }

  let publishDate;
  if (req.body.status === 'published') publishDate = new Date();

  const updateAuction = await Auction.findByIdAndUpdate(
    { _id: req.params.id, status: 'inProgress' },
    {
      ...req.body,
      publishDate: publishDate,
    },
    {
      runValidators: true,
      new: true,
    }
  );

  if (!updateAuction)
    return next(
      new AppError(`Can't find any auction with id ${req.params.id}`, 404)
    );

  await Auction.populate(auction, 'bids');
  await Auction.populate(auction, {
    path: 'user',
    model: User,
    select: 'firstName lastName name',
  });

  res.status(200).json({
    status: 'success',
    auction: updateAuction,
  });

  // * If auction's status changed from inProgress to Published, then sent tweet
  if (
    updateAuction.type === 'specific' &&
    updateAuction.status === 'published'
  ) {
    sendAuctionTweet({
      twitterTarget: updateAuction.twitterTarget,
      title: updateAuction.title,
      startingPrice: updateAuction.startingPrice,
    });
  }
});

exports.deleteAuction = catchAsync(async (req, res, next) => {
  let auction;

  // * Admin Can Delete any Auction, normal user can Delete only his auction
  if (req.user.role === 'admin')
    auction = await Auction.findById(req.params.id);
  else
    auction = await Auction.findOne({
      user: req.user._id,
      _id: req.params.id,
    });

  if (!auction) {
    return next(
      new AppError(`Can't find any auction with id ${req.params.id}`, 404)
    );
  }

  if (req.user.role === 'user' && auction.status !== 'inProgress') {
    return next(new AppError(`You Can Only delete UnPublished auctions`, 400));
  }

  // ! will consider that admin is deleting published auctions
  // * Delete all bids of that auction before deleting that auctino
  const bidPromises = auction.bids.map(async (el) => {
    console.log('el', el);
    return await Bid.findByIdAndDelete(el);
  });

  await Promise.all(bidPromises);

  const deleteAuction = await Auction.findByIdAndDelete({
    _id: req.params.id,
    status: 'inProgress',
  });

  if (!deleteAuction)
    return next(
      new AppError(`No Auction found against id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: 'success',
    auction: deleteAuction,
  });
});

//* WATCHLIST

exports.getmyWatchList = catchAsync(async (req, res, next) => {
  //* return only published ones

  let watchlist = await WatchList.find({
    user: req.user._id,
    // 'auction.status': 'published',
  }).populate({
    path: 'user',
    select: 'firstName lastName name',
  });

  res.status(200).json({
    status: 'success',
    watchlist,
  });
});

exports.addtoWatchList = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const auction = await Auction.findById(id);
  if (!auction)
    return next(
      new AppError(`No Auction found against id ${req.params.id}`, 404)
    );

  // * Check if Auction is already in watchlist
  let alreadyDoc = await WatchList.findOne({
    user: req.user._id,
    auction: id,
  });

  if (alreadyDoc)
    return next(new AppError('This auction is already in your watchlist', 400));

  const watchlist = await WatchList.create({
    user: req.user._id,
    auction: id,
  });

  await WatchList.populate(watchlist, {
    path: 'user',
    select: 'firstName lastName name',
  });

  await WatchList.populate(watchlist, {
    path: 'auction',
    populate: 'bids',
  });

  res.status(200).json({
    status: 'success',
    watchlist,
  });
});

exports.removefromWatchList = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const auction = await Auction.findById(id);
  if (!auction)
    return next(
      new AppError(`No Auction found against id ${req.params.id}`, 404)
    );

  const watchlist = await WatchList.findByIdAndDelete({
    user: req.user._id,
    auction: id,
  });

  res.status(200).json({
    status: 'success',
    watchlist,
  });
});
