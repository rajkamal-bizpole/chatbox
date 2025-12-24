const express = require("express");
const router = express.Router();
const controller = require("./department.controller");

// Get all department requests
router.get("/requests", controller.getRequests);

// Mark request resolved
router.put("/resolve/:id", controller.resolveRequest);

// Get full chat history for a session
router.get("/chat/:session_id", controller.getChatHistory);

module.exports = router;
