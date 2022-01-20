const Notification = require('../models/Notification');
const User = require('../models/User');

const sendNotificationEvent = async ({
  title,
  description,
  type,
  isVisitor,
  link,
  userId,
}) => {
  const { io } = require('../server');
  //* send notification to user
  const notification = await Notification.create({
    title,
    description,
    type,
    isVisitor,
    link,
  });

  //* notification sent to admin side
  io.sockets.emit('newNotification', {
    newNotification: notification,
    userId,
  });

  // * Push Notification to user (if userId)

  if (userId) {
    const updatedUser = await User.findById(userId);
    updatedUser.notifications = [notification, ...updatedUser.notifications];
    await updatedUser.save();
  }
};

module.exports = sendNotificationEvent;
