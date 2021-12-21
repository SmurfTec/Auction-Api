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
    categories: {
      type: String,
      enum: [
        'item',
        'experience',
        'food',
        'influencer focused',
        'location based',
        'brand',
        'business',
        'celebrity',
        'random',
        'risky',
        'luxury',
      ],
      required: [true, 'Plz select categorie'],
    },

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
    //* live => created auctions are published/live
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

//* auction will be there for about 30-days for claim
//* watchlist
