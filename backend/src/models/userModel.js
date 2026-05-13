const db = require('../config/db');

const User = {
    // 1. Naya user register karne ka function
    create: async (userData) => {
        try {
            const { username, email, password } = userData;
            
            // Debugging ke liye: Terminal mein dikhayega ki DB mein kya ja raha hai
            console.log("DB Executing with:", username, email, password);

            const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            
            // db.execute hamesha array return karta hai
            const [result] = await db.execute(query, [username, email, password]);
            return result;
        } catch (error) {
            throw error; // Ye error seedha Controller ke catch block mein jayega
        }
    },

    // 2. Email se user dhundne ka function
    findByEmail: async (email) => {
        try {
            const sql = "SELECT * FROM users WHERE email = ?";
            const [rows] = await db.execute(sql, [email]);
            return rows[0]; // Pehla user return karega agar mila toh
        } catch (error) {
            throw error;
        }
    }
};

module.exports = User;