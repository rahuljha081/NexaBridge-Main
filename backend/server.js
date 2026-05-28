const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection Setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rahuljhads556@###', 
    database: 'nexabridge_db'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL Database (nexabridge_db) successfully.');
});

// ==================== 1. USER AUTH ENGINES ====================

app.post('/api/register', (req, res) => {
    const { name, email, password, role } = req.body;
    const sql = "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, password, role], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "Email already exists or Database error" });
        }
        res.json({ success: true, message: "User registered successfully!" });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password, role } = req.body;
    const sql = "SELECT id, username as name, email, role FROM users WHERE email = ? AND password = ? AND role = ?";
    
    db.query(sql, [email.trim(), password, role], (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        
        if (results.length > 0) {
            res.json({ success: true, user: results[0], token: "mock-jwt-token-node" });
        } else {
            res.status(401).json({ success: false, error: "Invalid Email, Password, or Role Mismatch" });
        }
    });
});

// PERFECT DYNAMIC SIDEBAR FILTERS: Strips uncommunicated rows from BOTH Student and Alumni sidebars
app.get('/api/mentors', (req, res) => {
    const { fetchStudents, email } = req.query;
    
    if (email) {
        const currentEmail = email.toLowerCase().trim();
        
        if (fetchStudents === 'true') {
            // ALUMNI VIEW: Load only students who have a record in the chats table with this alumni
            const sql = `
                SELECT DISTINCT u.username as name, u.email, u.role 
                FROM users u
                WHERE u.role = 'student'
                AND u.email IN (
                    SELECT sender_email FROM chats WHERE chat_key LIKE CONCAT('%', ?, '%')
                )
            `;
            db.query(sql, [currentEmail], (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(results);
            });
        } else {
            // STUDENT VIEW (Inside My Chats tab): Load only alumni who have shared chats with this student
            const sql = `
                SELECT DISTINCT u.username as name, u.email, u.role 
                FROM users u
                WHERE u.role = 'alumni'
                AND u.email IN (
                    SELECT DISTINCT 
                        CASE 
                            WHEN LOWER(sender_email) = ? THEN REPLACE(REPLACE(chat_key, ?, ''), '_', '')
                            ELSE sender_email 
                        END
                    FROM chats 
                    WHERE chat_key LIKE CONCAT('%', ?, '%')
                )
            `;
            db.query(sql, [currentEmail, currentEmail, currentEmail], (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(results);
            });
        }
    } else {
        // GENERAL FALLBACK/FIND MENTORS VIEW: Student browsing panel to fetch all verified alumni to trigger new conversation threads
        const sql = "SELECT username as name, email, role FROM users WHERE role = 'alumni'";
        db.query(sql, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
    }
});


// ==================== 2. JOB BOARD ENGINES ====================

app.post('/api/jobs', (req, res) => {
    const { title, company, location, description, experience, posted_by } = req.body;
    const sql = "INSERT INTO jobs (title, company, location, description, experience, posted_by) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [title, company, location, description, experience, posted_by], (err, result) => {
        if (err) {
            console.error("MySQL Job Insertion Error:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: "Job opportunity posted successfully!" });
    });
});

app.get('/api/jobs', (req, res) => {
    const sql = "SELECT id, title, company, location, description, experience, posted_by FROM jobs ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// ==================== 3. REFERRAL REQUESTS TRACKER ====================

app.post('/api/referrals', (req, res) => {
    const { student_name, student_email, job_id, company, resume_url } = req.body;
    const sql = "INSERT INTO referral_requests (student_name, student_email, job_id, company, resume_url) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [student_name, student_email, job_id, company, resume_url], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, message: "Referral application logged!" });
    });
});

app.get('/api/referrals', (req, res) => {
    const { email, role } = req.query;
    let sql = "SELECT id, student_name, student_email, job_id, company, resume_url, status FROM referral_requests";
    let params = [];
    
    if (role === 'student') {
        sql += " WHERE student_email = ?";
        params.push(email);
    }
    
    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.put('/api/referrals/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const sql = "UPDATE referral_requests SET status = ? WHERE id = ?";
    db.query(sql, [status, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, message: "Status updated successfully!" });
    });
});


// ==================== 4. REAL MESSAGING ENGINE ====================

app.post('/api/messages', (req, res) => {
    const { chat_key, sender_email, sender_name, sender_role, message_text, timestamp } = req.body;
    const sql = "INSERT INTO chats (chat_key, sender_email, sender_name, sender_role, message_text, timestamp) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [chat_key, sender_email, sender_name, sender_role, message_text, timestamp], (err, result) => {
        if (err) {
            console.error("Chat Insertion Error:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: "Message logged safely!" });
    });
});

app.get('/api/messages/:chat_key', (req, res) => {
    const { chat_key } = req.params;
    const sql = "SELECT sender_email as senderEmail, sender_name as senderName, sender_role as senderRole, message_text as text, timestamp as time FROM chats WHERE chat_key = ? ORDER BY id ASC";
    db.query(sql, [chat_key], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// ==================== 5. ADMIN ANALYTICS TELEMETRY ====================
app.get('/api/admin/stats', (req, res) => {
    const sqlUsers = "SELECT COUNT(*) as total FROM users";
    const sqlJobs = "SELECT COUNT(*) as total FROM jobs";
    const sqlRequests = "SELECT COUNT(*) as total FROM referral_requests";
    
    db.query(sqlUsers, (err, uRes) => {
        db.query(sqlJobs, (err, jRes) => {
            db.query(sqlRequests, (err, rRes) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({
                    students: uRes[0].total || 0,
                    jobs: jRes[0].total || 0,
                    requests: rRes[0].total || 0
                });
            });
        });
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 NexaBridge Production Server API active on Port: ${PORT}\n`);
});