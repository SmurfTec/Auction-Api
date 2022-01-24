const mongoose = require('mongoose');

const othersScehma = new mongoose.Schema(
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

othersScehma.pre(/^find/, function (next) {
  this.sort('-createdAt');
  next();
});

const Others = mongoose.model('Others', othersScehma);
module.exports = Others;
