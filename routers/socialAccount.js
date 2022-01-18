const express = require('express');
const passport = require('passport');

const router = express.Router();

const CLIENT_URL = `https://auction-frontend-brown.vercel.app/`;

router.get(
  '/twitter',
  passport.authenticate('twitter', { scope: ['profile'] })
);

router.get(
  '/twitter/callback',
  (req, res, next) => {
    console.log(`req.query.code`, req.query.code);
    next();
  },
  passport.authenticate('twitter', {
    successRedirect: CLIENT_URL,
    failureRedirect: CLIENT_URL,
  })
);

router.get(
  '/instagram',
  // passport.authenticate('instagram', { scope: ['profile'] })
  passport.authenticate('instagram')
);

router.get(
  '/instagram/callback',
  (req, res, next) => {
    console.log(`req.query.code`, req.query.code);
    next();
  },
  passport.authenticate('instagram', {
    successRedirect: CLIENT_URL,
    failureRedirect: CLIENT_URL,
  })
);

module.exports = router;
