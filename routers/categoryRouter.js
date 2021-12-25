const express = require('express');
const categoryController = require('../controllers/categoryController');
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(
    protect,
    restrictTo('admin'),
    categoryController.createCategory
  );

router
  .route('/:id')
  .patch(
    protect,
    restrictTo('admin'),
    categoryController.updateCategory
  )
  .delete(
    protect,
    restrictTo('admin'),
    categoryController.deleteCategory
  );

module.exports = router;
