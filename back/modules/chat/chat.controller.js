const db = require("../../config/database");

/* -------------------------
   Helpers (unchanged)
-------------------------- */
function mapSessionStatus(dbStatus) {
  switch (dbStatus) {
    case "resolved":
    case "closed":
      return "completed";
    default:
      return dbStatus;
  }
}

const generateSessionToken = () =>
  "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

/* -------------------------
   Start new chat session
-------------------------- */
exports.startSession = async (req, res) => {
  try {
    const { user_id, phone, email } = req.body;
    const sessionToken = generateSessionToken();

    const [users] = await db.query(
      "SELECT id, username, email FROM users WHERE phone = ? OR email = ?",
      [phone, email]
    );

    let is_existing_customer = 0;
    let customer_name = null;
    let resolved_user_id = user_id || null;
    let resolved_email = email || null;

    if (users.length > 0) {
      is_existing_customer = 1;
      customer_name = users[0].username;
      resolved_user_id = users[0].id;
      resolved_email = users[0].email;
    }

    const [result] = await db.query(
      `
      INSERT INTO chat_sessions
      (user_id, phone, email, session_token, status, is_existing_customer, customer_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        resolved_user_id,
        phone || null,
        resolved_email || null,
        sessionToken,
        "active",
        is_existing_customer,
        customer_name,
      ]
    );

    res.json({
      success: true,
      session_token: sessionToken,
      session_id: result.insertId,
      is_existing_customer,
      customer_name,
    });
  } catch (err) {
    console.error("Session creation error:", err);
    res.status(500).json({ success: false, message: "Failed to start chat session" });
  }
};

/* -------------------------
   Save chat message
-------------------------- */
exports.saveMessage = async (req, res) => {
  try {
    const { session_token, message_type, content, message_data, step } = req.body;

    const [sessions] = await db.query(
      "SELECT id FROM chat_sessions WHERE session_token = ?",
      [session_token]
    );

    if (!sessions.length) {
      return res.status(404).json({ success: false, message: "Chat session not found" });
    }

    const session_id = sessions[0].id;
    const trimmedContent = content?.trim() || "";

    /* PHONE DETECTION */
    const cleanPhone = trimmedContent.replace(/\D/g, "");
    const isPhoneStep =
      step === "phone" ||
      step === "phone_number" ||
      step === "contact_phone" ||
      cleanPhone.length === 10;

    if (isPhoneStep && cleanPhone.length === 10) {
      const [users] = await db.query(
        "SELECT id, username, email, phone FROM users WHERE phone = ?",
        [cleanPhone]
      );

      if (users.length > 0) {
        const u = users[0];
        await db.query(
          `
          UPDATE chat_sessions
          SET user_id=?, phone=?, email=?, customer_name=?, is_existing_customer=1, updated_at=NOW()
          WHERE id=?
          `,
          [u.id, u.phone, u.email, u.username, session_id]
        );
      } else {
        await db.query(
          "UPDATE chat_sessions SET phone=?, updated_at=NOW() WHERE id=?",
          [cleanPhone, session_id]
        );
      }
    }

    /* EMAIL DETECTION */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailStep = step === "email" || emailRegex.test(trimmedContent);

    if (isEmailStep && emailRegex.test(trimmedContent)) {
      const emailInput = trimmedContent.toLowerCase();
      const [users] = await db.query(
        "SELECT id, username, email, phone FROM users WHERE email=?",
        [emailInput]
      );

      if (users.length > 0) {
        const u = users[0];
        await db.query(
          `
          UPDATE chat_sessions
          SET user_id=?, email=?, phone=?, customer_name=?, is_existing_customer=1, updated_at=NOW()
          WHERE id=?
          `,
          [u.id, u.email, u.phone, u.username, session_id]
        );
      } else {
        await db.query(
          `
          UPDATE chat_sessions
          SET email=?, is_existing_customer=0, updated_at=NOW()
          WHERE id=?
          `,
          [emailInput, session_id]
        );
      }
    }

    const messageDataString =
      typeof message_data === "string" ? message_data : JSON.stringify(message_data || {});

    const [result] = await db.query(
      `
      INSERT INTO chat_messages (session_id, message_type, content, message_data, step)
      VALUES (?, ?, ?, ?, ?)
      `,
      [session_id, message_type, trimmedContent, messageDataString, step || ""]
    );

    res.json({ success: true, message_id: result.insertId });
  } catch (err) {
    console.error("❌ Message save error:", err);
    res.status(500).json({ success: false, message: "Failed to save message" });
  }
};

/* -------------------------
   Create support ticket
-------------------------- */
exports.createTicket = async (req, res) => {
  try {
    const { session_token, issue_type, sub_issue, description, priority, user_data } = req.body;

    const finalDescription =
      description || `Issue raised by customer. Data: ${JSON.stringify(user_data)}`;

    const ticket_number = "BZ" + Date.now().toString().slice(-6);

    const [sessions] = await db.query(
      "SELECT id FROM chat_sessions WHERE session_token = ?",
      [session_token]
    );

    if (!sessions.length) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found",
      });
    }

    const session_id = sessions[0].id;

    const [result] = await db.query(
      `
      INSERT INTO support_tickets 
      (session_id, ticket_number, issue_type, sub_issue, description, priority)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        session_id,
        ticket_number,
        issue_type || "General",
        sub_issue || "Other",
        finalDescription,
        priority || "medium",
      ]
    );

    await db.query(
      "UPDATE chat_sessions SET status='escalated' WHERE id=?",
      [session_id]
    );

    res.json({
      success: true,
      ticket_id: result.insertId,
      ticket_number,
    });
  } catch (err) {
    console.error("Ticket creation error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create support ticket",
    });
  }
};

