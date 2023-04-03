const UserInfos = require("../models/UserInfo");

exports.addUser = async (wallet_address, email, referral_id) => {
  const _insertData = new UserInfos({
    wallet_address,
    email,
    referral_id,
    bonus_percent: 0,
    deposit_balance: 0,
    invite_sent: 0,
  });
  await _insertData.save();
};

exports.getUser = async (wallet_address) => {
  try {
    const result = await UserInfos.find({
      wallet_address,
    });
    if (result.length === 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};
