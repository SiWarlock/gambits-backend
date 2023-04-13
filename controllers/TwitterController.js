const axios = require("axios");

exports.getFeed = async (req, res) => {
  axios({
    method: "GET",
    url: `https://api.twitter.com/2/users/${process.env.TWITTER_USER_ID}/tweets`,
    headers: {
      Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      "User-Agent": "v2FilteredStreamJS",
    },
    params: {
      "tweet.fields": "attachments,created_at,in_reply_to_user_id", // include attachments field to get image
      "media.fields": "preview_image_url,url",
      expansions: "attachments.media_keys",
      max_results: 20,
      exclude: "replies",
    },
  })
    .then((response) => {
      const originalTweets = response.data.data.filter(
        (tweet) => !tweet.in_reply_to_user_id
      );
      const data = originalTweets.slice(0, 10);
      const result = {
        data: data,
        includes: response.data.includes,
      };
      res.status(200).send({ message: "success", feed: result });
    })
    .catch((error) => {
      console.error(error);
      res.status(403).send({ error });
    });
};
