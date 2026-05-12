const mysql = require('mysql2');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'rahuljhads556@###', 
    database: 'nexabridge_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
// Connection check karne ke liye logic
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed: ' + err.message);
    } else {
        console.log('Connected to MySQL Database! 🗄️');
        connection.release();
    }
});

module.exports = pool.promise();