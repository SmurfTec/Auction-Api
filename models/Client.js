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
  },

  //* in pearpop they are geting tiktok account name for verification and instagram oauth

  // socialLogins:{
  // twitter
  // instagram
  // },

  //* only true if socailLogin are attached

  isVerified: {
    type: Boolean,
    default: true, //^ it needs to be false default bec users social-accounts needs to be properly-verified
  },
  activationLink: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  activated: {
    type: Boolean,
    default: true, //^ make it false in production
  },
});

const clientModel = User.discriminator('client', clientSchema);
module.exports = clientModel;
