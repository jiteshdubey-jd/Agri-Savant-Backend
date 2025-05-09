import express, { Request, Response } from "express";
import { protect, adminOnly } from "../middleware/authMiddleware";
import Dashboard from "../models/Dashboard";

const router = express.Router();

// ✅ Get Dashboard by userId (Admin only)
router.get("/", protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const dashboards = await Dashboard.find()
      .populate("farmId", "name location") // Populate farmId with name and location
      .lean();

    if (!dashboards || dashboards.length === 0) {
      return res.status(404).json({ message: "No dashboards found" });
    }

    res.status(200).json(dashboards);
  } catch (error: any) {
    console.error(
      "❌ Error fetching all dashboards:",
      error.message,
      error.stack
    );
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { userId, farmId, charts, weather, soil, upcomingTasks, image } =
      req.body;

    if (!userId || !farmId) {
      return res
        .status(400)
        .json({ message: "userId and farmId are required" });
    }

    const dashboard = new Dashboard({
      userId,
      farmId,
      charts: {
        rh: charts?.rh || [],
        temp: charts?.temp || [],
        rainfall: charts?.rainfall || [],
      },
      weather: {
        forecast: weather?.forecast || "",
        temperature: weather?.temperature || "",
        humidity: weather?.humidity || "",
      },
      soil: {
        pH: soil?.pH || 0,
        moisture: soil?.moisture || "",
      },
      upcomingTasks: upcomingTasks || [],
      image: image || "",
    });

    const createdDashboard = await dashboard.save();

    res.status(201).json(createdDashboard);
  } catch (error) {
    console.error("Dashboard creation error:", error);
    res
      .status(500)
      .json({ message: "Server Error while creating dashboard entry" });
  }
});

router.put("/:dashboardId", protect, adminOnly, async (req, res) => {
  try {
    const { dashboardId } = req.params;

    // Admin can update any dashboard, so no need to check for userId
    const updatedDashboard = await Dashboard.findOneAndUpdate(
      { _id: dashboardId }, // Find the dashboard by ID (admin can edit any)
      req.body, // The update data from the request body
      { new: true } // Return the updated document
    );

    if (!updatedDashboard) {
      return res.status(404).json({ message: "Dashboard entry not found" });
    }

    res.status(200).json(updatedDashboard); // Return the updated dashboard
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server Error while updating dashboard entry" });
  }
});

router.delete("/:dashboardId", protect, adminOnly, async (req, res) => {
  try {
    const { dashboardId } = req.params;

    const dashboard = await Dashboard.findOne({ _id: dashboardId });

    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard entry not found" });
    }

    await dashboard.deleteOne();

    res.status(200).json({ message: "Dashboard entry deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server Error while deleting dashboard entry" });
  }
});

export default router;
