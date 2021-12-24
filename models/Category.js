const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: 'string',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.pre(/^find/, function (next) {
  this.sort('-createdAt');
  next();
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;

//         'item',
//         'experience',
//         'food',
//         'influencer focused',
//         'location based',
//         'brand',
//         'business',
//         'celebrity',
//         'random',
//         'risky',
//         'luxury',
