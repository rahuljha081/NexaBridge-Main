const User = require('../models/userModel');
const bcrypt = require('bcryptjs'); // Naya library

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // 1. Check karna ki user pehle se toh nahi hai
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email pehle se register hai!" });
        }

        // 2. PASSWORD HASHING (Security)
        const salt = await bcrypt.genSalt(10); // Ek random string generate hogi
        const hashedPassword = await bcrypt.hash(password, salt); // Asli password ko hash kar diya

        // 3. Database mein Hash wala password save karna
        await User.create(username, email, hashedPassword);
        res.status(201).json({ message: "User successfully register ho gaya! 🎉" });

    } catch (error) {
        res.status(500).json({ message: "Server mein kuch gadbad hai", error: error.message });
    }
};
// Naya Login Logic
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check karna ki user hai ya nahi
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: "Email galat hai ya user nahi mila!" });
        }

        // 2. Password Match karna (Asli password vs Database wala Hash)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Password sahi nahi hai bhai!" });
        }

        // 3. Agar sab sahi raha
        res.status(200).json({ 
            message: "Login successful! Welcome back Rahul. 🚀",
            user: { id: user.id, username: user.username, email: user.email }
        });

    } catch (error) {
        res.status(500).json({ message: "Server mein kuch gadbad hai", error: error.message });
    }
};

// DON'T FORGET: Export mein loginUser ko add karo
module.exports = { registerUser, loginUser };
