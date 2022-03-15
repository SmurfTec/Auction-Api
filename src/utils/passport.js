const TwitterStrategy = require('passport-twitter').Strategy;
const InstagramStrategy = require('passport-instagram').Strategy;

const passport = require('passport');
const Client = require('../models/Client');
const { serverUrl } = require('../utils/constants');

TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
INSTAGRAM_CONSUMER_KEY = process.env.INSTAGRAM_CONSUMER_KEY;
INSTAGRAM_CONSUMER_SECRET = process.env.INSTAGRAM_CONSUMER_SECRET;

passport.use(
  new TwitterStrategy(
    {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      passReqToCallback: true,
      callbackURL: `${serverUrl}/api/social/twitter/callback`,
      // 'https://auction-api1.herokuapp.com/api/social/twitter/callback',
      includeEmail: true,
    },
    async function (req, accessToken, refreshToken, profile, done) {
      await Client.findByIdAndUpdate(
        req.session.user,
        {
          twitterProfile: {
            userId: profile.id,
            username: profile.username,
            displayName: profile.displayName,
            email: profile._json?.email,
            // isVerified: true, //! In Future, only make this true if instagram is also attached
          },
        },
        { runValidators: true }
      );

      done(null, profile);
    }
  )
);

// * https://github1s.com/leannezhang/twitter-authentication/blob/HEAD/client/src/components/Header.jsx

passport.use(
  new InstagramStrategy(
    {
      clientID: INSTAGRAM_CONSUMER_KEY,
      clientSecret: INSTAGRAM_CONSUMER_SECRET,
      callbackURL:
        'https://auction-api1.herokuapp.com/api/social/instagram/callback/',
    },
    function (accessToken, refreshToken, profile, done) {
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
