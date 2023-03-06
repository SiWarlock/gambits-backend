const axios = require("axios");
const { ethers } = require("ethers");
const { SiweMessage, generateNonce } = require("siwe");
const UserInfos = require("../models/UserInfo");
const userHelper = require("../helpers/users");
const jwt = require("jsonwebtoken");
const { validateHeader } = require("../validation/header");

// Store the nonce for checking against log-in
let nonce;

exports.getNonce = async (req, res) => {
  nonce = generateNonce();
  console.log(`Nonce generated on server: ${nonce}`);
  res.send(nonce);
};

exports.signUser = async (req, res) => {
  if (req.body) {
    try {
      const { email, message, signature } = req.body;
      const messageSIWE = new SiweMessage(message);
      const provider = ethers.getDefaultProvider();
      const fields = await messageSIWE.validate(signature, provider);

      if (fields.nonce !== nonce) {
        res.status(422).json({
          message: "Invalid nonce: Client and Server nonce mismatch",
        });
        return;
      }
      console.log(`SIWE message `);
      console.debug(fields);
      console.log(`Successfully signed on the server`);

      const isNew = await userHelper.getUser(fields.address);

      if (isNew) {
        if (email === "") {
          res.status(401).send({ error: "email required" });
        } else {
          await userHelper.addUser(fields.address, email);
          const token = jwt.sign(
            { address: fields.address },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: "2h",
            }
          );

          res.status(200).json({
            token,
            message: "Successfully signed!",
          });
        }
      } else {
        const token = jwt.sign(
          { address: fields.address },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "2h",
          }
        );

        res.status(200).json({
          token,
          message: "Successfully signed!",
        });
      }
    } catch (error) {
      res.status(400).send({ error });
    }
  } else {
    res.status(403).send({ error: "Invalid request" });
  }
};

exports.getUserInfoData = async (req, res) => {
  const newReq = validateHeader(req);
  if (newReq) {
    try {
      const result = await UserInfos.find({
        wallet_address: newReq.wallet.address,
      });
      if (result.length) {
        res.json({
          success: true,
          info: {
            wallet_address: result[0].wallet_address,
            deposit_balance: result[0].deposit_balance,
            bonus_percent: result[0].bonus_percent,
            email: result[0]?.email,
            discord_link: !!result[0]?.discord,
            twitch_link: !!result[0]?.twitch,
            twitter_link: !!result[0]?.twitter,
          },
        });
      } else {
        res.status(403).send({ error: "Invalid token" });
      }
    } catch (err) {
      res.status(400);
    }
  } else {
    res.status(403).send({ error: "Invalid token" });
  }
};

exports.addEmail = async (req, res) => {
  if (validateHeader(req)) {
    try {
      const findQuery = {
        wallet_address: req.wallet.address,
      };
      const result = await UserInfos.find(findQuery);
      if (result.length) {
        const { email } = req.body;
        const doc = await UserInfos.findById(result[0]._id);
        doc.email = email;
        if (!result[0].email) {
          doc.bonus_percent = result[0].bonus_percent + 10;
        }
        await doc.save();
        res.status(200).send({
          message: "Successfully updated!",
        });
      } else {
        res.status(403).send({ error: "Invalid token" });
      }
    } catch (err) {
      res.status(400);
    }
  } else {
    res.status(403).send({ error: "Invalid token" });
  }
};

exports.authDiscord = async (req, res) => {
  const code = req.query.code;
  res.redirect(`http://localhost:3000/side-quests?d-code=${code}`);
};

exports.authTwitch = async (req, res) => {
  const code = req.query.code;
  res.redirect(`http://localhost:3000/side-quests?ch-code=${code}`);
};

exports.authTwitter = async (req, res) => {
  const code = req.query.code;
  res.redirect(`http://localhost:3000/side-quests?t-code=${code}`);
};

