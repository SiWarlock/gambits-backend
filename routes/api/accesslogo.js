const express = require("express");
const router = express.Router();

const LogoController = require("../../controllers/LogoController");

router.get("/getLogoHistory", LogoController.getLogoData);
router.get("/insert", LogoController.insertLogoData);

module.exports = router;