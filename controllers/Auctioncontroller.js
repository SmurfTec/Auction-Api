const User = require('../models/User');
const Auction = require('../models/Auction');
const WatchList = require('../models/WatchList');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.createAuction = catchAsync(async (req, res, next) => {
  const { timeLine } = req.body;

  //* create a expirey clime date exactly 30-days after the timeLine

  const auction = await Auction.create({
    user: req.user._id,
    ...req.body,
  });

  res.status(200).json({
    status: 'success',
    auction,
  });
});

exports.getAllAuctions = catchAsync(async (req, res, next) => {
  //* globally only get the published-auctions
  const auctions = await Auction.find({ status: 'published' });

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
  res.status(200).json({
    status: 'success',
    auction,
  });
});

//* publish-Auction
exports.publishAuction = catchAsync(async (req, res, next) => {
  const auction = await Auction.findById(req.params.id);

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
  const updateAuction = await Auction.findByIdAndUpdate(
    { user: req.user._id, status: 'inProgress' },
    { ...req.body },
    {
      runValidators: true,
      new: true,
    }
  );

  if (!updateAuction)
    return next(
      new AppError(
        `Can't find any auction with id ${req.user._id}`,
        404
      )
    );

  res.status(200).json({
    status: 'success',
    auction: updateAuction,
  });
});

exports.deleteAuction = catchAsync(async (req, res, next) => {
  const deletedUser = await Auction.findByIdAndDelete({
    user: req.user._id,
    status: 'inProgress',
  });

  if (!deletedUser)
    return next(
      new AppError(
        `No Auction found against id ${req.params.id}`,
        404
      )
    );

  res.status(200).json({
    status: 'success',
    user: deletedUser,
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
