const mongoose = require('mongoose');

const faqsSchema = new mongoose.Schema(
  {
    question: String,
    answer: String,
  },
  {
    timestamps: true,
  }
);

faqsSchema.pre(/^find/, function (next) {
  this.sort('-createdAt');
  next();
});

const faqs = mongoose.model('Faqs', faqsSchema);
module.exports = faqs;
