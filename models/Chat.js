const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
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
    select: 'fullName photo',
  }).populate({ path: 'messages' });
  next();
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
