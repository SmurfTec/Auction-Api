// const User = require('../models/User');
// const Freelancer = require('../models/Freelancer');
// const catchAsync = require('./../utils/catchAsync');
// const AppError = require('./../utils/appError');

// exports.setMe = catchAsync(async (req, res, next) => {
//   // console.log(`req.headers.origin`, req.headers.origin);
//   req.params.id = req.user._id;
//   next();
// });

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   console.log('role :>> ', req.query.role);

//   let query = User.find();
//   if (req.query.role) query.find({ role: req.query.role });
//   const users = await query;

//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     users,
//   });
// });

// exports.getMe = catchAsync(async (req, res, next) => {
//   const user = await User.findById(req.user._id);

//   if (user.__type === 'Freelancer') {
//     await User.populate(user, {
//       path: 'gigs',
//     });
//   }

//   res.status(200).json({
//     status: 'success',
//     user,
//   });
// });

// exports.updateMe = catchAsync(async (req, res, next) => {
//   // console.log(`req.user._id`, req.user._id);
//   // console.log(`req.params.id`, req.params.id);

//   let updatedUser;
//   if (req.user.__type === 'Freelancer') {
//     console.log('freelancer');
//     updatedUser = await Freelancer.findByIdAndUpdate(
//       req.user._id,
//       req.body,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );
//   } else {
//     // console.log('user');
//     updatedUser = await User.findByIdAndUpdate(
//       req.user._id,
//       req.body,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );
//   }

//   if (!updatedUser)
//     return next(
//       new AppError(`Can't find any user with id ${req.user._id}`, 404)
//     );

//   res.status(200).json({
//     status: 'success',
//     user: updatedUser,
//   });
// });

// exports.getUser = catchAsync(async (req, res, next) => {
//   const user = await User.findById(req.params.id);

//   if (!user)
//     return next(
//       new AppError(`No User found against id ${req.params.id}`, 404)
//     );

//   res.status(200).json({
//     status: 'success',
//     user,
//   });
// });

// exports.deleteUser = catchAsync(async (req, res, next) => {
//   const deletedUser = await User.findByIdAndDelete(req.params.id);

//   if (!deletedUser)
//     return next(
//       new AppError(`No User found against id ${req.params.id}`, 404)
//     );

//   res.status(200).json({
//     status: 'success',
//     user: deletedUser,
//   });
// });



//*----------------------------------------
// Auction is live for either 1,2 or 3 weeks
//