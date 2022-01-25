const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const ClaimRequest = require('../models/ClaimRequests');
const sendNotificationEvent = require('./NotificationController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//* BID
exports.getAllClaimRequests = catchAsync(async (req, res, next) => {
  const claimRequests = await ClaimRequest.find()
    .populate({
      path: 'user',
      select: 'firstName lastName name',
    })
    .populate({
      path: 'auction',
      select: `-bids`,
    })
    .populate({
      path: 'bid',
      select: 'biddingPrice',
    });

  res.status(200).json({
    status: 'success',
    claimRequests,
  });
});

exports.getMyClaimRequests = catchAsync(async (req, res, next) => {
  // * Sent
  const claimRequestsSent = await ClaimRequest.find({
    user: req.user._id,
  })
    .populate({
      path: 'user',
      select: 'firstName lastName name twitterProfile',
    })
    .populate({
      path: 'auction',
      select: `-bids`,
    })
    .populate({
      path: 'bid',
      select: 'biddingPrice',
    });

  // * Received

  const claimRequestsReceived = await ClaimRequest.find()
    .populate({
      path: 'claimBid',
      match: {
        user: req.user._id,
      },
    })
    .populate({
      path: 'user',
      select: 'firstName lastName name twitterProfile',
    })
    .populate({
      path: 'auction',
      select: `-bids`,
    });

  res.status(200).json({
    status: 'success',
    claimRequestsSent: {
      results: claimRequestsSent.length,
      data: claimRequestsSent,
    },
    claimRequestsReceived: {
      results: claimRequestsReceived.length,
      data: claimRequestsReceived,
    },
  });
});

exports.handleStatus = catchAsync(async (req, res, next) => {
  const { id, status } = req.params;

  const claimRequest = await ClaimRequest.findOne().populate({
    path: 'claimBid',
    match: {
      user: req.user._id,
    },
  });

  if (!claimRequest)
    return next(new AppError(`Can't find any Claim Request for id ${id}`, 400));

  // * If status is rejected, simple update the request
  if (status === 'rejected') {
    claimRequest.status = 'rejected';
    await claimRequest.save();
    return res.status(200).json({
      status: 'success',
      claimRequest,
    });
  }

  // * Create a Stripe Session and redirect her

  res.status(200).json({
    status: 'success',
    claimRequest,
  });
});
