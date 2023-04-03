const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const UserInfoSchema = new Schema({
  wallet_address: {
    type: String,
    required: true,
  },
  bonus_percent: {
    type: Number,
    required: 0,
  },
  deposit_balance: {
    type: Number,
    required: 0,
  },
  invite_sent: {
    type: Number,
    required: 0,
  },
  referral_id: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  twitter: {
    type: String,
    required: false,
  },
  discord: {
    type: String,
    required: false,
  },
  twitch: {
    type: String,
    required: false,
  },
});

module.exports = UserInfos = mongoose.model("user_info", UserInfoSchema);
