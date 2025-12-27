const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// Middlewares
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", require("./modules/auth/auth.routes"));
app.use("/api/admin/users", require("./modules/adminUsers/adminUsers.routes"));
app.use("/api/chat", require("./modules/chatflow/chatFlow.routes"));
app.use("/api/chat", require("./modules/chat/chat.routes")); // if exists
app.use("/api/department", require("./modules/departmentApi/departmentApi.routes"));
app.use("/api/admin/departments", require("./modules/adminDepartment/adminDepartment.routes"));
app.use("/api/admin/analytics", require("./modules/chatAnalytics/chatAnalytics.routes"));

app.get("/", (req, res) => {
  res.json({ message: "Chat App API is running 🚀" });
});

module.exports = app;
