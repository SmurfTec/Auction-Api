const User = require('../models/User');
const Client = require('../models/Client');
const Contact = require('../models/Contact');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.setMe = catchAsync(async (req, res, next) => {
  // console.log(`req.headers.origin`, req.headers.origin);
  req.params.id = req.user._id;
  next();
});

// admin
exports.getAllUsers = catchAsync(async (req, res, next) => {
  console.log('role :>> ', req.query.role);

  let query = User.find();
  if (req.query.role) query.find({ role: req.query.role });
  const users = await query;

  res.status(200).json({
    status: 'success',
    results: users.length,
    users,
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.__type === 'User') {
    await User.populate(user, {
      path: 'gigs',
    });
  }

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user)
    return next(new AppError(`No User found against id ${req.params.id}`, 404));

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.body);
  console.log(`  req.user._id`, req.user._id);

  // * Client.Find... returns null, find the reason

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { ...req.body },
    {
      runValidators: true,
      new: true,
    }
  );

  if (!updatedUser)
    return next(
      new AppError(`Can't find any user with id ${req.user._id}`, 404)
    );

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

// admin

exports.deleteUser = catchAsync(async (req, res, next) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);

  if (!deletedUser)
    return next(new AppError(`No User found against id ${req.params.id}`, 404));

  res.status(200).json({
    status: 'success',
    user: deletedUser,
  });
});

//* CONTACT
exports.createContact = catchAsync(async (req, res, next) => {
  const { email, message, name } = req.body;

  console.log(`req.body`, req.body);
  const contact = await Contact.create({
    name,
    email,
    message,
  });

  res.status(200).json({
    status: 'success',
    contact,
  });
});

exports.getContacts = catchAsync(async (req, res, next) => {
  const contact = await Contact.find();

  res.status(200).json({
    status: 'success',
    contact,
  });
});

//* read notifications update user
exports.readNotifications = catchAsync(async (req, res, next) => {
  //* Visitors
  let updateUser = await User.findById(req.user._id);

  if (!updateUser)
    return next(new AppError(`Logged User NOT Exists in DB`, 400));

  console.log(`updatedUser`, updateUser);

  // updateUser.notifications.forEach(async (notification) => {
  //   await Notification.findByIdAndUpdate(notification._id, {
  //     isRead: true,
  //   });
  // });

  res.status(200).json({
    status: 'success',
  });
});