/* -------------------------
   Resolve chat session
-------------------------- */
exports.resolveSession = async (req, res) => {
  try {
    const { session_token } = req.body;

    const [rows] = await db.query(
      "SELECT id FROM chat_sessions WHERE session_token = ?",
      [session_token]
    );

    if (!rows.length) {
      return res.json({ success: false, message: "Session not found" });
    }

    await db.query(
      "UPDATE chat_sessions SET status='resolved', updated_at=NOW() WHERE id=?",
      [rows[0].id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Server error" });
  }
};

/* -------------------------
   Admin: Get sessions
-------------------------- */
exports.getAdminSessions = async (req, res) => {
  try {
    const [sessions] = await db.query(`
      SELECT 
        cs.id,
        cs.session_token,
        cs.phone,
        cs.status,
        cs.customer_name,
        cs.is_existing_customer,
        cs.user_id,
        cs.created_at,
        COALESCE(cs.updated_at, cs.created_at) as last_activity,
        COUNT(DISTINCT cm.id) as message_count,
        (
          SELECT ticket_number 
          FROM support_tickets 
          WHERE session_id = cs.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) as latest_ticket,
        (
          SELECT dr.department
          FROM department_requests dr
          WHERE dr.session_id = cs.id
          ORDER BY dr.created_at DESC
          LIMIT 1
        ) as department,
        u.email as user_email
      FROM chat_sessions cs
      LEFT JOIN chat_messages cm ON cs.id = cm.session_id
      LEFT JOIN users u ON cs.user_id = u.id
      GROUP BY cs.id
      ORDER BY last_activity DESC
    `);

    res.json({
      success: true,
      sessions: sessions.map((s) => ({
        ...s,
        is_existing_customer: Boolean(s.is_existing_customer),
        phone: s.phone || null,
        customer_name: s.customer_name || null,
        email: s.user_email || null,
        department: s.department || "unassigned",
        last_activity: s.last_activity || s.created_at,
      })),
    });
  } catch (error) {
    console.error("Admin sessions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sessions",
    });
  }
};

/* -------------------------
   Admin: Session details
-------------------------- */
exports.getAdminSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const [sessions] = await db.query(
      `
      SELECT 
        cs.*,
        u.email as user_email,
        (
          SELECT dr.department
          FROM department_requests dr
          WHERE dr.session_id = cs.id
          ORDER BY dr.created_at DESC
          LIMIT 1
        ) as department
      FROM chat_sessions cs
      LEFT JOIN users u ON cs.user_id = u.id
      WHERE cs.id = ?
      `,
      [sessionId]
    );

    if (!sessions.length) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const session = sessions[0];

    const [messages] = await db.query(
      "SELECT * FROM chat_messages WHERE session_id=? ORDER BY created_at ASC",
      [sessionId]
    );

    const [tickets] = await db.query(
      "SELECT * FROM support_tickets WHERE session_id=? ORDER BY created_at DESC",
      [sessionId]
    );

    res.json({
      success: true,
      session: {
        ...session,
        email: session.user_email,
        department: session.department || "unassigned",
        is_existing_customer: Boolean(session.is_existing_customer),
      },
      messages: messages.map((msg) => ({
        ...msg,
        message_data:
          typeof msg.message_data === "string"
            ? JSON.parse(msg.message_data || "{}")
            : msg.message_data,
      })),
      tickets,
    });
  } catch (error) {
    console.error("Session details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch session details",
    });
  }
};

