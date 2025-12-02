const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Get all department requests
router.get("/requests", async (req, res) => {
  const [rows] = await db.query(
    `
    SELECT 
      id,
      session_id,
      department,
      status,
      message,
      chat_logs,
      created_at,
      updated_at
    FROM department_requests
    ORDER BY id DESC
    `
  );

  return res.json({ success: true, requests: rows });
});

// Mark request resolved
// PUT /admin/departments/resolve/:id
router.put("/resolve/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // 1) mark the department request resolved & set resolved time
    await db.query(
      "UPDATE department_requests SET status = 'resolved', updated_at = NOW() WHERE id = ?",
      [id]
    );

    // 2) get the related session_id
    const [rows] = await db.query(
      "SELECT session_id FROM department_requests WHERE id = ?",
      [id]
    );

    if (rows.length > 0) {
      const sessionId = rows[0].session_id;

      // 3) update chat_sessions status to 'resolved' (or 'closed' if you prefer)
      await db.query(
        "UPDATE chat_sessions SET status = 'resolved', updated_at = NOW() WHERE id = ?",
        [sessionId]
      );
    }

    return res.json({ success: true, message: "Marked resolved and updated session status." });
  } catch (err) {
    console.error("Resolve error:", err);
    return res.status(500).json({ success: false, message: "Failed to resolve request" });
  }
});


module.exports = router;
