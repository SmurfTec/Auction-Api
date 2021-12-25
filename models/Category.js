const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
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
