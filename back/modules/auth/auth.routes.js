const express = require("express");
const router = express.Router();
const controller = require("./auth.controller");

router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.get("/verify", controller.verifyToken);
router.post("/logout", controller.logout);

module.exports = router;
