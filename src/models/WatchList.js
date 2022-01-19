const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
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

watchlistSchema.pre(/^find/, function (next) {
  this.sort('-createdAt');
  next();
});

watchlistSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'auction',
  });
  next();
});

const WatchList = mongoose.model('WatchList', watchlistSchema);
module.exports = WatchList;
