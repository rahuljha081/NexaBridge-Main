const express = require('express');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 5000;

// 1. Middleware: this line used to understand json data 
app.use(express.json());

// 2. Routes: Jab bhi koi URL /api se shuru hoga, wo authRoutes mein jayega
app.use('/api', authRoutes);

// 3. Welcome Route
app.get('/', (req, res) => {
    res.send('NexaBridge Backend is LIVE! 🚀 - Rahul Jha');
});

// 4. Server Start
app.listen(PORT, () => {
    console.log(`Server chalu ho gaya: http://localhost:${PORT}`);
    // Database connection check pehle se hi db.js mein hai
});
