const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const ClaimRequest = require('../models/ClaimRequests');
const sendNotificationEvent = require('./NotificationController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const stripe = require('../utils/stripe');
const { clientDomain } = require('../utils/constants');
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

  const claimRequest = await ClaimRequest.findOne()
    .populate({
      path: 'claimBid',
      match: {
        user: req.user._id,
      },
    })
    .populate({
      path: 'auction',
      select: 'title',
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

  // claimRequest.status = 'pending';
  // await claimRequest.save();
  // return res.status(200).json({
  //   status: 'success',
  //   claimRequest,
  // });

  // * Create a Stripe Session and redirect her
  const session = await stripe.checkout.sessions.create({
    customer_email: req.user.email,
    client_reference_id: `${req.user._id}-${claimRequest._id}`,
    mode: 'payment',
    success_url: `${clientDomain}/claim-requests?request=${claimRequest._id}`,
    cancel_url: `${clientDomain}/claim-requests?request=${claimRequest._id}`,
    line_items: [
      {
        name: `${req.user.name} Payment for Accepting Claim.`,
        description: `Auction Claim Acceptance Payment of auction ${claimRequest.auction._id}`,
        amount: claimRequest.claimBid.biddingPrice * 100, //? 100 Cents
        currency: 'USD',
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: 0, //* 0 Because we'll get amount when paying to sellers
    },
    metadata: {
      claimRequest: claimRequest._id.toString(),
    },
  });

  res.redirect(session.url);
});
