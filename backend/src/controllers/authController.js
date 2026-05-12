const User = require('../models/userModel');

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check karna ki user pehle se toh nahi hai
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email pehle se register hai!" });
        }

        // Database mein save karna
        await User.create(username, email, password);
        res.status(201).json({ message: "User successfully register ho gaya! 🎉" });

    } catch (error) {
        res.status(500).json({ message: "Server mein kuch gadbad hai", error: error.message });
    }
};

module.exports = { registerUser };