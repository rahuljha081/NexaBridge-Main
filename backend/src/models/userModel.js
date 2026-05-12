const db = require('../config/db');

const User = {
    // Naya user register karne ka function
    create: async (username, email, password) => {
        const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        const [result] = await db.execute(sql, [username, email, password]);
        return result;
    },

    // Email se user dhundne ka function (Login ke liye kaam aayega)
    findByEmail: async (email) => {
        const sql = "SELECT * FROM users WHERE email = ?";
        const [rows] = await db.execute(sql, [email]);
        return rows[0];
    }
};

module.exports = User;