const User = require('../models/User');
const Client = require('../models/Client');
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
    return next(
      new AppError(`No User found against id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.body);

  const updatedUser = await Client.findByIdAndUpdate(
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
    return next(
      new AppError(`No User found against id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: 'success',
    user: deletedUser,
  });
});
