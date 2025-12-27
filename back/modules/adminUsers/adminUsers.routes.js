const express = require("express");
const router = express.Router();
const controller = require("./adminUsers.controller");

// Get all users
router.get("/", controller.getAllUsers);

// Get user by ID
router.get("/:id", controller.getUserById);

// Create user
router.post("/", controller.createUser);

// Update user
router.put("/:id", controller.updateUser);

// Delete user
router.delete("/:id", controller.deleteUser);

module.exports = router;
