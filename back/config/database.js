// config/database.js
const mysql = require('mysql2/promise'); // Use promise version
require('dotenv').config();

// Create connection pool with promises
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chat_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
db.getConnection()
    .then(connection => {
        console.log('Connected to database as id ' + connection.threadId);
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to database: ' + err.stack);
    });

module.exports = db;