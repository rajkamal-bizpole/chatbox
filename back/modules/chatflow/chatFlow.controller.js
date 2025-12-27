const db = require("../../config/database");

// ----------------- Helpers -----------------
const safeJsonParse = (str, def = {}) => {
  if (!str) return def;
  if (typeof str === "object") return str;
  try {
    return JSON.parse(str);
  } catch {
    return def;
  }
};

const safeJsonStringify = (obj, def = "{}") => {
  try {
    return JSON.stringify(obj);
  } catch {
    return def;
  }
};

// ----------------- GET ALL FLOWS -----------------
exports.getFlows = async (req, res) => {
  try {
    const [flows] = await db.execute(`
      SELECT id, name, description, is_active, created_at, updated_at,
      (SELECT COUNT(*) FROM chat_steps WHERE chat_steps.flow_id = chat_flows.id) AS step_count
      FROM chat_flows
      ORDER BY created_at DESC
    `);

    res.json(flows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chat flows" });
  }
};

// ----------------- GET ACTIVE FLOW -----------------
exports.getActiveFlow = async (req, res) => {
  try {
    const [flows] = await db.execute(`
      SELECT * FROM chat_flows
      WHERE is_active = true
      ORDER BY updated_at DESC
      LIMIT 1
    `);

    if (!flows.length) {
      return res.status(404).json({ error: "No active chat flow found" });
    }

    const flow = flows[0];

    const [steps] = await db.execute(`
      SELECT * FROM chat_steps
      WHERE flow_id = ?
      ORDER BY sort_order ASC
    `, [flow.id]);

    res.json({
      ...flow,
      steps: steps.map(s => ({
        ...s,
        options: safeJsonParse(s.options, []),
        validation_rules: safeJsonParse(s.validation_rules, {}),
        next_step_map: safeJsonParse(s.next_step_map, {}),
        api_config: safeJsonParse(s.api_config, {}),
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch active flow" });
  }
};

// ----------------- GET FLOW BY ID -----------------
exports.getFlowById = async (req, res) => {
  try {
    const { id } = req.params;

    const [flows] = await db.execute(
      "SELECT * FROM chat_flows WHERE id = ?",
      [id]
    );

    if (!flows.length) return res.status(404).json({ error: "Flow not found" });

    const [steps] = await db.execute(
      "SELECT * FROM chat_steps WHERE flow_id = ? ORDER BY sort_order ASC",
      [id]
    );

    res.json({
      ...flows[0],
      steps: steps.map(s => ({
        ...s,
        options: safeJsonParse(s.options, []),
        validation_rules: safeJsonParse(s.validation_rules, {}),
        next_step_map: safeJsonParse(s.next_step_map, {}),
        api_config: safeJsonParse(s.api_config, {}),
      }))
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch flow" });
  }
};

// ----------------- CREATE FLOW -----------------
exports.createFlow = async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const { name, description, is_active, steps = [] } = req.body;

    const [flow] = await conn.execute(
      `INSERT INTO chat_flows (name, description, is_active)
       VALUES (?, ?, ?)`,
      [name, description || "", is_active]
    );

    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      await conn.execute(
        `INSERT INTO chat_steps 
        (flow_id, step_key, step_type, message_text, options, validation_rules, next_step_map, api_config, is_initial, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          flow.insertId,
          s.step_key,
          s.step_type || "message",
          s.message_text,
          safeJsonStringify(s.options),
          safeJsonStringify(s.validation_rules),
          safeJsonStringify(s.next_step_map),
          safeJsonStringify(s.api_config),
          s.is_initial || false,
          s.sort_order ?? i
        ]
      );
    }

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    if (conn) await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
};

// ----------------- UPDATE FLOW -----------------
exports.updateFlow = async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    const { name, description, is_active, steps } = req.body;

    conn = await db.getConnection();
    await conn.beginTransaction();

    await conn.execute(
      "UPDATE chat_flows SET name=?, description=?, is_active=?, updated_at=NOW() WHERE id=?",
      [name, description, is_active, id]
    );

    await conn.execute("DELETE FROM chat_steps WHERE flow_id=?", [id]);

    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      await conn.execute(
        `INSERT INTO chat_steps
        (flow_id, step_key, step_type, message_text, options, validation_rules, next_step_map, api_config, is_initial, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          s.step_key,
          s.step_type,
          s.message_text,
          safeJsonStringify(s.options),
          safeJsonStringify(s.validation_rules),
          safeJsonStringify(s.next_step_map),
          safeJsonStringify(s.api_config),
          s.is_initial,
          s.sort_order ?? i
        ]
      );
    }

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    if (conn) await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
};

// ----------------- DELETE FLOW -----------------
exports.deleteFlow = async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    await conn.execute("DELETE FROM chat_steps WHERE flow_id=?", [req.params.id]);
    await conn.execute("DELETE FROM chat_flows WHERE id=?", [req.params.id]);

    await conn.commit();
    res.json({ message: "Chat flow deleted successfully" });
  } catch (err) {
    if (conn) await conn.rollback();
    res.status(500).json({ error: "Failed to delete chat flow" });
  } finally {
    if (conn) conn.release();
  }
};

// ----------------- UPDATE FLOW STATUS -----------------
exports.updateFlowStatus = async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    conn = await db.getConnection();

    if (is_active) {
      await conn.execute("UPDATE chat_flows SET is_active = false");
    }

    await conn.execute(
      "UPDATE chat_flows SET is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
      [is_active, id]
    );

    res.json({ message: "Flow status updated", is_active });
  } catch (err) {
    res.status(500).json({ error: "Failed to update flow status" });
  } finally {
    if (conn) conn.release();
  }
};

// ----------------- EXECUTE STEP -----------------
exports.executeStep = async (req, res) => {
  try {
    const { step_key, user_input, user_data } = req.body;

    res.json({
      success: true,
      user_data: {
        ...user_data,
        [step_key]: user_input
      },
      next_step: null,
      message: "Step executed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to execute step"
    });
  }
};
