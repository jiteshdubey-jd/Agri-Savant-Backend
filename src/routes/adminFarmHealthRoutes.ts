import express, { Request, Response } from "express";
import FarmHealth from "../models/FarmHealth"; // Import the FarmHealth model
import Farm from "../models/Farm"; // Import the Farm model (to get farm details)
import { protect, adminOnly } from "../middleware/authMiddleware";
import { ObjectId } from "mongodb";

const router = express.Router();

// Extend Request to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// ✅ Get Farm Health data for a specific farm (Admin only)
router.get(
  "/:farmId",
  protect,
  adminOnly,
  async (req: Request, res: Response) => {
    const { farmId } = req.params;

    try {
      const farmHealth = await FarmHealth.aggregate([
        {
          $match: {
            farmId: new ObjectId(farmId), // ✅ correct type
          },
        },
        {
          $lookup: {
            from: "farms",
            localField: "farmId",
            foreignField: "_id",
            as: "farmDetails",
          },
        },
        {
          $unwind: {
            path: "$farmDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

      if (!farmHealth || farmHealth.length === 0) {
        return res.status(404).json({ message: "Farm health not found" });
      }

      res.status(200).json(farmHealth[0]);
    } catch (error: any) {
      console.error("❌ Error fetching specific farm health:", error.message);
      res.status(500).json({ message: error.message || "Server error" });
    }
  }
);

// 📌 Create new Farm Health data (Admin only)
router.post(
  "/",
  protect,
  adminOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const { farmId, pestPressure, nutrientStatus, diseaseRisk } = req.body;

      // Check if the farm exists
      const farm = await Farm.findById(farmId);
      if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
      }

      // Create new FarmHealth document
      const newFarmHealth = new FarmHealth({
        farmId,
        pestPressure,
        nutrientStatus,
        diseaseRisk,
      });
      const savedFarmHealth = await newFarmHealth.save();
      const populatedFarmHealth = await savedFarmHealth.populate("farmId"); // <- This line is key
      res.status(201).json(populatedFarmHealth.toJSON());
    } catch (error) {
      console.error("❌ Error creating farm health data:", error);
      res.status(400).json({ message: "Error creating farm health data" });
    }
  }
);

// ✅ Update Farm Health data by ID (Admin only)
router.put("/:id", protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch the original FarmHealth document
    const existingFarmHealth = await FarmHealth.findById(id);
    if (!existingFarmHealth) {
      return res.status(404).json({ message: "Farm Health data not found" });
    }

    // Merge update fields manually
    const update = {
      pestPressure: req.body.pestPressure || existingFarmHealth.pestPressure,
      nutrientStatus:
        req.body.nutrientStatus || existingFarmHealth.nutrientStatus,
      diseaseRisk: req.body.diseaseRisk || existingFarmHealth.diseaseRisk,
    };

    // Update the farm health document with the new data
    const updatedFarmHealth = await FarmHealth.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true, // Ensure updates are validated
    });

    res.json(updatedFarmHealth); // Return updated farm health data
  } catch (error) {
    console.error("❌ Error updating farm health data:", error);
    res.status(500).json({ message: "Error updating farm health data", error });
  }
});

// ✅ Delete Farm Health data by ID (Admin only)
router.delete(
  "/:id",
  protect,
  adminOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const farmHealth = await FarmHealth.findById(req.params.id);

      if (!farmHealth)
        return res.status(404).json({ message: "Farm Health data not found" });

      // Delete the farm health data
      await farmHealth.deleteOne();

      res.json({ message: "Farm Health data deleted" }); // Return success message
    } catch (error) {
      console.error("❌ Error deleting farm health data:", error);
      res.status(500).json({ message: "Error deleting farm health data" });
    }
  }
);

export default router;
