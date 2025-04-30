import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware"; // ✅ Correct import
import Log from "../models/Log";

const router = express.Router();

// 📌 Get all logs (Admin Only)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(20); // Fetch latest 20 logs
    res.json(logs);
  } catch (error) {
    console.error("❌ Error fetching logs:", error);
    res.status(500).json({ message: "Error fetching logs" });
  }
});

export default router;
