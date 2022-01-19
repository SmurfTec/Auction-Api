const verifyUser = require('../utils/verifyUser');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

exports.handleNewMessage = async (io, data) => {
  // console.log('*****');
  // console.log('*****');
  // console.log('*****');
  // console.log(`data`, data);
  const { token, text, chatId } = data;
  try {
    // * Verify Token
    const loggedUser = await verifyUser(token);
    // console.log(`loggedUser`, loggedUser);

    // * Find Chat

    let chat = await Chat.findById(chatId);
    // console.log(`chatId`, chatId);
    // console.log(`chat`, chat);
    if (!chat) return;

    // * Create New Message
    const newMessage = await Message.create({
      text: text,
      sender: loggedUser._id,
    });

    // console.log(`newMessage`, newMessage);

    // * Push new Message to Chat Messages
    chat.messages = [...chat.messages, newMessage._id];
    await chat.save();

    // * Receiver will the 2nd participant of chat
    // console.log(` chat.participants[0]._id`, chat.participants[0]._id);
    const receiver =
      chat.participants[0]._id.toString() === loggedUser._id.toString()
        ? chat.participants[1]
        : chat.participants[0];

    // console.log(`receiver`, receiver);

    await Chat.populate(chat, {
      path: 'participants',
      select: 'name email',
    });
    await Chat.populate(chat, {
      path: 'messages',
      select: 'name email',
    });
    await Message.populate(newMessage, {
      path: 'sender',
    });

    // * Send new Message to all sockets
    io.sockets.emit('newMessage', {
      chatId: chat._id,
      message: newMessage,
      userId: loggedUser._id,
      receiver: receiver._id,
    });

    // console.log(`updatedChat`, chat);
  } catch (err) {
    // console.log(`err ${err}`.bgWhite.red.bold);
  }
};
