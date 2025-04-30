import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware";
import User from "../models/User";
import bcrypt from "bcrypt";

import Log from "../models/Log";

const router = express.Router();

// ✅ Fetch Admin Details
router.get("/profile", protect, async (req: any, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const admin = await User.findById(req.user.id).select("-password"); // Exclude password

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error: any) {
    // ✅ Fix: Cast `error` to `any`
    console.error("❌ Error fetching admin data:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Update Admin Profile
router.put("/profile", protect, async (req: any, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const updateFields = {
      name: req.body.name,
      mobileNumber: req.body.mobileNumber,
      address: req.body.address,
      country: req.body.country,
      state: req.body.state,
    };

    const updatedAdmin = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(updatedAdmin);
  } catch (error: any) {
    console.error("❌ Error updating admin profile:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 📌 Register a new user for Admin
router.post("/register", protect, adminOnly, async (req, res) => {
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

    res.status(201).json({
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(400).json({ message: "Error creating user", error });
  }
});

// 📌 Get all users (Admin Only)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// 📌 Update User for admin
router.put("/:id", protect, adminOnly, async (req, res) => {
  console.log("🛠 Update Request Received:", req.body); // Debugging Log

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Update only the fields provided in req.body
    Object.assign(user, req.body);
    await user.save();

    // ✅ Log Update
    if (req.user) {
      await Log.create({
        action: `Updated user: ${user.email}`,
        user: req.user.id, // Now TypeScript knows req.user exists
      });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
});

// 📌 Delete User
router.delete("/:id", protect, adminOnly, async (req, res) => {
  console.log("🛠 Received Delete Request for ID:", req.params.id);

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    // ✅ Log Deletion
    if (req.user) {
      await Log.create({
        action: `Deleted user: ${user.email}`,
        user: req.user.id, // Log the admin who deleted the user
      });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
});

export default router;
