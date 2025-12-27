const db = require("../../config/database");

/* -----------------------------------------------------
   HELPER: Safely extract JSON values in SQL
------------------------------------------------------ */
const JSON_SENDER = (alias) => `
  JSON_UNQUOTE(JSON_EXTRACT(${alias}.message_data, '$.sender'))
`;

/* -----------------------------------------------------
   1️⃣ OVERVIEW ANALYTICS
------------------------------------------------------ */
exports.getOverview = async (req, res) => {
  try {
    const [totalResult, resolvedResult, responseTimeResult] = await Promise.all([
      db.query(`SELECT COUNT(*) AS totalChats FROM chat_sessions`),

      db.query(`
        SELECT COUNT(*) AS resolvedChats 
        FROM chat_sessions 
        WHERE status = 'completed' OR status = 'resolved'
      `),

      db.query(`
        SELECT 
          AVG(
            TIMESTAMPDIFF(
              SECOND,
              (SELECT MIN(created_at)
               FROM chat_messages m1
               WHERE m1.session_id = cs.id
                 AND ${JSON_SENDER("m1")} = 'user'),
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
            )
          ) AS avg_response_seconds
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

    let averageResponseTime = "N/A";
    if (avgSeconds) {
      if (avgSeconds < 60) averageResponseTime = `${Math.round(avgSeconds)} seconds`;
      else if (avgSeconds < 3600) averageResponseTime = `${(avgSeconds / 60).toFixed(1)} minutes`;
      else averageResponseTime = `${(avgSeconds / 3600).toFixed(1)} hours`;
    }

    res.json({
      success: true,
      totalChats,
      resolvedChats,
      averageResponseTime
    });
  } catch (err) {
    console.error("🔥 Analytics Overview Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load analytics"
    });
  }
};

/* -----------------------------------------------------
   2️⃣ POPULAR CATEGORIES
------------------------------------------------------ */
exports.getPopularCategories = async (req, res) => {
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

    res.json({ success: true, categories: rows });
  } catch (err) {
    console.error("🔥 Popular Categories Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load categories"
    });
  }
};

/* -----------------------------------------------------
   3️⃣ HOURLY CHAT ACTIVITY
------------------------------------------------------ */
exports.getHourlyActivity = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%h %p') AS hour,
        COUNT(*) AS chats
      FROM chat_sessions
      GROUP BY hour
      ORDER BY MIN(created_at)
    `);

    res.json({ success: true, hourlyActivity: rows });
  } catch (err) {
    console.error("🔥 Hourly Activity Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load hourly activity"
    });
  }
};
