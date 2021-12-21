const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
    },
    biddingPrice:{
      type:Number,
    }
  },
  {
    timestamps: true,
  }
);

bidSchema.pre(/^find/, function (next) {
  this.sort('-createdAt');
  next();
});

const Bid = mongoose.model('Bid', bidSchema);
module.exports = Bid;
