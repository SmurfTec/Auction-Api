const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();

router
  .route('/me')
  .get(protect, userController.getMe)
  .patch(protect, userController.updateMe);
// * why setme is called when updateMe is getting called,
// * setMe is there if we use updateUser instead of updateMe
router.patch(
  '/read-my-notifications',
  protect,
  userController.readNotifications
);

router.patch('/updatePassword', protect, authController.updatePassword);

//* admin

router.route('/').get(protect, restrictTo('admin'), userController.getAllUsers);

router
  .route('/contact')
  .post(userController.createContact)
  .get(protect, restrictTo('admin'), userController.getContacts);

router
  .route('/:id')
  .get(protect, userController.getUser)
  .delete(protect, restrictTo('admin'), userController.deleteUser);

module.exports = router;