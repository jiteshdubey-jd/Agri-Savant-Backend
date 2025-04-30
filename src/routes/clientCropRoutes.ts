import express, { Request, Response } from "express";
import Crop from "../models/Crop";
import Farm from "../models/Farm";
import { protect, clientOnly } from "../middleware/authMiddleware";

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}


// GET all crops linked to the farms of the logged-in user
router.get(
  "/",
  protect,
  clientOnly,
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    try {
      const farms = await Farm.find({ userId }).select("crops");
      const cropIds = farms.flatMap((farm) => farm.crops);
      const crops = await Crop.find({ _id: { $in: cropIds } });

      res.json({ data: crops });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch crops." });
    }
  }
);

// POST add a crop to a farm
router.post(
  "/:farmId/crops",
  protect,
  clientOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const { farmId } = req.params;
      const cropData = req.body;

      if (
        !cropData.name ||
        !cropData.area ||
        !cropData.yield ||
        !cropData.plantingDate ||
        !cropData.harvestDate
      ) {
        return res.status(400).json({ message: "Missing crop fields" });
      }

      const newCrop = new Crop({ ...cropData, farmId });
      await newCrop.save();

      // 👇 Update the corresponding farm to include this crop's _id
      await Farm.findByIdAndUpdate(farmId, {
        $push: { crops: newCrop._id },
      });

      res.status(201).json(newCrop);
    } catch (err) {
      res.status(500).json({ message: "Failed to add crop" });
    }
  }
);

// PUT update a crop
router.put(
  "/:id",
  protect,
  clientOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const updatedCrop = await Crop.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedCrop)
        return res.status(404).json({ message: "Crop not found" });

      res.json(updatedCrop);
    } catch (err) {
      res.status(500).json({ message: "Failed to update crop" });
    }
  }
);

router.delete(
  "/:farmId/crops/:cropId",
  protect,
  clientOnly,
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { farmId, cropId } = req.params;

    try {
      // Verify farm belongs to the logged-in user
      const farm = await Farm.findOne({ _id: farmId, userId: userId });
      if (!farm) {
        return res
          .status(404)
          .json({ message: "Farm not found or access denied" });
      }

      // Delete the crop
      const crop = await Crop.findOneAndDelete({
        _id: cropId,
        farmId: farm._id,
      });

      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }

      await Farm.findByIdAndUpdate(farmId, {
        $pull: { crops: cropId },
      });

      res.status(200).json({ message: "Crop deleted successfully" });
    } catch (err) {
      console.error("Delete crop error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
