const Auction = require('../models/Auction');
const Client = require('../models/Client');
const Bid = require('../models/Bid');
const ClaimRequest = require('../models/ClaimRequests');
const sendNotificationEvent = require('./NotificationController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const stripe = require('../utils/stripe');
const { clientDomain } = require('../utils/constants');
const ClaimedAuctions = require('../models/ClaimedAuctions');

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
      path: 'claimBid',
      select: 'biddingPrice',
    });

  // * Received

  let claimRequestsReceived = await ClaimRequest.find()
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

  // ! We are filtering request with claimBid null, but this is NOT
  // ! a better solution, we have to find somehthing in query

  claimRequestsReceived = claimRequestsReceived.filter((el) => !!el.claimBid);

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

  if (!claimRequest.claimBid)
    return next(
      new AppError(
        `Only the person who made the bid can accept the claim on bid`,
        403
      )
    );

  // * If status is rejected, simple update the request
  if (status === 'rejected') {
    claimRequest.status = 'rejected';
    await claimRequest.save();
    return res.status(200).json({
      status: 'success',
      claimRequest,
    });
  }

  // * If bidder already made payment for some other claim Request

  // * Create a Stripe Session and redirect her
  const session = await stripe.checkout.sessions.create({
    customer_email: req.user.email,
    client_reference_id: `${req.user._id}-${claimRequest._id}`,
    mode: 'payment',
    success_url: `${clientDomain}/myauctions/claim-requests?tab=received&claimRequest=${claimRequest._id}`,
    cancel_url: `${clientDomain}/myauctions/claim-requests?tab=received&claimRequest=${claimRequest._id}`,
    line_items: [
      {
        name: `${req.user.name} Payment for Accepting Claim.`,
        description: `Claim Acceptance Payment for auction ${claimRequest.auction._id}`,
        amount: claimRequest.claimBid.biddingPrice * 100, //? 100 Cents
        currency: 'USD',
        quantity: 1,
      },
    ],
    payment_intent_data: {
      // application_fee_amount: 0, //* 0 Because we'll get amount when paying to sellers
      // ! Only if we want to make direct transfer
      // transfer_data: {
      //   destination: 'acct_1I67ykEPDzqfAEED',
      // },
      description: `Claim Acceptance Payment for auction ${claimRequest.auction._id}`,
      metadata: {
        claimRequest: claimRequest._id.toString(),
      },
    },

    metadata: {
      claimRequest: claimRequest._id.toString(),
    },
  });

  res.json({ url: session.url });
});

exports.createPaymentRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const claimRequest = await ClaimRequest.findOne({
    user: req.user._id,
  })
    .populate({
      path: 'claimBid',
    })
    .populate({
      path: 'auction',
      select: 'title',
    })
    .populate({
      path: 'user',
      select: 'firstName lastName name',
    });

  if (!claimRequest)
    return next(new AppError(`Can't find any Claim Request for id ${id}`, 400));

  if (!req.user.stripeAccount)
    return next(
      new AppError(
        `You must connect your stripe connected account befor sending payment request`,
        401
      )
    );

  // * If status is rejected, simple update the request
  claimRequest.paymentRequest = {
    status: 'pending',
  };
  await claimRequest.save();

  // * Send notification to bidder that payment request came
  sendNotificationEvent({
    title: `You have new payment request for auction ${claimRequest.auction?.title}".`,
    description: `for Claim Request ${claimRequest.message}`,
    type: 'claimRequest',
    link: `/myauctions/claim-requests/?tab=received&claimRequest=${claimRequest._id}`,
    userId: claimRequest.claimBid?.user?._id,
  });

  res.json({ status: 'success', claimRequest });
});

exports.handlePaymentRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const claimRequest = await ClaimRequest.findById(id)
    .populate({
      path: 'claimBid',
      match: {
        user: req.user._id,
      },
    })
    .populate({
      path: 'auction',
      select: 'title',
      populate: {
        path: 'user',
        select: 'stripeAccount firstName lastName name',
      },
    })
    .populate({
      path: 'user',
      select: 'firstName lastName name stripeAccount',
    });

  if (!claimRequest)
    return next(new AppError(`Can't find any Claim Request for id ${id}`, 400));

  if (!claimRequest.claimBid)
    return next(
      new AppError(
        `Only the person who made the bid can accept the payment request on bid`,
        403
      )
    );

  if (claimRequest.paymentRequest) {
    claimRequest.paymentRequest.status = status;
    await claimRequest.save();
  }

  // * Transfer payment from platform to service provider's stripeAccount
  // * We have to save 15% for platform, 1% for auction creator and 84% for service provider
  let totalAmount = claimRequest.claimBid.biddingPrice;
  let serviceProviderAmount = totalAmount * 0.84; // * 84%
  let auctionCreatorAmount = totalAmount * 0.01; //* 1%
  console.log('claimRequest.user', claimRequest.user);

  const updatedAuction = await Auction.findByIdAndUpdate(
    claimRequest.auction?._id,
    {
      status: 'claimed',
    }
  );

  const claimedAuction = await ClaimedAuctions.create({
    bidder: claimRequest.claimBid?.user,
    claimant: claimRequest.user?._id,
    claimRequest: claimRequest._id,
    auction: updatedAuction._id,
  });

  console.log('claimedAuction', claimedAuction);

  const transfer = await stripe.transfers.create({
    amount: serviceProviderAmount * 100, //* In Cents
    currency: 'usd',
    destination: claimRequest.user?.stripeAccount.id,
  });
  // * Send notification to service provider that payment received
  sendNotificationEvent({
    title: `Your payment request accepted for auction ${claimRequest.auction?.title}".`,
    description: `and funds transfered to your stripe account`,
    type: 'claimRequest',
    link: `/myauctions/claim-requests/?tab=sent&claimRequest=${claimRequest._id}`,
    userId: claimRequest.user?._id,
  });
  console.log('transfer', transfer);

  // * If Auction Creator Doesn't have any stripe account, then ask him to create account
  if (!claimRequest.auction?.user?.stripeAccount) {
    console.log('no account');
    const auctionCreater = await Client.findById(
      claimRequest.auction?.user?._id
    );

    auctionCreater.pendingTransactions = [
      {
        amount: auctionCreatorAmount * 100,
        status: 'pending',
      },
      ...auctionCreater.pendingTransactions,
    ];
    // * Send notification to service provider that payment received
    sendNotificationEvent({
      title: `You got 1% of your share for creating auction ${claimRequest.auction?.title}".`,
      description: `Connect your stripe account to get that share`,
      type: 'claimRequest',
      link: `/myauctions/${claimRequest.auction?._id}`,
      userId: claimRequest.auction?.user?._id,
    });
  } else {
    const transfer2 = await stripe.transfers.create({
      amount: auctionCreatorAmount * 100, //* In cents,
      currency: 'usd',
      destination: claimRequest.auction?.user?.stripeAccount.id,
    });

    console.log('transfer2', transfer2);

    // * Send notification to service provider that payment received
    sendNotificationEvent({
      title: `You got 1% of your share for creating auction ${claimRequest.auction?.title}".`,
      description: `Enjoy Lotpot Money`,
      type: 'claimRequest',
      link: `/myauctions/${claimRequest.auction?._id}`,
      userId: claimRequest.auction?.user?._id,
    });
  }
  res.json({ claimRequest, auction: updatedAuction });
});
