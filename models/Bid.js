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

bidSchema.pre(/^find/, function (next) {
  this.sort('-createdAt');
  next();
});

bidSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
  });
  next();
});

const Bid = mongoose.model('Bid', bidSchema);
module.exports = Bid;
