const User = require('../models/User');
const Client = require('../models/Client');
const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const WatchList = require('../models/WatchList');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendNotification = require('./NotificationController');
var Twitter = require('twitter');

//* FOR TWEETS
var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_TOKEN_SECRET,
});

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
    select: 'firstName lastName name',
  });

  if (auction.type === 'specific') {
    //* tweet to specific purson
    client.post(
      'statuses/update',
      {
        status: `hello umad @U_Ahmad_11 an auction has been created ${auction.title} starting bid is ${auction.startingPrice}`,
      },
      function (error, tweet, res) {
        if (error) {
          console.log('error', error);
        }
        console.log('tweet', tweet);
        console.log('response', res);
      }
    );
    console.log(' tweet send....');
  }

  res.status(200).json({
    status: 'success',
    auction,
  });
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
  const auctions = await Auction.find({
    user: req.user._id,
    // status: 'inProgress',
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
      new AppError(
        `No Auction found against id ${req.params.id}`,
        404
      )
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
      new AppError(
        `No Auction found against id ${req.params.id}`,
        404
      )
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
  const auction = await Auction.findById(req.params.id);

  if (!auction)
    return next(
      new AppError(
        `No Auction found against id ${req.params.id}`,
        404
      )
    );

  //* payment will be  their

  auction.status = 'claimed';
  await auction.save();

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
      new AppError(
        `Can't find any auction with id ${req.params.id}`,
        404
      )
    );
  }
  if (auction.status !== 'inProgress') {
    return next(
      new AppError(
        `you can Only update the UnPublished auctions`,
        400
      )
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
      new AppError(
        `Can't find any auction with id ${req.params.id}`,
        404
      )
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

  if (auction.type === 'specific') {
    //* tweet to specific purson
    client.post(
      'statuses/update',
      {
        status: `hello umad @U_Ahmad_11 an auction has been created ${auction.title} starting bid is ${auction.startingPrice}`,
      },
      function (error, tweet, res) {
        if (error) {
          console.log('error', error);
        }
        console.log('tweet', tweet);
        console.log('response', res);
      }
    );
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
      new AppError(
        `Can't find any auction with id ${req.params.id}`,
        404
      )
    );
  }

  if (req.user.role === 'user' && auction.status !== 'inProgress') {
    return next(
      new AppError(`You Can Only delete UnPublished auctions`, 400)
    );
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
      new AppError(
        `No Auction found against id ${req.params.id}`,
        404
      )
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
      new AppError(
        `No Auction found against id ${req.params.id}`,
        404
      )
    );

  // * Check if Auction is already in watchlist
  let alreadyDoc = await WatchList.findOne({
    user: req.user._id,
    auction: id,
  });

  if (alreadyDoc)
    return next(
      new AppError('This auction is already in your watchlist', 400)
    );

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
      new AppError(
        `No Auction found against id ${req.params.id}`,
        404
      )
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
