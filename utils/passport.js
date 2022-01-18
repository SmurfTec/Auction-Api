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
      callbackURL:
        // 'https://auction-api1.herokuapp.com/api/social/twitter/callback',
        'http://localhost:5000/api/social/twitter/callback',
      // includeEmail: true,
    },
    function (accessToken, refreshToken, profile, done) {
      console.log(`accessToken`, accessToken);
      console.log(`refreshToken`, refreshToken);
      console.log(`profile of twitter waalay bhai`, profile);
      done(null, profile);
    }
  )
);

passport.use(
  new InstagramStrategy(
    {
      clientID: INSTAGRAM_CONSUMER_KEY,
      clientSecret: INSTAGRAM_CONSUMER_SECRET,
      callbackURL:
        'https://auction-api1.herokuapp.com/api/social/instagram/callback/',
    },
    function (accessToken, refreshToken, profile, done) {
      console.log(`accessToken`, accessToken);
      console.log(`refreshToken`, refreshToken);
      console.log(`profile of instagram waalay bhai`, profile);
      // TODO Save the profile
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
