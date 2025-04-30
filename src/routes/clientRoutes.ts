import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware";
import User from "../models/User";
import Log from "../models/Log"; // ✅ Import Log model

const router = express.Router();

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string; role: string }; // Add `user` with `id` and `role`
  }
}

// 📌 Get the currently logged-in user
router.get("/", protect, async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch user details (excluding password)
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Error fetching user data:", error);
    res.status(500).json({ message: "Server error fetching user data" });
  }
});

// ✅ Fix: Update Client Profile Route
router.put("/", protect, async (req, res) => {
  console.log("🛠 Client Profile Update Request:", req.body);

  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Update only the fields provided in `req.body`
    const { name, mobileNumber, address, country, state } = req.body;

    if (name) user.name = name;
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (address) user.address = address;
    if (country) user.country = country;
    if (state) user.state = state;

    await user.save();

    // ✅ Log Update
    await Log.create({
      action: `Updated profile: ${user.email}`,
      user: req.user.id,
    });

    res.json(user);
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile", error });
  }
});

export default router;
