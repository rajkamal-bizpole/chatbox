const express = require("express");
const router = express.Router();
const controller = require("./chat.controller");

// Session
router.post("/session/start", controller.startSession);
router.post("/session/resolve", controller.resolveSession);

// Messages
router.post("/message/save", controller.saveMessage);

// Tickets
router.post("/ticket/create", controller.createTicket);

// Admin
router.get("/admin/sessions", controller.getAdminSessions);
router.get("/admin/session/:sessionId", controller.getAdminSessionDetails);
router.get("/admin/tickets", controller.getAdminTickets);
router.put("/admin/ticket/:ticketId", controller.updateTicket);

// Validation
router.post("/validate-phone", controller.validatePhone);
router.post("/validate-email", controller.validateEmail);

module.exports = router;
