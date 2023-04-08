const axios = require("axios");
const { TwitterApi } = require("twitter-api-v2");
const client = new TwitterApi({
  appKey: "IyWzaUp6z9j3QjrtlsQ7TtqtU",
  appSecret: "InGfeMN96ePLtGiCnxx7DhV2ZlxDp4ZrKLaJVjWhOSV4UbQ6im",
  accessToken: "1581038867452465152-hJMC2VoH7gSySy4JfRJFeq6zwUhFrM",
  accessTokenSecret: "IBr7zbmk5HYFb1W9RhAhK3ogKiYNxUDG76uwEuwj4QHYw",
  version: "2", // specify API version
  tweetMode: "extended", // to get full text of tweets
});

const bearerToken =
  "AAAAAAAAAAAAAAAAAAAAAJUGkwEAAAAAxFF9WuhPALbvthWhBky9QMl8VYM%3DXwHL2wmz2VjeO5aVi6jqVub9XgXFm0McvNvbmWHaIbXl5FtU5O";
const twitterUsername = "gambitscom";
const tweetCount = 10;

const axiosInstance = axios.create({
  baseURL: "https://api.twitter.com/2/",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${bearerToken}`,
  },
});

exports.getFeed = async (req, res) => {
  console.log("getting feed");
  axios({
    method: "GET",
    url: `https://api.twitter.com/2/users/by/username/${twitterUsername}`,
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "User-Agent": "v2FilteredStreamJS",
    },
  })
    .then((response) => {
      const userId = response.data.data.id;
      return axios({
        method: "GET",
        url: `https://api.twitter.com/2/users/${userId}/tweets`,
        headers: {
          Authorization: `Bearer ${bearerToken}`,
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
      // const media = response.data.includes.media;
      // const tweetMediaMap = new Map();
      // media.forEach((item) => {
      //   tweetMediaMap.set(item.id, item.url);
      // });
      // tweets.forEach((tweet) => {
      //   const mediaKeys = tweet.attachments?.media_keys;
      //   if (mediaKeys) {
      //     const mediaUrls = mediaKeys.map((key) => tweetMediaMap.get(key));
      //     tweet.media_urls = mediaUrls;
      //   }
      // });
      console.log(response.data.includes);
      res.status(200).send({ message: "success", feed: response.data });
    })
    .catch((error) => {
      console.error(error);
      res.status(403).send({ error });
    });
};
