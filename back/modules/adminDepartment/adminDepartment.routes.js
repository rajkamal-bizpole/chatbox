const express = require("express");
const router = express.Router();
const controller = require("./adminDepartment.controller");

// Get all department requests
router.get("/requests", controller.getRequests);

// Resolve department request
router.put("/resolve/:id", controller.resolveRequest);

// Get chat history by session
router.get("/chat/:session_id", controller.getChatHistory);

module.exports = router;
