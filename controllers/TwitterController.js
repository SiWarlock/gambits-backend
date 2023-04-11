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
      "tweet.fields": "attachments,created_at", // include attachments field to get image
      "media.fields": "preview_image_url,url",
      expansions: "attachments.media_keys",
      max_results: 10, // get 10 latest tweets
    },
  })
    .then((response) => {
      res.status(200).send({ message: "success", feed: response.data });
    })
    .catch((error) => {
      console.error(error);
      res.status(403).send({ error });
    });
};
