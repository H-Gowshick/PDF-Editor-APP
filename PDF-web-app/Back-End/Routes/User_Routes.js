const express = require("express");
const router = express.Router();
const User = require("../Models/User_Model");
const jwt = require("jsonwebtoken");
const verifyToken = require("../Middleware/verifyToken");
require("dotenv").config();

// Generate token function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.SECURITY_KEY || "fallback_value", {
    expiresIn: 60 * 60, //expiry time 1 hour 
  });
};

// Signup route
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const newUser = new User({ email, password });
    const user = await newUser.save(); // Save new user to the database
    res.status(200).json({ message: "User signed up successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save user" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    // Check if user exists and password matches
    if (!user || password !== user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = generateToken(user._id); // Generate JWT token for the user
    res.cookie("token", token); 
    res.status(200).json({ token, userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify token route
router.get("/verifyToken", verifyToken, (req, res) => {
  res.json("Success"); 
});

// Fetch user email by user ID
router.get("/email/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // If user found, send the email back in the response
    res.status(200).json({ email: user.email });
  } catch (error) {
    console.error("Error fetching user email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
