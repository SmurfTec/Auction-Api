const mongoose = require('mongoose');
const validator = require('validator');
const User = require('./User');

const clientSchema = new mongoose.Schema({
  photo: String,
  about: {
    type: String,
    trim: true,
    minlength: [20, 'must be greater than 20 characters'],
  },
  phoneNumber: {
    type: Number,
  },
  dateofBirth: {
    type: Date,
    validate: {
      validator: function (el) {
        return new Date(el) < new Date();
      },
      message: `Date of birth must NOT be in past`,
    },
  },

  //* in pearpop they are geting tiktok account name for verification and instagram oauth

  twitterProfile: {
    userId: String,
    username: String,
    displayName: String,
    email: String,
  },
  // socialLogins:{
  // twitter
  // instagram
  // },

  //* only true if socailLogin are attached

  isVerified: {
    type: Boolean,
    default: true, //^ it needs to be false default bec users social-accounts needs to be properly-verified
  },

  stripeAccount: {
    id: String,
    charges_enabled: Boolean,
    details_submitted: Boolean,
    capabilities: Object,
  },

  paymentDetails: {
    cardNumber: {
      type: Number,

      // TODO Add validations (only 16 digit number)
      // validate: {
      //   validator: function (el) {
      //     return el;
      //   },
      //   message: ``,
      // },
    },
    expiry: String, // TODO Check it'll be data or string
    cvc: {
      type: Number,
      // TODO Add validations (only 3/4 digit number)
      // validate: {
      //   validator: function (el) {
      //     return el;
      //   },
      //   message: ``,
      // },
    },
  },

  activationLink: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  activated: {
    type: Boolean,
    default: false, //^ make it false in production
  },
});

const clientModel = User.discriminator('Client', clientSchema);
module.exports = clientModel;
