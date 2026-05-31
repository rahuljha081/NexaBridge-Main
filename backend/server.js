const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// GLOBAL CONFIGURATION: Client ID matching your components layers
const SYSTEM_GOOGLE_CLIENT_ID = "1052609516904-0e9fdpcl4dhnh6ino60sltivjg5mlp84.apps.googleusercontent.com";
const client = new OAuth2Client(SYSTEM_GOOGLE_CLIENT_ID);

// MySQL Database Connection Setup
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'rahuljhads556@###', 
    database: 'nexabridge_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Use promise-based pool interface to completely eliminate callback/promise conversion mismatches
const db = pool.promise();

console.log('✅ MySQL Promise Pool Initialized successfully (nexabridge_db).');

// Global process exception handlers to secure standalone continuous thread executions
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Unhandled Rejection caught to prevent server crash:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('⚠️ Uncaught Exception caught to prevent server crash:', err.message);
});

// ==================== 1. GOOGLE IDENTITY AUTH ENGINE ====================

app.post('/api/auth/google-login', async (req, res) => {
    const { token, role } = req.body;

    if (!token) {
        return res.status(400).json({ success: false, message: "Missing Google Token Stream Payload" });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: SYSTEM_GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const verifiedEmail = payload.email.toLowerCase().trim();
        const verifiedName = payload.name;

        console.log(`\n🔒 Google Verification: Auth request for ${verifiedEmail} [Target Role: ${role}]`);

        const checkUserSql = "SELECT id, username as name, email, role FROM users WHERE email = ? AND role = ?";
        const [results] = await db.query(checkUserSql, [verifiedEmail, role]);

        if (results.length > 0) {
            console.log(`✅ Session approved: ${verifiedEmail} as [${results[0].role}]`);
            return res.json({ 
                success: true, 
                backendToken: "google-verified-jwt-node-token", 
                user: results[0] 
            });
        } else {
            console.log(`📝 Sync Engine: Registering new dynamic node -> ${verifiedEmail} as [${role}]`);
            const insertUserSql = "INSERT INTO users (username, email, password, role) VALUES (?, ?, 'OAUTH_PROTECTED_HASH', ?)";
            const [insertResult] = await db.query(insertUserSql, [verifiedName, verifiedEmail, role]);

            return res.json({
                success: true,
                backendToken: "google-verified-jwt-node-token",
                user: { id: insertResult.insertId, name: verifiedName, email: verifiedEmail, role: role }
            });
        }
    } catch (error) {
        console.error("❌ CRITICAL: Google Client validation handshake rejected:", error.message);
        if (!res.headersSent) {
            return res.status(401).json({ success: false, message: "Google Guard Security Validation Refused" });
        }
    }
});


// ==================== 2. MANUAL USER AUTH ENGINES ====================

