import express, { Request, Response } from "express";
import { protect } from "../middleware/authMiddleware";
import Dashboard from "../models/Dashboard";
import Farm from "../models/Farm";
import Crop from "../models/Crop";
import { Types } from "mongoose";

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

interface PopulatedFarm {
  _id: Types.ObjectId;
  name: string;
  size: number;
  location: string;
}

interface PopulatedDashboard {
  _id: Types.ObjectId;
  farmId: PopulatedFarm;
  charts: any;
  weather: any;
  soil: any;
  image: any;
  upcomingTasks: string[];
}

// GET all dashboard data for logged-in user
router.get("/", protect, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const dashboards = await Dashboard.find({ userId: req.user.id }).populate<{
      farmId: PopulatedFarm;
    }>("farmId");

    const formatted = await Promise.all(
      dashboards.map(async (item) => {
        const crop = await Crop.findOne({ farmId: item.farmId._id });

        return {
          dashboardId: item._id,
          farmId: item.farmId._id,
          farmName: item.farmId.name,
          farmSize: item.farmId.size,
          location: item.farmId.location,
          farmImage: item.image,
          cropName: crop?.name || "N/A",
          sowingDate: crop?.plantingDate || null,
          stage: crop?.stage || "N/A",
          charts: item.charts,
          weather: item.weather,
          soil: item.soil,
          upcomingTasks: item.upcomingTasks,
        };
      })
    );

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
});

export default router;
