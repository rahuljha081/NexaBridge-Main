const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/authController');

// Signup ka rasta
router.post('/signup', registerUser);

module.exports = router;