/* -------------------------
   Admin: Tickets list
-------------------------- */
exports.getAdminTickets = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        st.*,
        cs.id AS session_id,
        cs.phone,
        cs.customer_name,
        cs.email
      FROM support_tickets st
      LEFT JOIN chat_sessions cs ON st.session_id = cs.id
      ORDER BY st.created_at DESC
    `);

    res.json({ success: true, tickets: rows });
  } catch (err) {
    console.error("Admin tickets error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
    });
  }
};

/* -------------------------
   Admin: Update ticket
-------------------------- */
exports.updateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const updates = [];
    const values = [];

    if (req.body.status !== undefined) {
      updates.push("status=?");
      values.push(req.body.status);
    }

    if (req.body.priority !== undefined) {
      updates.push("priority=?");
      values.push(req.body.priority);
    }

    if (req.body.assigned_to !== undefined) {
      updates.push("assigned_to=?");
      values.push(req.body.assigned_to);
    }

    if (!updates.length) {
      return res.json({ success: false, message: "No fields to update" });
    }

    values.push(ticketId);

    await db.query(
      `UPDATE support_tickets SET ${updates.join(", ")} WHERE id=?`,
      values
    );

    res.json({ success: true, message: "Ticket updated successfully" });
  } catch (err) {
    console.error("Ticket update error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update ticket",
    });
  }
};

/* -------------------------
   Validate phone
-------------------------- */
exports.validatePhone = async (req, res) => {
  try {
    const cleanPhone = (req.body.user_input || "").replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      return res.json({
        success: false,
        user_data: {
          phone_valid: false,
          error_message: "Please enter a valid 10-digit mobile number.",
        },
      });
    }

    const [users] = await db.query(
      "SELECT id, username FROM users WHERE phone=?",
      [cleanPhone]
    );

    if (users.length) {
      return res.json({
        success: true,
        user_data: {
          phone_valid: true,
          customer_name: users[0].username,
          phone: cleanPhone,
        },
      });
    }

    res.json({
      success: false,
      user_data: {
        phone_valid: false,
        error_message: "This number is not registered. Please try again.",
      },
    });
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      user_data: {
        phone_valid: false,
        error_message: "Server Error. Try again later.",
      },
    });
  }
};

/* -------------------------
   Validate email
-------------------------- */
exports.validateEmail = async (req, res) => {
  try {
    const email = (req.body.user_input || "").trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.json({
        success: false,
        user_data: {
          email_valid: false,
          error_message: "Please enter a valid email address.",
        },
      });
    }

    const [users] = await db.query(
      "SELECT id, username FROM users WHERE email=?",
      [email]
    );

    if (users.length) {
      return res.json({
        success: true,
        user_data: {
          email_valid: true,
          customer_name: users[0].username,
          email,
        },
      });
    }

    res.json({
      success: false,
      user_data: {
        email_valid: false,
        error_message: "This email is not registered. Please try again.",
      },
    });
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      user_data: {
        email_valid: false,
        error_message: "Server Error. Try again later.",
      },
    });
  }
};


