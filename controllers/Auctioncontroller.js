const User = require('../models/User');
const Auction = require('../models/Auction');
const WatchList = require('../models/WatchList');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

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

  const auction = await Auction.create({
    ...req.body,
    user: req.user._id,
    claimExpiry: claimExpiry,
    timeLine: timeline,
  });

  res.status(200).json({
    status: 'success',
    auction,
  });
});

exports.getAllAuctions = catchAsync(async (req, res, next) => {
  let auctions = await Auction.find({ status: 'published' });

  res.status(200).json({
    status: 'success',
    results: auctions.length,
    auctions,
  });
});

exports.myAuctions = catchAsync(async (req, res, next) => {
  const auctions = await Auction.find({ user: req.user._id });

  res.status(200).json({
    status: 'success',
    results: auctions.length,
    auctions,
  });
});

exports.getAuction = catchAsync(async (req, res, next) => {
  const auction = await Auction.findById(req.params.id);

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
  const auction = await Auction.findById({
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
  const auction = await Auction.findById(req.params.id);

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
      new AppError(`you can Only update the inProgress auctions`, 400)
    );
  }

  const updateAuction = await Auction.findByIdAndUpdate(
    { _id: req.params.id, status: 'inProgress' },
    { ...req.body },
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

  res.status(200).json({
    status: 'success',
    auction: updateAuction,
  });
});

exports.deleteAuction = catchAsync(async (req, res, next) => {
  const auction = await Auction.findById(req.params.id);

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
      new AppError(`you can Only delete the inProgress auctions`, 400)
    );
  }

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

//* BID
exports.createBid = catchAsync(async (req, res, next) => {
  const { biddingPrice } = req.body;
  const { id } = req.params;

  const auction = await Auction.findById(id);
  if (!auction) {
    return next(
      new AppError(`Can't find any auction with id ${id}`, 404)
    );
  }

  const bid = await Bid.create({
    user: req.user._id,
    biddingPrice,
  });

  auction.bids.unshift(bid._id);
  await auction.save();

  res.status(200).json({
    status: 'success',
    bid,
  });
});

//* WATCHLIST

exports.getmyWatchList = catchAsync(async (req, res, next) => {
  const watchlist = await WatchList.find({ user: req.user._id });

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

  const watchlist = await WatchList.create({
    user: req.user._id,
    auction: id,
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
    status: 'inProgress',
  });

  res.status(200).json({
    status: 'success',
    watchlist,
  });
});
