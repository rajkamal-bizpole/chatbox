const express = require('express');
const router = express.Router();
const db = require('../config/database');
function mapSessionStatus(dbStatus) {
  switch (dbStatus) {
    case "resolved":
    case "closed":
      return "completed"; // UI expects this value
    default:
      return dbStatus;    // active, escalated
  }
}
// Generate unique session token
const generateSessionToken = function() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Start new chat session
router.post('/session/start', async function(req, res) {
    try {
        const { user_id, phone, email } = req.body;
        const sessionToken = generateSessionToken();

        // Check if phone belongs to existing user
        const checkUserQuery = "SELECT id, username, email FROM users WHERE phone = ? OR email = ?";
        const [users] = await db.query(checkUserQuery, [phone, email]);

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

        const query = `
            INSERT INTO chat_sessions 
            (user_id, phone, email, session_token, status, is_existing_customer, customer_name)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
const [result] = await db.query(query, [
    resolved_user_id,
    phone || null,
    email || null,    // ✔ FIXED
    sessionToken,
    'active',
    is_existing_customer,
    customer_name
]);


        res.json({
            success: true,
            session_token: sessionToken,
            session_id: result.insertId,
            is_existing_customer,
            customer_name
        });

    } catch (err) {
        console.error('Session creation error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to start chat session'
        });
    }
});


// Save chat message
// routes/chat.js - Updated message/save endpoint
router.post('/message/save', async function (req, res) {
    try {
        const { session_token, message_type, content, message_data, step } = req.body;

        // 1. Get session
        const [sessions] = await db.query(
            "SELECT id FROM chat_sessions WHERE session_token = ?",
            [session_token]
        );

        if (!sessions.length) {
            return res.status(404).json({
                success: false,
                message: 'Chat session not found'
            });
        }

        const session_id = sessions[0].id;
        const trimmedContent = content?.trim() || "";

        // ===========================================================
        // 📱 2. PHONE DETECTION
        // ===========================================================
        const cleanPhone = trimmedContent.replace(/\D/g, "");
        const isPhoneStep =
            step === 'phone' ||
            step === 'phone_number' ||
            step === 'contact_phone' ||
            cleanPhone.length === 10;

        if (isPhoneStep && cleanPhone.length === 10) {
            const [users] = await db.query(
                "SELECT id, username, email, phone FROM users WHERE phone = ?",
                [cleanPhone]
            );

            if (users.length > 0) {
                const u = users[0];

                await db.query(
                    `UPDATE chat_sessions 
                     SET user_id = ?, 
                         phone = ?, 
                         email = ?,         -- ✔ synced email
                         customer_name = ?, 
                         is_existing_customer = 1, 
                         updated_at = NOW()
                     WHERE id = ?`,
                    [u.id, u.phone, u.email, u.username, session_id]
                );
            } else {
                await db.query(
                    `UPDATE chat_sessions 
                     SET phone = ?, updated_at = NOW()
                     WHERE id = ?`,
                    [cleanPhone, session_id]
                );
            }
        }

        // ===========================================================
        // 📧 3. EMAIL DETECTION
        // ===========================================================
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmailStep = step === "email" || emailRegex.test(trimmedContent);

        if (isEmailStep && emailRegex.test(trimmedContent)) {
            const emailInput = trimmedContent.toLowerCase();

            const [users] = await db.query(
                "SELECT id, username, email, phone FROM users WHERE email = ?",
                [emailInput]
            );

            if (users.length > 0) {
                const u = users[0];

                await db.query(
                    `UPDATE chat_sessions
                     SET user_id = ?, 
                         email = ?, 
                         phone = ?,         -- ✔ synced phone
                         customer_name = ?, 
                         is_existing_customer = 1, 
                         updated_at = NOW()
                     WHERE id = ?`,
                    [u.id, u.email, u.phone, u.username, session_id]
                );
            } else {
                await db.query(
                    `UPDATE chat_sessions 
                     SET email = ?, 
                         is_existing_customer = 0,
                         updated_at = NOW()
                     WHERE id = ?`,
                    [emailInput, session_id]
                );
            }
        }

        // ===========================================================
        // 💾 4. SAVE CHAT MESSAGE
        // ===========================================================
        const messageDataString =
            typeof message_data === "string"
                ? message_data
                : JSON.stringify(message_data || {});

        const [result] = await db.query(
            `INSERT INTO chat_messages (session_id, message_type, content, message_data, step)
             VALUES (?, ?, ?, ?, ?)`,
            [session_id, message_type, trimmedContent, messageDataString, step || ""]
        );

        return res.json({
            success: true,
            message_id: result.insertId
        });

    } catch (err) {
        console.error("❌ Message save error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to save message"
        });
    }
});


// Create support ticket
router.post('/ticket/create', async function(req, res) {
    try {
        const { session_token, issue_type, sub_issue, description, priority, user_data } = req.body;

        const finalDescription =
            description ||
            `Issue raised by customer. Data: ${JSON.stringify(user_data)}`;

        const ticket_number = 'BZ' + Date.now().toString().slice(-6);

        const [sessions] = await db.query(
            'SELECT id FROM chat_sessions WHERE session_token = ?',
            [session_token]
        );

        if (sessions.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Chat session not found'
            });
        }

        const session_id = sessions[0].id;

        const [result] = await db.query(`
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
            priority || "medium"
        ]);

        await db.query(
            `UPDATE chat_sessions 
             SET status = 'escalated' 
             WHERE id = ?`,
            [session_id]
        );

        res.json({
            success: true,
            ticket_id: result.insertId,
            ticket_number
        });

    } catch (err) {
        console.error('Ticket creation error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to create support ticket'
        });
    }
});

