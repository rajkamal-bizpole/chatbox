const db = require("../../config/database");
const bcrypt = require("bcryptjs");

/* ================================
   GET ALL USERS
================================ */
exports.getAllUsers = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT id, username, email, phone, role, created_at 
      FROM users
    `);

    res.json({
      success: true,
      users: results,
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

/* ================================
   GET USER BY ID
================================ */
exports.getUserById = async (req, res) => {
  try {
    const [results] = await db.query(
      `
      SELECT id, username, email, phone, role, created_at 
      FROM users 
      WHERE id = ?
      `,
      [req.params.id]
    );

    if (!results.length) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: results[0],
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

/* ================================
   CREATE USER
================================ */
exports.createUser = async (req, res) => {
  try {
    const { username, email, phone, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email & password are required",
      });
    }

    const hashedPw = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `
      INSERT INTO users (username, email, phone, password, role)
      VALUES (?, ?, ?, ?, ?)
      `,
      [username, email, phone || null, hashedPw, role || "user"]
    );

    res.json({
      success: true,
      message: "User added successfully",
      userId: result.insertId,
    });
  } catch (err) {
    console.error("Error creating user:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating user",
    });
  }
};

/* ================================
   UPDATE USER
================================ */
exports.updateUser = async (req, res) => {
  try {
    const { username, email, phone, role, password } = req.body;
    const userId = req.params.id;

    let fields = [];
    let values = [];

    if (username) {
      fields.push("username = ?");
      values.push(username);
    }
    if (email) {
      fields.push("email = ?");
      values.push(email);
    }
    if (phone !== undefined) {
      fields.push("phone = ?");
      values.push(phone || null);
    }
    if (role) {
      fields.push("role = ?");
      values.push(role);
    }

    if (password) {
      const hashedPw = await bcrypt.hash(password, 10);
      fields.push("password = ?");
      values.push(hashedPw);
    }

    if (!fields.length) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update",
      });
    }

    const query = `
      UPDATE users 
      SET ${fields.join(", ")}
      WHERE id = ?
    `;

    values.push(userId);

    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (err) {
    console.error("Update error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};

/* ================================
   DELETE USER
================================ */
exports.deleteUser = async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM users WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({
      success: false,
      message: "Delete error",
    });
  }
};
