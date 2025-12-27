const express = require("express");
const router = express.Router();
const controller = require("./chatFlow.controller");

// GET
router.get("/flows", controller.getFlows);
router.get("/flows/active", controller.getActiveFlow);
router.get("/flows/:id", controller.getFlowById);

// CREATE
router.post("/flows", controller.createFlow);

// UPDATE
router.put("/flows/:id", controller.updateFlow);
router.patch("/flows/:id/status", controller.updateFlowStatus);

// DELETE
router.delete("/flows/:id", controller.deleteFlow);

// EXECUTE STEP
router.post("/execute-step", controller.executeStep);

module.exports = router;
