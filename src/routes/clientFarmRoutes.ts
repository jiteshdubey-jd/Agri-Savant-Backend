import express, { Request, Response } from "express";
import Farm from "../models/Farm";
import Crop from "../models/Crop";
import {
  protect,
  clientOnly,
  authorizeFarmEdit,
} from "../middleware/authMiddleware";

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// GET all farms with crops for logged-in user (paginated)
router.get(
  "/",
  protect,
  clientOnly,
  async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 1;
    const userId = req.user!.id;

    try {
      const farms = await Farm.find({ userId })
        .populate("crops")
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Farm.countDocuments({ userId });

      res.json({
        data: farms,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch farms." });
    }
  }
);

// POST create new farm
router.post(
  "/",
  protect,
  clientOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, location, size, soil, irrigation } = req.body;

      const farm = new Farm({
        name,
        location,
        size,
        soil,
        irrigation,
        userId: req.user!.id,
      });

      const savedFarm = await farm.save();
      res.status(201).json(savedFarm);
    } catch (err) {
      res.status(500).json({ message: "Failed to create farm" });
    }
  }
);

// PUT update a farm
router.put(
  "/:id",
  protect,
  clientOnly,
  authorizeFarmEdit,
  async (req: AuthRequest, res: Response) => {
    try {
      const updatedFarm = await Farm.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      ).populate("crops");

      if (!updatedFarm)
        return res.status(404).json({ message: "Farm not found" });

      res.json(updatedFarm);
    } catch (err) {
      res.status(500).json({ message: "Failed to update farm" });
    }
  }
);

// DELETE a farm and its crops
router.delete(
  "/:id",
  protect,
  clientOnly,
  authorizeFarmEdit,
  async (req: AuthRequest, res: Response) => {
    try {
      const farm = await Farm.findById(req.params.id);
      if (!farm) return res.status(404).json({ message: "Farm not found" });

      await Crop.deleteMany({ farmId: farm._id });
      await farm.deleteOne();

      res.json({ message: "Farm and its crops deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete farm" });
    }
  }
);

export default router;
