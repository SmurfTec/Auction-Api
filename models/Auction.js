const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    // * only for open auctions
    winningBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
    },
    bids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid',
      },
    ],
    title: {
      type: String,
      unique: [true, 'title must be unique'],
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
      validate: {
        validator: function (el) {
          return el > 0;
        },
        message: `startingPrice can't be nagative`,
      },
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

    claimExpiry: {
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
      default: 'inProgress',
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

auctionSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'categories',
  });
  next();
});

const Auction = mongoose.model('Auction', auctionSchema);
module.exports = Auction;
