const mongoose = require('mongoose');

const claimedAuctionsSchema = new mongoose.Schema(
  {
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    claimRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClaimRequest',
    },
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
    },
  },

  {
    timestamps: true,
  }
);

claimedAuctionsSchema.pre(/^find/, function (next) {
  this.sort('-createdAt');
  next();
});

claimedAuctionsSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'auction',
  // });
  next();
});

const claimedAuctions = mongoose.model(
  'ClaimedAuctions',
  claimedAuctionsSchema
);
module.exports = claimedAuctions;
