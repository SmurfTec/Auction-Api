const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // * Receiver will be 2nd person of chat

    text: String,
  },
  { timestamps: true }
);

messageSchema.pre(/^find/, function (next) {
  this.populate({ path: 'sender', select: 'name photo firstName lastName' });

  next();
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
