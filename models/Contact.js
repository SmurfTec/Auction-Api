const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    email: String,
    message: String,
  },
  {
    timestamps: true,
  }
);

contactSchema.pre(/^find/, function (next) {
  this.sort('-createdAt');
  next();
});

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;
