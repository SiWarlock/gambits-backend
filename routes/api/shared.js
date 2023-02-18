const express = require("express");
const router = express.Router();

const UserInfoController = require("../../controllers/UserInfoController");

router.get("/nonce", UserInfoController.getNonce);

module.exports = router;