app.post('/api/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    const sql = "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";
    try {
        await db.query(sql, [name, email, password, role]);
        return res.json({ success: true, message: "User registered successfully!" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Email already exists or Database error" });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password, role } = req.body;
    const sql = "SELECT id, username as name, email, role FROM users WHERE email = ? AND password = ? AND role = ?";
    try {
        const [results] = await db.query(sql, [email.trim(), password, role]);
        if (results.length > 0) {
            return res.json({ success: true, user: results[0], token: "mock-jwt-token-node" });
        } else {
            return res.status(401).json({ success: false, error: "Invalid Email, Password, or Role Mismatch" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});


// ==================== 3. DIRECTORY ENGINE (LATEST CHAT TOP SORTING) ====================

app.get('/api/mentors', async (req, res) => {
    const { fetchStudents, email } = req.query;
    const cleanEmail = (email && email !== 'null' && email !== 'undefined' && email.trim() !== '') ? email.toLowerCase().trim() : null;

    try {
        if (fetchStudents === 'true' && !cleanEmail) {
            const [results] = await db.query("SELECT username as name, email, role FROM users WHERE role = 'student'");
            return res.json(results);
        }

        if (fetchStudents !== 'true' && !cleanEmail) {
            const [results] = await db.query("SELECT username as name, email, role FROM users WHERE role = 'alumni'");
            return res.json(results);
        }
        
        if (cleanEmail) {
            if (fetchStudents === 'true') {
                const sql = `
                    SELECT DISTINCT u.username as name, u.email, u.role,
                    EXISTS (
                        SELECT 1 FROM chats c 
                        WHERE c.chat_key LIKE CONCAT('%', ?, '%') 
                        AND LOWER(c.sender_email) = LOWER(u.email) 
                        AND c.is_read = 0
                    ) as hasUnread,
                    COALESCE((
                        SELECT MAX(id) FROM chats 
                        WHERE chat_key LIKE CONCAT('%', ?, '%') 
                        AND (LOWER(sender_email) = LOWER(u.email) OR chat_key LIKE CONCAT('%', LOWER(u.email), '%'))
                    ), 0) as latestMsgId
                    FROM users u 
                    WHERE u.role = 'student' 
                    AND u.email IN (
                        SELECT DISTINCT sender_email FROM chats WHERE chat_key LIKE CONCAT('%', ?, '%')
                        UNION
                        SELECT DISTINCT REPLACE(REPLACE(chat_key, ?, ''), '_', '') FROM chats WHERE chat_key LIKE CONCAT('%', ?, '%')
                    )
                    ORDER BY latestMsgId DESC
                `;
                const [results] = await db.query(sql, [cleanEmail, cleanEmail, cleanEmail, cleanEmail, cleanEmail]);
                return res.json(results);
            } else {
                const sql = `
                    SELECT DISTINCT u.username as name, u.email, u.role,
                    EXISTS (
                        SELECT 1 FROM chats c 
                        WHERE c.chat_key LIKE CONCAT('%', ?, '%') 
                        AND LOWER(c.sender_email) = LOWER(u.email) 
                        AND c.is_read = 0
                    ) as hasUnread,
                    COALESCE((
                        SELECT MAX(id) FROM chats 
                        WHERE chat_key LIKE CONCAT('%', ?, '%') 
                        AND (LOWER(sender_email) = LOWER(u.email) OR chat_key LIKE CONCAT('%', LOWER(u.email), '%'))
                    ), 0) as latestMsgId
                    FROM users u 
                    WHERE u.role = 'alumni' 
                    AND u.email IN (
                        SELECT DISTINCT sender_email FROM chats WHERE chat_key LIKE CONCAT('%', ?, '%')
                        UNION
                        SELECT DISTINCT REPLACE(REPLACE(chat_key, ?, ''), '_', '') FROM chats WHERE chat_key LIKE CONCAT('%', ?, '%')
                    )
                    ORDER BY latestMsgId DESC
                `;
                const [results] = await db.query(sql, [cleanEmail, cleanEmail, cleanEmail, cleanEmail, cleanEmail]);
                return res.json(results.filter(m => m.email.toLowerCase().trim() !== cleanEmail));
            }
        }
        return res.json([]);
    } catch (err) {
        console.error("❌ Directory indexing pipeline crash caught:", err);
        return res.status(500).json({ error: err.message });
    }
});


// ==================== 4. JOB BOARD ENGINES ====================

app.post('/api/jobs', async (req, res) => {
    const { title, company, location, description, experience, posted_by, deadline } = req.body;
    const finalDeadline = deadline ? deadline : null;
    const sql = "INSERT INTO jobs (title, company, location, description, experience, posted_by, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)";
    try {
        await db.query(sql, [title, company, location, description, experience, posted_by, finalDeadline]);
        return res.json({ success: true, message: "Job opportunity posted successfully!" });
    } catch (err) {
        console.error("MySQL Job Insertion Error:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/jobs', async (req, res) => {
    const sql = "SELECT id, title, company, location, description, experience, posted_by, deadline FROM jobs WHERE deadline > NOW() OR deadline IS NULL ORDER BY id DESC";
    try {
        const [results] = await db.query(sql);
        return res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});


// ==================== 5. REFERRAL TRACKER (AUTO-MESSAGE MAPPING FIX) ====================

app.get('/api/referrals', async (req, res) => {
    const { email, role } = req.query;
    if (!email || !role) return res.status(400).json({ error: "Missing identity credentials" });
    const cleanEmail = email.toLowerCase().trim();

    try {
        if (role === 'student') {
            const sql = `SELECT id, student_name, student_email, job_id, company, resume_url, status FROM referral_requests WHERE LOWER(student_email) = ?`;
            const [results] = await db.query(sql, [cleanEmail]);
            return res.json(results);
        } 
        if (role === 'alumni') {
            const sql = `SELECT r.id, r.student_name, r.student_email, r.job_id, r.company, r.resume_url, r.status FROM referral_requests r INNER JOIN jobs j ON r.job_id = j.id WHERE LOWER(j.posted_by) = ? OR j.posted_by = (SELECT username FROM users WHERE LOWER(email) = ? LIMIT 1) ORDER BY r.id DESC`;
            const [results] = await db.query(sql, [cleanEmail, cleanEmail]);
            return res.json(results);
        }
        const [results] = await db.query("SELECT id, student_name, student_email, job_id, company, resume_url, status FROM referral_requests ORDER BY id DESC");
        return res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/api/referrals', async (req, res) => {
    const { student_name, student_email, job_id, company, resume_url } = req.body;
    const sql = "INSERT INTO referral_requests (student_name, student_email, job_id, company, resume_url) VALUES (?, ?, ?, ?, ?)";
    try {
        await db.query(sql, [student_name, student_email, job_id, company, resume_url]);
        return res.json({ success: true, message: "Referral application logged!" });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.put('/api/referrals/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const updateSql = "UPDATE referral_requests SET status = ? WHERE id = ?";
        await db.query(updateSql, [status, id]);

        if (status === 'Approved & Referred') {
            const selectReqSql = "SELECT student_name, student_email, company, job_id FROM referral_requests WHERE id = ?";
            const [reqResults] = await db.query(selectReqSql, [id]);

            if (reqResults.length > 0) {
                const referral = reqResults[0];
                
                const selectJobSql = "SELECT title, posted_by FROM jobs WHERE id = ?";
                const [jobResults] = await db.query(selectJobSql, [referral.job_id]);

                if (jobResults.length > 0) {
                    const job = jobResults[0];
                    const cleanPostedBy = job.posted_by.toLowerCase().trim();
                    
                    const selectAlumniSql = "SELECT username, email FROM users WHERE LOWER(TRIM(username)) = ? OR LOWER(TRIM(email)) = ? LIMIT 1";
                    const [alumniResults] = await db.query(selectAlumniSql, [cleanPostedBy, cleanPostedBy]);

                    if (alumniResults.length > 0) {
                        const alumniEmail = alumniResults[0].email.toLowerCase().trim();
                        const alumniName = alumniResults[0].username;
                        const studentEmail = referral.student_email.toLowerCase().trim();

                        const chatKey = [studentEmail, alumniEmail].sort().join('_');
                        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        // UPDATED SENDER TEXT BLOCK: Perfect Alignment mapping text string
                        const finalCustomMessage = `Hello ${referral.student_name}, your referral request for "${job.title}" at ${referral.company} has been approved and successfully referred to the dashboard network! For the first round, all details will be shared in this chat itself. If you have any queries, feel free to ask me here.`;

                        // FIXED IDENTITY DESIGNATION: Directly passing alumni identity tokens safely to enforce alignment rules
                        const insertChatSql = "INSERT INTO chats (chat_key, sender_email, sender_name, sender_role, message_text, timestamp, is_read) VALUES (?, ?, ?, 'alumni', ?, ?, 0)";
                        await db.query(insertChatSql, [chatKey, alumniEmail, alumniName, finalCustomMessage, currentTime]);
                        
                        console.log(`🤖 Automated System Notification deployed securely from Alumni [${alumniEmail}] to Student [${studentEmail}]`);
                    }
                }
            }
        }

        return res.json({ success: true, message: "Status updated successfully!" });
    } catch (err) {
        console.error("❌ Status update failed:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});


// ==================== 6. REAL MESSAGING ENGINE ====================

app.post('/api/messages', async (req, res) => {
    const { chat_key, sender_email, sender_name, sender_role, message_text, timestamp } = req.body;
    const sql = "INSERT INTO chats (chat_key, sender_email, sender_name, sender_role, message_text, timestamp, is_read) VALUES (?, ?, ?, ?, ?, ?, 0)";
    try {
        await db.query(sql, [chat_key, sender_email, sender_name, sender_role, message_text, timestamp]);
        return res.json({ success: true, message: "Message logged safely!" });
    } catch (err) {
        console.error("Chat Insertion Error:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/messages/:chat_key', async (req, res) => {
    const { chat_key } = req.params;
    const sql = "SELECT sender_email as senderEmail, sender_name as senderName, sender_role as senderRole, message_text as text, timestamp as time, is_read FROM chats WHERE chat_key = ? ORDER BY id ASC";
    try {
        const [results] = await db.query(sql, [chat_key]);
        return res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.put('/api/messages/mark-read', async (req, res) => {
    const { chat_key, opponent_email } = req.body;
    if (!chat_key || !opponent_email) return res.status(400).json({ error: "Missing configuration variables" });
    
    const targetEmail = opponent_email.toLowerCase().trim();
    const sql = "UPDATE chats SET is_read = 1 WHERE chat_key = ? AND LOWER(sender_email) = ?";
    try {
        await db.query(sql, [chat_key, targetEmail]);
        return res.json({ success: true, message: "Chat channel state marked as read" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});


// ==================== 7. ADMIN ANALYTICS TELEMETRY ====================

app.get('/api/admin/stats', async (req, res) => {
    const sqlStudents = "SELECT COUNT(*) as total FROM users WHERE role = 'student'";
    const sqlAlumni = "SELECT COUNT(*) as total FROM users WHERE role = 'alumni'";
    const sqlJobs = "SELECT COUNT(*) as total FROM jobs";
    
    try {
        const [sRes] = await db.query(sqlStudents);
        const [aRes] = await db.query(sqlAlumni);
        const [jRes] = await db.query(sqlJobs);
        
        const studentCount = sRes[0]?.total || 0;
        const alumniCount = aRes[0]?.total || 0;
        const jobCount = jRes[0]?.total || 0;

        return res.json({
            students: studentCount,
            alumni: alumniCount,
            jobs: studentCount + alumniCount + jobCount
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 NexaBridge Production Server API active on Port: ${PORT}\n`);
});