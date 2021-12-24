const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    title: {
      type: String,
      required: [true, 'Plz provide auction Title'],
    },
    description: {
      type: String,
      required: [true, 'Plz provide auction Description'],
    },
    location: {
      type: String,
    },
    startingPrice: {
      type: Number,
    },
    video: {
      type: String,
    },
    images: [String],

    //* max 3
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please select atleast one category'],
      },
    ],

    timeLine: {
      type: Date,
    },

    type: {
      type: String,
      enum: ['specific', 'openEnded'],
      required: [true, 'Plz select an auction type'],
    },

    //^ tagged person/account anything

    claim: {
      type: Boolean,
      default: false,
    },

    expireyClaim: {
      type: Date,
    },

    //~ Once the auction is published it cannot be updated and deleted by the creator

    //* inProgress => aucions are created by not yet published
    //* published => created auctions are published/live
    //* archived => auction is archived when its not claimed by anyone
    //* claimed => claimed autions by targeted object

    status: {
      type: String,
      enum: ['inProgress', 'published', 'archived', 'claimed'],
    },
  },
  {
    timestamps: true,
  }
);

auctionSchema.pre(/^find/, function (next) {
  this.sort('-createdAt');
  next();
});

const Auction = mongoose.model('Auction', auctionSchema);
module.exports = Auction;

//* watchlist
