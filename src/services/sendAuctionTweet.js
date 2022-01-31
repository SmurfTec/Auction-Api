var Twitter = require('twitter');
var TwitterV2 = require('twitter-v2');
const { TwitterApi } = require('twitter-api-v2');
// const appOnlyClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
const appOnlyClient = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  // Following access tokens are not required if you are
  // at part 1 of user-auth process (ask for a request token)
  // or if you want a app-only client (see below)
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_TOKEN_SECRET,
});
const v2Client = appOnlyClient.v2;

//* FOR TWEETS
var client1 = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_TOKEN_SECRET,
});
var client2 = new TwitterV2({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_TOKEN_SECRET,
});

module.exports = async ({ twitterTarget, startingPrice, title }) => {
  try {
    //* 1 Get UserId of twitter target
    const res = await client2.get(`users/by/username/${twitterTarget}`, {
      'user.fields': 'id,name,username',
    });

    //* 2 Follow specific person
    const res2 = await v2Client.follow(
      process.env.CALLUM_TONER_USERID,
      res.data.id
    );
    // const res2 = await v2Client.unfollow('1476296316468830219', res.data.id);

    //* 3 tweet to specific person
    client1.post(
      'statuses/update',
      {
        status: `hello @${twitterTarget} ! an auction has been created ${title} in which you are tagged. Starting bid is ${startingPrice}`,
      },
      function (error, tweet, res) {
        if (error) {
        }
        // console.log('tweet', tweet);
        // console.log('response', res);
      }
    );
  } catch (err) {
    console.log('*****');
    console.log('err', err);
    console.log('*****');
  }
};
