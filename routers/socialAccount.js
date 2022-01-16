const express = require('express');
const passport = require('passport');

const router = express.Router();

const CLIENT_URL = `https://auction-app-frontend.netlify.app/account`;

router.get(
  '/twitter',
  passport.authenticate('twitter', { scope: ['profile'] })
);

router.get(
  '/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect: CLIENT_URL,
    failureRedirect: '/login/failed',
  })
);

router.get(
  '/instagram',
  passport.authenticate('instagram', { scope: ['profile'] })
);

router.get(
  '/instagram/callback',
  passport.authenticate('instagram', {
    successRedirect: CLIENT_URL,
    failureRedirect: '/login/failed',
  })
);

module.exports = router;
