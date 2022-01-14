const express = require('express');

const chatController = require('../controllers/chatController');
const protect = require('../middlewares/protect');

const router = express.Router();
router.use(protect);

router
  .route('/')
  // .get(chatController.getAllChats) // ! Delete in futre
  .post(chatController.addNewChat);

router.get('/me', chatController.getMyChats);

router
  .route('/:id')
  .get(chatController.getChat)
  //   .patch(chatController.updateChat)
  .delete(chatController.deleteChat); // ! delete in future

module.exports = router;
