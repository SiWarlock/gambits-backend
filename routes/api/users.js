const express = require("express");
const router = express.Router();

const UserInfoController = require("../../controllers/UserInfoController");

// router.post("/updateUser", UserInfoController.updateUser);
router.post("/signUser", UserInfoController.signUser);
router.post("/addEmail", UserInfoController.addEmail);
router.get("/authDiscord", UserInfoController.authDiscord);
router.get("/authTwitch", UserInfoController.authTwitch);
router.get("/authTwitter", UserInfoController.authTwitter);
router.post("/auth", UserInfoController.processAuth);
router.get("/info", UserInfoController.getUserInfoData);
router.post("/emailVerify", UserInfoController.emailVerify);

module.exports = router;