// Get chat history for admin
// routes/chatAdmin.js
// routes/chatAdmin.js
// Update your /admin/sessions endpoint
router.get('/admin/sessions', async (req, res) => {
    try {
        console.log('📋 Fetching sessions for admin panel...');
        
        // Updated query to include email from users table
        const query = `
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
                COUNT(cm.id) as message_count,
                (SELECT ticket_number FROM support_tickets 
                 WHERE session_id = cs.id 
                 ORDER BY created_at DESC LIMIT 1) as latest_ticket,
                u.email as user_email  -- Join with users table to get email
            FROM chat_sessions cs
            LEFT JOIN chat_messages cm ON cs.id = cm.session_id
            LEFT JOIN users u ON cs.user_id = u.id  -- Join with users table
            GROUP BY cs.id
            ORDER BY last_activity DESC
        `;

        const [sessions] = await db.query(query);
        
        console.log(`✅ Found ${sessions.length} sessions`);
        
        // Log session data for debugging
        sessions.forEach(session => {
            console.log(`Session ${session.id}:`, {
                status: mapSessionStatus(session.status),  
                phone: session.phone,
                customer_name: session.customer_name,
                is_existing_customer: session.is_existing_customer,
                user_email: session.user_email,
                message_count: session.message_count
            });
        });

        res.json({
            success: true,
            sessions: sessions.map(session => ({
                ...session,
                // Ensure proper data types
                is_existing_customer: Boolean(session.is_existing_customer),
                phone: session.phone || null,
                customer_name: session.customer_name || null,
                email: session.user_email || null, // Use email from users table
                // Format dates properly
                last_activity: session.last_activity || session.created_at
            }))
        });
    } catch (error) {
        console.error('❌ Admin sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sessions',
            error: error.message
        });
    }
});
// Get session details with messages
// routes/chatAdmin.js
// Update your session details endpoint
router.get('/admin/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        console.log(`📖 Fetching details for session ${sessionId}`);

        // Get session basic info with user email
        const [sessions] = await db.query(`
            SELECT cs.*, u.email as user_email 
            FROM chat_sessions cs
            LEFT JOIN users u ON cs.user_id = u.id
            WHERE cs.id = ?
        `, [sessionId]);

        if (sessions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        const session = sessions[0];

        // Get messages
        const [messages] = await db.query(`
            SELECT * FROM chat_messages 
            WHERE session_id = ? 
            ORDER BY created_at ASC
        `, [sessionId]);

        // Get tickets
        const [tickets] = await db.query(`
            SELECT * FROM support_tickets 
            WHERE session_id = ? 
            ORDER BY created_at DESC
        `, [sessionId]);

        console.log(`✅ Session ${sessionId} details:`, {
            phone: session.phone,
            customer_name: session.customer_name,
            email: session.user_email,
            is_existing_customer: session.is_existing_customer,
            message_count: messages.length,
            ticket_count: tickets.length
        });

        res.json({
            success: true,
            session: {
                ...session,
                email: session.user_email, // Include email in response
                is_existing_customer: Boolean(session.is_existing_customer)
            },
            messages: messages.map(msg => ({
                ...msg,
                message_data: typeof msg.message_data === 'string' 
                    ? JSON.parse(msg.message_data || '{}')
                    : msg.message_data
            })),
            tickets
        });
    } catch (error) {
        console.error('❌ Session details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch session details'
        });
    }
});

