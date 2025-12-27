const express = require("express");
const router = express.Router();
const controller = require("./departmentApi.controller");

// Department routing
router.post("/billing", controller.billing);
router.post("/technical", controller.technical);
router.post("/accounts", controller.accounts);
router.post("/compliance", controller.compliance);

module.exports = router;
