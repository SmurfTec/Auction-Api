const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Freelancer',
    },
    title: {
      type: String,
      required: [true, 'Plz provide Notification Title'],
    },
    description: {
      type: String,
      required: [true, 'Plz provide Notification Description'],
    },
    type: {
      type: String,
      required: [true, 'Plz provide Notification Type'],
      enum: ['account', 'offer', 'order'],
    },
    avatar: String,
    isRead: {
      type: Boolean,
      default: false,
    },
    link: String,
  },
  {
    timestamps: true,
  }
);

notificationSchema.pre(/^find/, function (next) {
  this.sort('-createdAt');
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
