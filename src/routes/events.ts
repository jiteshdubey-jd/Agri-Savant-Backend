import { Router } from "express";
import { protect } from "../middleware/authMiddleware"; // Correct import
import Event from "../models/Event"; // Assuming this is your Event model

const router = Router();

// ✅ Route to Add an Event
router.post("/", protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    const { title, date, description } = req.body;
    const userId = req.user.id; // Extract user ID

    const newEvent = new Event({ userId, title, date, description });
    await newEvent.save();

    res
      .status(201)
      .json({ message: "Event added successfully", event: newEvent });
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Route to Fetch Events
// ✅ Fetch all events for logged-in user
router.get("/", protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    const events = await Event.find({ userId: req.user.id }); // ✅ Fetch user-specific events
    res.json(events);
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
