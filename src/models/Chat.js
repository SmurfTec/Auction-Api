const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
  },
  { timestamps: true }
);

chatSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'participants',
    select: 'name photo firstName lastName',
  })
    .populate({ path: 'messages' })
    .populate({ path: 'auction', select: 'title' });
  next();
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
