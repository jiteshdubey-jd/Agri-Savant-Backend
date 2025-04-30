import express, { Request, Response } from "express";
import Farm from "../models/Farm";
import { protect, adminOnly } from "../middleware/authMiddleware";

const router = express.Router();

// Extend Request to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// ✅ Get Farms ( Admin all by ownerId)
router.get("/", protect, adminOnly, async (req: Request, res) => {
  try {
    const farms = await Farm.find().populate("userId", "name email").lean();

    const normalizedFarms = farms.map((farm) => ({
      ...farm,
      id: farm._id.toString(), // ✅ Add this to support frontend logic
    }));

    res.json(normalizedFarms);
  } catch (error: any) {
    console.error("❌ Error fetching all farms:", error.message, error.stack);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// 📌 Create a Farm (Admin can create for any user)
router.post(
  "/",
  protect,
  adminOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, location, size, crops, soil, irrigation, userId } =
        req.body;

      const farm = new Farm({
        name,
        location,
        size,
        crops,
        soil,
        irrigation,
        // userId: req.user?.id, // Ensure `user` exists
        userId:
          req.user?.role === "admin" ? userId || req.user.id : req.user?.id,
      });

      const savedFarm = await farm.save();
      res.status(201).json(savedFarm);
    } catch (error) {
      res.status(400).json({ message: "Error creating farm" });
    }
  }
);

// ✅ Update Farm by ID (Admin only)
router.put("/:id", protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch the original document first
    const existingFarm = await Farm.findById(id);
    if (!existingFarm) {
      return res.status(404).json({ message: "Farm not found" });
    }

    // Merge update fields manually
    const update = {
      name: req.body.name || existingFarm.name,
      location: req.body.location || existingFarm.location,
      size:
        req.body.size !== undefined ? Number(req.body.size) : existingFarm.size,
      userId: existingFarm.userId, // 👈 Make sure it's preserved
    };

    const updatedFarm = await Farm.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true, // or true if you want strict validation
    });

    res.json(updatedFarm);
  } catch (error) {
    console.error("❌ Error updating farm:", error);
    res.status(500).json({ message: "Error updating farm", error });
  }
});

// ✅ Delete Farm (Admin only)
router.delete(
  "/:id",
  protect,
  adminOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const farm = await Farm.findById(req.params.id);

      if (!farm) return res.status(404).json({ message: "Farm not found" });

      const isOwner = farm.userId.toString() === req.user?.id;
      const isAdmin = req.user?.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await farm.deleteOne();
      res.json({ message: "Farm deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting farm" });
    }
  }
);

export default router;
