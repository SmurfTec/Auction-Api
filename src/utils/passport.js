const TwitterStrategy = require('passport-twitter').Strategy;
const InstagramStrategy = require('passport-instagram').Strategy;

const passport = require('passport');

TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
INSTAGRAM_CONSUMER_KEY = process.env.INSTAGRAM_CONSUMER_KEY;
INSTAGRAM_CONSUMER_SECRET = process.env.INSTAGRAM_CONSUMER_SECRET;

passport.use(
  new TwitterStrategy(
    {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      callbackURL:
        'https://auction-api1.herokuapp.com/api/social/twitter/callback',
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
  console.log(`user`, user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