router.get("/admin/tickets", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        st.id,
        st.ticket_number,
        st.issue_type,
        st.sub_issue,
        st.description,
        st.status,
        st.priority,
        st.assigned_to,
        st.created_at,
        st.updated_at,
        cs.id AS session_id,
        cs.phone,
        cs.customer_name,
        cs.email
      FROM support_tickets st
      LEFT JOIN chat_sessions cs ON st.session_id = cs.id
      ORDER BY st.created_at DESC
      `
    );

    res.json({
      success: true,
      tickets: rows,
    });
  } catch (err) {
    console.error("❌ Admin tickets error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
    });
  }
});
router.put('/admin/ticket/:ticketId', async function(req, res) {
  try {
    const ticketId = req.params.ticketId;

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (req.body.status !== undefined) {
      updates.push("status = ?");
      values.push(req.body.status);
    }

    if (req.body.priority !== undefined) {
      updates.push("priority = ?");
      values.push(req.body.priority);
    }

    if (req.body.assigned_to !== undefined) {
      updates.push("assigned_to = ?");
      values.push(req.body.assigned_to);
    }

    if (updates.length === 0) {
      return res.json({ success: false, message: "No fields to update" });
    }

    const query = `
      UPDATE support_tickets 
      SET ${updates.join(", ")} 
      WHERE id = ?
    `;

    values.push(ticketId);

    await db.query(query, values);

    res.json({ success: true, message: "Ticket updated successfully" });
  } catch (err) {
    console.error("Ticket update error:", err);
    res.status(500).json({ success: false, message: "Failed to update ticket" });
  }
});

router.post('/validate-phone', async (req, res) => {
  try {
    const { user_input } = req.body;

    const cleanPhone = (user_input || "").replace(/\D/g, "");

    // invalid format
    if (cleanPhone.length !== 10) {
      return res.json({
        success: false,
        user_data: {
          phone_valid: false,
          error_message: "Please enter a valid 10-digit mobile number."
        }
      });
    }

    const [users] = await db.query(
      "SELECT id, username, phone FROM users WHERE phone = ?",
      [cleanPhone]
    );

    if (users.length > 0) {
      return res.json({
        success: true,
        user_data: {
          phone_valid: true,
          customer_name: users[0].username,
          phone: cleanPhone
        }
      });
    }

    return res.json({
      success: false,
      user_data: {
        phone_valid: false,
        error_message: "This number is not registered. Please try again."
      }
    });

  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      user_data: {
        phone_valid: false,
        error_message: "Server Error. Try again later."
      }
    });
  }
});

router.post('/validate-email', async (req, res) => {
  try {
    const { user_input } = req.body;

    const email = (user_input || "").trim().toLowerCase();

    // email pattern check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.json({
        success: false,
        user_data: {
          email_valid: false,
          error_message: "Please enter a valid email address."
        }
      });
    }

    // check email in DB
    const [users] = await db.query(
      "SELECT id, username, email FROM users WHERE email = ?",
      [email]
    );

    if (users.length > 0) {
      return res.json({
        success: true,
        user_data: {
          email_valid: true,
          customer_name: users[0].username,
          email
        }
      });
    }

    return res.json({
      success: false,
      user_data: {
        email_valid: false,
        error_message: "This email is not registered. Please try again."
      }
    });

  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      user_data: {
        email_valid: false,
        error_message: "Server Error. Try again later."
      }
    });
  }
});


module.exports = router;