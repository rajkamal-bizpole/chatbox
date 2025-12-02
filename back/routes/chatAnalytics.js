const express = require('express');
const router = express.Router();
const db = require('../config/database');

/* -----------------------------------------------------
   HELPER: Safely extract JSON values in SQL
------------------------------------------------------ */

// returns: JSON_EXTRACT(column, '$.path') OR NULL IF invalid
const JSON_SENDER = (alias) => `
  JSON_UNQUOTE(JSON_EXTRACT(${alias}.message_data, '$.sender'))
`;

/* -----------------------------------------------------
   1️⃣  OVERVIEW ANALYTICS
   - total chats
   - resolved chats
   - average response time
------------------------------------------------------ */
/* -----------------------------------------------------
   1️⃣  OVERVIEW ANALYTICS (IMPROVED)
------------------------------------------------------ */
router.get('/overview', async (req, res) => {
  try {
    // Use Promise.all for parallel queries
    const [totalResult, resolvedResult, responseTimeResult] = await Promise.all([
      // Total chat sessions
      db.query(`SELECT COUNT(*) AS totalChats FROM chat_sessions`),
      
      // Resolved sessions - FIXED: Using status column properly
      db.query(`SELECT COUNT(*) AS resolvedChats FROM chat_sessions WHERE status = 'completed' OR status = 'resolved'`),
      
      // Average response time
      db.query(`
        SELECT 
          AVG(TIMESTAMPDIFF(
            SECOND,
            /* first user message */
            (SELECT MIN(created_at) 
               FROM chat_messages m1
               WHERE m1.session_id = cs.id
                 AND ${JSON_SENDER("m1")} = 'user'),
            
            /* first admin message */
            (SELECT MIN(created_at) 
               FROM chat_messages m2
               WHERE m2.session_id = cs.id
                 AND ${JSON_SENDER("m2")} = 'admin'
                 AND created_at > (
                   SELECT MIN(created_at) 
                   FROM chat_messages m3
                   WHERE m3.session_id = cs.id
                     AND ${JSON_SENDER("m3")} = 'user'
                 ))
          )) AS avg_response_seconds
        FROM chat_sessions cs
        WHERE EXISTS (
          SELECT 1 FROM chat_messages m2
          WHERE m2.session_id = cs.id
            AND ${JSON_SENDER("m2")} = 'admin'
        )
      `)
    ]);

    const totalChats = totalResult[0][0]?.totalChats || 0;
    const resolvedChats = resolvedResult[0][0]?.resolvedChats || 0;
    const avgSeconds = responseTimeResult[0][0]?.avg_response_seconds || 0;

    // Format response time
    let averageResponseTime;
    if (avgSeconds === 0 || avgSeconds === null) {
      averageResponseTime = "N/A";
    } else if (avgSeconds < 60) {
      averageResponseTime = `${Math.round(avgSeconds)} seconds`;
    } else if (avgSeconds < 3600) {
      averageResponseTime = `${(avgSeconds / 60).toFixed(1)} minutes`;
    } else {
      averageResponseTime = `${(avgSeconds / 3600).toFixed(1)} hours`;
    }

    return res.json({
      success: true,
      totalChats,
      resolvedChats,
      averageResponseTime
    });

  } catch (err) {
    console.error("🔥 Analytics Overview Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load analytics"
    });
  }
});
/* -----------------------------------------------------
   2️⃣  POPULAR CATEGORIES (from support_tickets.issue_type)
------------------------------------------------------ */
router.get('/popular-categories', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        issue_type AS category,
        COUNT(*) AS count
      FROM support_tickets
      GROUP BY issue_type
      ORDER BY count DESC
      LIMIT 10
    `);

    return res.json({ success: true, categories: rows });

  } catch (err) {
    console.error("🔥 Popular Categories Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load categories"
    });
  }
});

/* -----------------------------------------------------
   3️⃣  HOURLY CHAT ACTIVITY
------------------------------------------------------ */
router.get('/hourly-activity', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%h %p') AS hour,
        COUNT(*) AS chats
      FROM chat_sessions
      GROUP BY hour
      ORDER BY MIN(created_at)
    `);

    return res.json({ success: true, hourlyActivity: rows });

  } catch (err) {
    console.error("🔥 Hourly Activity Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load hourly activity"
    });
  }
});

module.exports = router;
