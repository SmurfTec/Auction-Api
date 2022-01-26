const mongoose = require('mongoose');

const claimRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Provide User for Claim Request'],
    },
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: [true, 'Provide Auction for Claim Request'],
    },
    claimBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      required: [true, 'Provide ClaimBid for Claim Request'],
    },
    message: {
      type: String,
      trim: true,
      minlength: [50, 'firstname must be greater than 50'],
      required: [true, 'Provide message for Claim Request'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    bidderPaymentId: String, //* id of stripe payment intent object
    bidderPaymentStatus: {
      type: Boolean,
      default: false,
    },
    // bidderPayment : String,
  },
  {
    timestamps: true,
  }
);

// * 1 Person can send only 1 Claim Request per bid of an auction
// * e.g an auction "A" has 10 bids, then Mr Zain can send claim request
// * to Mr Umad (one of the bidder) only once,
claimRequestSchema.index({ user: 1, auction: 1, claimBid: 1 }, { unique: 1 });

claimRequestSchema.pre(/^find/, function (next) {
  this.sort('-createdAt');
  next();
});

claimRequestSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'user',
  //   select: 'firstName lastName name',
  // });
  next();
});

const claimRequest = mongoose.model('ClaimRequest', claimRequestSchema);
module.exports = claimRequest;
