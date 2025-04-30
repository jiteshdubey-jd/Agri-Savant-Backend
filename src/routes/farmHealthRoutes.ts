import express, { Request, Response } from "express";
import { protect } from "../middleware/authMiddleware";
import Farm from "../models/Farm";
import FarmHealth from "../models/FarmHealth";

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// GET farm health for the logged-in user's farms
router.get("/my-farms", protect, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const farms = await Farm.find({ userId: req.user.id });

    if (!farms.length) {
      return res.status(404).json({ message: "No farms found for this user" });
    }

    const healthData = await Promise.all(
      farms.map(async (farm) => {
        const health = await FarmHealth.findOne({ farmId: farm._id });
        if (!health) return null;

        return {
          farmId: farm._id,
          farmName: farm.name,
          location: farm.location,
          health,
        };
      })
    );

    const filteredData = healthData.filter(Boolean);

    if (!filteredData.length) {
      return res
        .status(404)
        .json({ message: "No health data found for user's farms" });
    }

    res.json(filteredData);
  } catch (error: any) {
    console.error("Error fetching farm health:", error);
    res.status(500).json({
      message: "Server error fetching farm health",
      error: error.message,
    });
  }
});

export default router;
