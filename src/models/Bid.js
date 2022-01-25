const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    biddingPrice: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

bidSchema.pre(/save/, function (next) {
  if (this.biddingPrice) this.biddingPrice = parseInt(this.biddingPrice);

  next();
});

bidSchema.pre(/^find/, function (next) {
  this.sort('-createdAt');
  next();
});

bidSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName name',
  });
  next();
});

const Bid = mongoose.model('Bid', bidSchema);
module.exports = Bid;
