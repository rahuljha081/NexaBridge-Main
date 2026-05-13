const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Signup ka rasta
router.post('/signup', registerUser);
// ... purane imports
router.post('/login', loginUser); // Login ke liye naya rasta

module.exports = router;