import express from "express";
import bcrypt from "bcrypt";
import User from "../../models/User";
import jwt from "jsonwebtoken";
import Log from "../../models/Log"; // ✅ Import Log model

const router = express.Router();

// 📌 Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("Request Body:", req.body); // Debugging Log

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const savedUser = await user.save();

    // ✅ Log Registration
    await Log.create({
      action: `Registered new user: ${email}`,
      user: savedUser._id,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(400).json({ message: "Error creating user", error });
  }
});

// 📌 Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const generateToken = (id: string) => {
      return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: "30d", // ✅ Correct way to set expiration time
      });
    };

    const token = generateToken(user._id);

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ Log Login
    await Log.create({
      action: `User logged in: ${email}`,
      user: user._id,
    });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

// 📌 Logout
router.post("/", (req, res) => {
  res.json({ message: "Logout successful" });
});

export default router;
