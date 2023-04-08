const express = require("express");
const router = express.Router();

const TwitterController = require("../../controllers/TwitterController");

router.get("/getFeed", TwitterController.getFeed);

module.exports = router;
