const db = require("../../config/database");

/* ------------------------------------
   Get all department requests
------------------------------------- */
exports.getRequests = async (req, res) => {
  const [rows] = await db.query(`
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
  `);

  return res.json({ success: true, requests: rows });
};

/* ------------------------------------
   Resolve department request
------------------------------------- */
exports.resolveRequest = async (req, res) => {
  const id = req.params.id;

  try {
    // 1) Mark department request resolved
    await db.query(
      "UPDATE department_requests SET status='resolved', updated_at=NOW() WHERE id=?",
      [id]
    );

    // 2) Get related session_id
    const [rows] = await db.query(
      "SELECT session_id FROM department_requests WHERE id=?",
      [id]
    );

    if (rows.length > 0) {
      const sessionId = rows[0].session_id;

      // 3) Update chat session status
      await db.query(
        "UPDATE chat_sessions SET status='resolved', updated_at=NOW() WHERE id=?",
        [sessionId]
      );
    }

    return res.json({
      success: true,
      message: "Marked resolved and updated session status.",
    });
  } catch (err) {
    console.error("Resolve error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to resolve request",
    });
  }
};

/* ------------------------------------
   Get full chat history
------------------------------------- */
exports.getChatHistory = async (req, res) => {
  const sessionId = req.params.session_id;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        id,
        message_type,
        content,
        step,
        created_at
      FROM chat_messages
      WHERE session_id = ?
      ORDER BY id ASC
      `,
      [sessionId]
    );

    return res.json({ success: true, messages: rows });
  } catch (err) {
    console.error("Chat history error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load chat history",
    });
  }
};
