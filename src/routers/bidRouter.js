const express = require('express');

const bidController = require('../controllers/bidController');
const protect = require('../middlewares/protect');

const router = express.Router();
router.use(protect);

router.route('/:id').get(bidController.getBid);

module.exports = router;