exports.processAuth = async (req, res) => {
  if (validateHeader(req)) {
    const { codeType, codeValue } = req.body;
    if (codeType && codeValue) {
      switch (codeType) {
        case "d-code":
          processAuthDiscord(req, res);
          return;
        case "ch-code":
          processAuthTwitch(req, res);
          return;
        case "t-code":
          processAuthTwitter(req, res);
          return;
      }
    } else {
      res.status(403).send({ error: "Invalid request" });
    }
  } else {
    res.status(403).send({ error: "Invalid token" });
  }
};

const processAuthDiscord = async (req, res) => {
  const code = req.body.codeValue;
  const params = new URLSearchParams();
  // let user;
  // params.append("client_id", process.env.DISCORD_CLIENT_ID);
  // params.append("client_secret", process.env.DISCORD_CLIENT_SECRET);
  // params.append("grant_type", "authorization_code");
  // params.append("code", code);
  // params.append("redirect_uri", "http://localhost:3030/api/user/authDiscord");
  try {
    // const response = await axios.post(
    //   "https://discord.com/api/oauth2/token",
    //   params
    // );
    // const { access_token, token_type } = response.data;
    // const userDataResponse = await axios.get(
    //   "https://discord.com/api/users/@me",
    //   {
    //     headers: {
    //       authorization: `${token_type} ${access_token}`,
    //     },
    //   }
    // );
    // const guilds = await axios.get("https://discord.com/api/users/@me/guilds", {
    //   headers: {
    //     authorization: `${token_type} ${access_token}`,
    //   },
    // });
    // console.log("Data: ", userDataResponse.data);
    // console.log("Data: ", guilds.data);
    // user = {
    //   username: userDataResponse.data.username,
    //   email: userDataResponse.data.email,
    // };

    const findQuery = {
      wallet_address: req.wallet.address,
    };

    const result = await UserInfos.find(findQuery);
    if (result.length) {
      const doc = await UserInfos.findById(result[0]._id);
      doc.discord = code;
      if (!result[0].discord) {
        doc.bonus_percent = result[0].bonus_percent + 10;
      }
      await doc.save();
      res.status(200).send({
        message: "Successfully updated!",
      });
    } else {
      res.status(403).send({ error: "Invalid token" });
    }
  } catch (error) {
    console.log("Error", error);
    return res.send("Some error occurred! ");
  }
};

const processAuthTwitch = async (req, res) => {
  const code = req.body.codeValue;
  // const params = new URLSearchParams();

  // let user;
  // params.append("client_id", process.env.TWITCH_CLIENT_ID);
  // params.append("client_secret", process.env.TWITCH_CLIENT_SECRET);
  // params.append("grant_type", "authorization_code");
  // params.append("code", code);
  // params.append("redirect_uri", "http://localhost:3030/api/user/authTwitch");
  try {
    // await axios.post("https://id.twitch.tv/oauth2/token", params);
    const findQuery = {
      wallet_address: req.wallet.address,
    };

    const result = await UserInfos.find(findQuery);
    if (result.length) {
      const doc = await UserInfos.findById(result[0]._id);
      doc.twitch = code;
      if (!result[0].twitch) {
        doc.bonus_percent = result[0].bonus_percent + 10;
      }
      await doc.save();
      res.status(200).send({
        message: "Successfully updated!",
      });
    } else {
      res.status(403).send({ error: "Invalid token" });
    }
  } catch (error) {
    console.log("Error", error);
    return res.send("Some error occurred! ");
  }
};

const processAuthTwitter = async (req, res) => {
  const code = req.body.codeValue;

  try {
    const findQuery = {
      wallet_address: req.wallet.address,
    };

    const result = await UserInfos.find(findQuery);
    if (result.length) {
      const doc = await UserInfos.findById(result[0]._id);
      doc.twitter = code;
      if (!result[0].twitter) {
        doc.bonus_percent = result[0].bonus_percent + 10;
      }
      await doc.save();
      res.status(200).send({
        message: "Successfully updated!",
      });
    } else {
      res.status(403).send({ error: "Invalid token" });
    }
  } catch (error) {
    console.log("Error", error);
    return res.send("Some error occurred! ");
  }
};
