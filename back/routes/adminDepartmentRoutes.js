const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Get all department requests
router.get("/requests", async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM department_requests ORDER BY id DESC"
  );
  return res.json({ success: true, requests: rows });
});

// Mark request resolved
router.put("/resolve/:id", async (req, res) => {
  const id = req.params.id;

  await db.query(
    "UPDATE department_requests SET status = 'resolved' WHERE id = ?",
    [id]
  );

  return res.json({
    success: true,
    message: "Marked resolved"
  });
});

module.exports = router;
