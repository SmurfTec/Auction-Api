const TwitterStrategy = require('passport-twitter').Strategy;
const InstagramStrategy = require('passport-instagram').Strategy;

const passport = require('passport');

TWITTER_CONSUMER_KEY = 'ML8X6a5Z9U5t1XA8rqRoIqxDh';
TWITTER_CONSUMER_SECRET = 'lWbbqLCdjxUSIuSwlKPE9UehDxhzWQinY18tjxcr1eBpZBFhi5';

INSTAGRAM_CONSUMER_KEY = '1561091957582156';
INSTAGRAM_CONSUMER_SECRET = '69c5334dbef99fe12f59b66c3505798e';

passport.use(
  new TwitterStrategy(
    {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      callbackURL: '/auth/twitter/callback',
      // includeEmail: true,
    },
    function (accessToken, refreshToken, profile, done) {
      console.log(`profile`, profile);
      done(null, profile);
    }
  )
);

passport.use(
  new InstagramStrategy(
    {
      clientID: INSTAGRAM_CONSUMER_KEY,
      clientSecret: INSTAGRAM_CONSUMER_SECRET,
      callbackURL: '/auth/instagram/callback',
    },
    function (accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});