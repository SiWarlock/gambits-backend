const axios = require("axios");

const twitterUsername = "gambitscom";

exports.getFeed = async (req, res) => {
  axios({
    method: "GET",
    url: `https://api.twitter.com/2/users/by/username/${twitterUsername}`,
    headers: {
      Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      "User-Agent": "v2FilteredStreamJS",
    },
  })
    .then((response) => {
      const userId = response.data.data.id;
      return axios({
        method: "GET",
        url: `https://api.twitter.com/2/users/${userId}/tweets`,
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
          "User-Agent": "v2FilteredStreamJS",
        },
        params: {
          "tweet.fields": "attachments,created_at", // include attachments field to get image
          "media.fields": "url",
          max_results: 10, // get 10 latest tweets
        },
      });
    })
    .then((response) => {
      const tweets = response.data.data;
      res.status(200).send({ message: "success", feed: tweets });
    })
    .catch((error) => {
      console.error(error);
      res.status(403).send({ error });
    });
};
