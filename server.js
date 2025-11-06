const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/ngoDB")
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.log("MongoDB connection error:", err));

// Test route
app.get("/", (req, res) => res.send("NGO Backend Running"));

// Register route
app.post("/api/register", async (req, res) => {
    try {
        const { fullName, email, username, password } = req.body;
        const user = new User({ fullName, email, username, password });
        await user.save();
        res.json({ message: "Registration successful" });
    } catch (err) {
        if(err.code === 11000) {
            res.status(400).json({ message: "Email or Username already exists" });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
});

// Login route
app.post("/api/login", async (req, res) => {
    const { usernameOrEmail, password } = req.body;
    try {
        const user = await User.findOne({
            $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
        });

        if(!user) return res.status(400).json({ message: "User not found" });
        if(password !== user.password) return res.status(400).json({ message: "Invalid password" });

        res.json({ message: "Login successful" });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
});

// View all users (optional)
app.get("/api/viewAll", async (req, res) => {
    const users = await User.find();
    res.json(users);
});

const PORT = 7000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
