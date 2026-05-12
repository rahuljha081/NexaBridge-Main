const express = require('express');
const db = require('./config/db');
const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
    res.send('NexaBridge Backend is LIVE! 🚀 - Rahul Jha');
});

app.listen(PORT, () => {
    console.log(`Server chalu ho gaya: http://localhost:${PORT}`);
});
