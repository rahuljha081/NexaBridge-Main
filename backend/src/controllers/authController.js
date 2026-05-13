const User = require('../models/userModel');
const bcrypt = require('bcryptjs'); 

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // 1. Pehle check karo user hai ya nahi
        // Note: Agar findByEmail kaam nahi kar raha, toh yahan User.findOne({ where: { email } }) try karna
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered!" });
        }

        // 2. PASSWORD HASHING
        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt); 

        // 3. Database mein save karna
        // IMPORTANT: Console log dala hai check karne ke liye
        console.log("Saving user to DB:", { username, email });

        await User.create({ 
            username, 
            email, 
            password: hashedPassword 
        });

        res.status(201).json({ message: "Registered successfully! 🎉" });

    } catch (error) {
        // Bhai ye line terminal mein error dikhayegi, isey miss mat karna
        console.error("ASLI ERROR YE HAI BHAU:", error); 
        res.status(500).json({ 
            message: "Something wrong with server", 
            error: error.message 
        });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: "User not found or email is wrong!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Password is incorrect!" });
        }

        res.status(200).json({ 
            message: "Login successful! Welcome back Rahul. 🚀",
            user: { id: user.id, username: user.username, email: user.email }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({ message: "Something wrong with server", error: error.message });
    }
};

module.exports = { registerUser, loginUser };
