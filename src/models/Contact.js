const mongoose = require('mongoose');
const validator = require('validator');

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is Required'],
    },
    email: {
      type: String,
      required: [true, 'Email is Required'],
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    message: {
      type: String,
      required: [true, 'Message is Required'],
    },
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
