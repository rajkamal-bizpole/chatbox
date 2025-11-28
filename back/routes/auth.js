const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to set cookie
const setTokenCookie = function(res, token) {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
};

// Phone number validation function
const isValidPhone = function(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
};

// Signup endpoint
router.post('/signup', function(req, res) {
    const { username, email, phone, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username, email and password are required' 
        });
    }

    if (password.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: 'Password must be at least 6 characters long' 
        });
    }

    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please provide a valid phone number' 
        });
    }

    // Check if user already exists
    const checkUserQuery = 'SELECT * FROM users WHERE email = ? OR username = ?';
    
    db.query(checkUserQuery, [email, username], function(err, results) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Server error' 
            });
        }

        if (results.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'User already exists with this email or username' 
            });
        }

        // Hash password
        bcrypt.hash(password, 10, function(err, hashedPassword) {
            if (err) {
                console.error('Password hashing error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Server error' 
                });
            }

            // Insert new user
            const insertUserQuery = 'INSERT INTO users (username, email, phone, password) VALUES (?, ?, ?, ?)';
            
            db.query(insertUserQuery, [username, email, phone || null, hashedPassword], function(err, result) {
                if (err) {
                    console.error('Insert user error:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Server error' 
                    });
                }

                // Generate JWT token
                const token = jwt.sign(
                    { 
                        userId: result.insertId,
                        username: username,
                        email: email,
                        phone: phone
                    },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                // Set HTTP-only cookie
                setTokenCookie(res, token);

                res.status(201).json({
                    success: true,
                    message: 'User created successfully',
                    user: {
                        id: result.insertId,
                        username: username,
                        email: email,
                        phone: phone
                    }
                });
            });
        });
    });
});

// Login endpoint
router.post('/login', function(req, res) {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email and password are required' 
        });
    }

    // Find user by email
    const findUserQuery = 'SELECT * FROM users WHERE email = ?';
    
    db.query(findUserQuery, [email], function(err, results) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Server error' 
            });
        }

        if (results.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        const user = results[0];

        // Compare passwords
        bcrypt.compare(password, user.password, function(err, isMatch) {
            if (err) {
                console.error('Password comparison error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Server error' 
                });
            }

            if (!isMatch) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid email or password' 
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    userId: user.id,
                    username: user.username,
                    email: user.email,
                    phone: user.phone
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Set HTTP-only cookie
            setTokenCookie(res, token);

            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    phone: user.phone
                }
            });
        });
    });
});

// Verify token endpoint
router.get('/verify', function(req, res) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'No token provided' 
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({
            success: true,
            user: decoded
        });
    } catch (error) {
        // Clear invalid cookie
        res.clearCookie('token');
        res.status(401).json({ 
            success: false, 
            message: 'Invalid token' 
        });
    }
});

// Logout endpoint
router.post('/logout', function(req, res) {
    res.clearCookie('token');
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;