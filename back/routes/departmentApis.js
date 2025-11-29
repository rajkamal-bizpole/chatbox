const express = require("express");
const router = express.Router();
const db = require("../config/database"); // your MySQL connection

async function saveDepartmentRequest(data) {
  const sql = `
    INSERT INTO department_requests 
    (session_id, department, status, message, chat_logs)
    VALUES (?, ?, ?, ?, ?)
  `;

  await db.query(sql, [
    data.session_id,
    data.department,
    data.status,
    data.message,
    JSON.stringify(data.chat_logs || [])
  ]);
}

/* ------------------------------
   BILLING DEPARTMENT
--------------------------------*/
router.post("/billing", async (req, res) => {
  console.log("Billing Dept received:", req.body);

  const response = {
    success: true,
    department: "Billing Department",
    received: true,
    status: "pending_review",
    message: "Billing team has received your issue."
  };

  await saveDepartmentRequest({
    session_id: req.body.session_id,
    department: response.department,
    status: response.status,
    message: response.message,
    chat_logs: req.body.chat_logs
  });

  return res.json(response);
});

/* ------------------------------
   TECHNICAL SUPPORT
--------------------------------*/
router.post("/technical", async (req, res) => {
  console.log("Tech Dept received:", req.body);

  const response = {
    success: true,
    department: "Technical Support",
    received: true,
    status: "investigating",
    message: "Tech team is checking the issue."
  };

  await saveDepartmentRequest({
    session_id: req.body.session_id,
    department: response.department,
    status: response.status,
    message: response.message,
    chat_logs: req.body.chat_logs
  });

  return res.json(response);
});

/* ------------------------------
   ACCOUNTS
--------------------------------*/
router.post("/accounts", async (req, res) => {
  console.log("Accounts Dept received:", req.body);

  const response = {
    success: true,
    department: "Accounts",
    received: true,
    status: "processing",
    message: "Accounts team is reviewing your case."
  };

  await saveDepartmentRequest({
    session_id: req.body.session_id,
    department: response.department,
    status: response.status,
    message: response.message,
    chat_logs: req.body.chat_logs
  });

  return res.json(response);
});

/* ------------------------------
   COMPLIANCE
--------------------------------*/
router.post("/compliance", async (req, res) => {
  console.log("Compliance Dept received:", req.body);

  const response = {
    success: true,
    department: "Compliance Team",
    received: true,
    status: "under_review",
    message: "Compliance team has taken this issue."
  };

  await saveDepartmentRequest({
    session_id: req.body.session_id,
    department: response.department,
    status: response.status,
    message: response.message,
    chat_logs: req.body.chat_logs
  });

  return res.json(response);
});

module.exports = router;
