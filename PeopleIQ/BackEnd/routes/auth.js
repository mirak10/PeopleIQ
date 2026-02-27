// routes/auth.js
import express from "express";
import User from "../models/User.js";
import EmployeeProfile from "../models/EmployeeProfile.js"; // ✅ missing import
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, role });

    // create default profile
    if (role === "Employee") {
      const EmployeeID = `EMP-${Date.now().toString().slice(-6)}`;
      await EmployeeProfile.create({
        user: user._id,
        EmployeeID,
        Name: name,
        Email: email,
        Gender: "Not specified",
        Age: null,
        MaritalStatus: "Not specified",
        Education: "Not specified",
        Department: "General",
        JobRole: "Employee",
        JobLevel: 1,
        Status: "Active",
      });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user),
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;