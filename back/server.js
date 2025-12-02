const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration for cookies
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser()); // Add cookie parser middleware

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chat_app'
});

db.connect(function(err) {
    if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
    }
    console.log('Connected to database as id ' + db.threadId);
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin/users', require('./routes/adminUsers'));
app.use('/api/chat', require('./routes/chatFlow'));
// Add this to your server.js after auth routes
app.use('/api/chat', require('./routes/chat'));
app.use("/api/department", require("./routes/departmentApis"));
app.use("/api/admin/departments", require("./routes/adminDepartmentRoutes"));
app.use ("/admin/analytics", require("./routes/chatAnalytics"))


app.get('/', function(req, res) {
    res.json({ message: 'Chat App API is running!' });
});

app.listen(PORT, function() {
    console.log(`Server is running on port ${PORT}`);
});