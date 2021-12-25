const Category = require('../models/Category');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.createCategory = catchAsync(async (req, res, next) => {
  const category = await Category.create(req.body);

  res.status(200).json({
    status: 'success',
    category,
  });
});
exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find();

  res.status(200).json({
    status: 'success',
    results: categories.length,
    categories,
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    {
      runValidators: true,
      new: true,
    }
  );

  if (!updatedCategory)
    return next(
      new AppError(
        `Can't find any categorie with id ${req.categorie._id}`,
        404
      )
    );

  res.status(200).json({
    status: 'success',
    category: updatedCategory,
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const deletedCategory = await Category.findByIdAndDelete(
    req.params.id
  );

  if (!deletedCategory)
    return next(
      new AppError(
        `No Category found against id ${req.params.id}`,
        404
      )
    );

  res.status(200).json({
    status: 'success',
    category: deletedCategory,
  });
});
