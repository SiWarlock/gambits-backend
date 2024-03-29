const axios = require("axios");
const { ethers } = require("ethers");
const { SiweMessage, generateNonce } = require("siwe");
const UserInfos = require("../models/UserInfo");
const userHelper = require("../helpers/users");
const jwt = require("jsonwebtoken");
const { validateHeader } = require("../validation/header");
const sgMail = require("@sendgrid/mail");

// Store the nonce for checking against log-in
let nonce;

exports.getNonce = async (req, res) => {
  nonce = generateNonce();
  res.send(nonce);
};

exports.signUser = async (req, res) => {
  if (req.body) {
    try {
      const { email, referralCode, message, signature } = req.body;
      const messageSIWE = new SiweMessage(message);
      const provider = ethers.getDefaultProvider();
      const fields = await messageSIWE.validate(signature, provider);
      if (fields.nonce !== nonce) {
        res.status(422).json({
          message: "Invalid nonce: Client and Server nonce mismatch",
        });
        return;
      }
      console.debug(fields);

      const isNew = await userHelper.getUser(fields.address);

      if (isNew) {
        if (email === "") {
          res.status(401).send({ error: "email required" });
        } else {
          if (!!referralCode) {
            try {
              const result = await UserInfos.findById(referralCode);
              result.invite_sent = result.invite_sent + 1;
              result.save();
              await userHelper.addUser(fields.address, email, referralCode);
            } catch (err) {
              res.status(405).send({ error });
            }
          } else await userHelper.addUser(fields.address, email, "");
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
            id: result[0]._id,
            wallet_address: result[0].wallet_address,
            deposit_balance: result[0].deposit_balance,
            bonus_percent: result[0].bonus_percent,
            invite_sent: result[0].invite_sent,
            email: result[0]?.email,
            referral_id: result[0]?.referral_id,
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

exports.emailVerify = async (req, res) => {
  const email = req.body.email;
  const code = req.body.code;
  sgMail.setApiKey(process.env.SENDGRID_API);
  const msg = {
    to: email,
    from: "sales@gambits.com",
    subject: "Gambits Confirm Email",
    replyTo: "sales@gambits.com",
    html: `
            <div style="color:#757575 !important">
            <h1 style="text-align:center">Gambits</h1>
            <p style="font-family: 'Open Sans','Roboto','Helvetica Neue',Helvetica,Arial,sans-serif;
            font-size: 16px;
            color: #757575;
            line-height: 150%;
            letter-spacing: normal;">Hello </p>
            <p style="font-family: 'Open Sans','Roboto','Helvetica Neue',Helvetica,Arial,sans-serif;
            font-size: 16px;
            color: #757575;
            line-height: 150%;
            letter-spacing: normal;">Thank you for signing up to Gambits! We're excited to have you onboard and will be happy to help you set everything up.</p>
            <p style="font-family: 'Open Sans','Roboto','Helvetica Neue',Helvetica,Arial,sans-serif;
            font-size: 16px;
            color: #757575;
            line-height: 150%;
            letter-spacing: normal;">Here are verification code for your email(${email}).</p>
            <p style="font-family: 'Open Sans','Roboto','Helvetica Neue',Helvetica,Arial,sans-serif;
            font-size: 25px;
            color: #757575;
            line-height: 150%;
            letter-spacing: normal;">${code}</p>
            <p style="font-family: 'Open Sans','Roboto','Helvetica Neue',Helvetica,Arial,sans-serif;
            font-size: 16px;
            color: #757575;
            line-height: 150%;
            letter-spacing: normal;">Please let us know if you have any questions, feature requests, or general feedback simply by replying to this email.</p>
            <p style="font-family: 'Open Sans','Roboto','Helvetica Neue',Helvetica,Arial,sans-serif;
            font-size: 16px;
            color: #757575;
            line-height: 150%;
            letter-spacing: normal;">Best regards,</p>
            <p style="font-family: 'Open Sans','Roboto','Helvetica Neue',Helvetica,Arial,sans-serif;
            font-size: 16px;
            color: #757575;
            line-height: 150%;
            letter-spacing: normal;">Gambits Support team</p>
            </div>
            `,
  };
  sgMail
    .send(msg)
    .then(() => {
      res.status(200).send({ message: "Successfully" });
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send({ error: error });
    });
};

exports.getFreePlayBonusAmount = async (req, res) => {
  if (validateHeader(req)) {
    try {
      const { id } = req.body;
      const result = await UserInfos.find({
        referral_id: id,
      });
      var amount = 0;
      for (i = 0; i < result.length; i++) {
        amount += result[i].deposit_balance;
      }
      res.status(200).json({
        success: true,
        amount: amount,
      });
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
  
  try {
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
  try {
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
