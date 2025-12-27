const express = require("express");
const router = express.Router();
const controller = require("./chatAnalytics.controller");

// Overview stats
router.get("/overview", controller.getOverview);

// Popular categories
router.get("/popular-categories", controller.getPopularCategories);

// Hourly chat activity
router.get("/hourly-activity", controller.getHourlyActivity);

module.exports = router;
