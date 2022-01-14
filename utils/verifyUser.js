const { promisify } = require('util');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const verifyUser = async (token) => {
  if (!token) {
    return Promise.reject({ error: 'User NOT LOgged In' });
  }
  // console.log(`process.env.JWT_SECRET`, process.env.JWT_SECRET);
  // 2- validate the token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3- check user exits
  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return Promise.reject({ error: 'User Deleted' });
  }

  return Promise.resolve(currentUser);
};

module.exports = verifyUser;
