const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/ngoApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(()=> console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Registration
app.post('/register', async (req, res) => {
  const { fullName, email, username, password, confirmPassword } = req.body;
  if(password !== confirmPassword) return res.status(400).json({message: "Passwords do not match"});

  const passwordRegex = /^(?=.*[0-9]).{6,}$/; // min 6 chars, at least 1 number
  if(!passwordRegex.test(password)) return res.status(400).json({message: "Password must be at least 6 characters and include a number"});

  try {
    const existingUser = await User.findOne({ $or: [{email}, {username}] });
    if(existingUser) return res.status(400).json({message: "Username or email already exists"});

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      full_name: fullName,
      email,
      username,
      password: hashedPassword
    });
    await newUser.save();
    res.json({message: "Registration successful"});
  } catch(err) {
    res.status(500).json({message: "Server error"});
  }
});

// Login
app.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  try {
    const user = await User.findOne({ $or: [{username: usernameOrEmail}, {email: usernameOrEmail}] });
    if(!user) return res.status(400).json({message: "User not found"});

    const match = await bcrypt.compare(password, user.password);
    if(!match) return res.status(400).json({message: "Invalid credentials"});

    res.json({message: "Login successful"});
  } catch(err) {
    res.status(500).json({message: "Server error"});
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
