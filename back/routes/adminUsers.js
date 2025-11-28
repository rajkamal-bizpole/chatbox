const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const router = express.Router();

/* ================================
   GET ALL USERS
================================ */
router.get('/', async function(req, res) {
    try {
        const query = `
            SELECT id, username, email, phone, role, created_at 
            FROM users
        `;

        const [results] = await db.query(query);

        res.json({
            success: true,
            users: results
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Database error'
        });
    }
});

/* ================================
   GET ONE USER BY ID
================================ */
router.get('/:id', async function(req, res) {
    try {
        const query = `
            SELECT id, username, email, phone, role, created_at 
            FROM users 
            WHERE id = ?
        `;

        const [results] = await db.query(query, [req.params.id]);

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            user: results[0]
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Database error' 
        });
    }
});

/* ================================
   ADD USER
================================ */
router.post('/', async function(req, res) {
    try {
        const { username, email, phone, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email & password are required'
            });
        }

        const hashedPw = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users (username, email, phone, password, role)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            username, 
            email, 
            phone || null, 
            hashedPw, 
            role || "user"
        ]);

        res.json({
            success: true,
            message: 'User added successfully',
            userId: result.insertId
        });
    } catch (err) {
        console.error('Error creating user:', err);
        
        // Handle duplicate entry errors
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Error creating user'
        });
    }
});

/* ================================
   UPDATE USER
================================ */
router.put('/:id', async function(req, res) {
    try {
        const { username, email, phone, role, password } = req.body;
        const userId = req.params.id;

        let fields = [];
        let values = [];

        if (username) { fields.push('username = ?'); values.push(username); }
        if (email) { fields.push('email = ?'); values.push(email); }
        if (phone !== undefined) { 
            fields.push('phone = ?'); 
            values.push(phone || null); 
        }
        if (role) { fields.push('role = ?'); values.push(role); }

        // Handle password update
        if (password) {
            const hashedPw = await bcrypt.hash(password, 10);
            fields.push('password = ?');
            values.push(hashedPw);
        }

        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Nothing to update"
            });
        }

        const query = `
            UPDATE users 
            SET ${fields.join(', ')}
            WHERE id = ?
        `;
        values.push(userId);

        const [result] = await db.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully'
        });
    } catch (err) {
        console.error('Update error:', err);
        
        // Handle duplicate entry errors
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists'
            });
        }
        
        return res.status(500).json({ 
            success: false, 
            message: 'Update failed' 
        });
    }
});

/* ================================
   DELETE USER
================================ */
router.delete('/:id', async function(req, res) {
    try {
        const query = 'DELETE FROM users WHERE id = ?';
        const [result] = await db.query(query, [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (err) {
        console.error('Delete error:', err);
        return res.status(500).json({
            success: false,
            message: 'Delete error'
        });
    }
});

module.exports = router;