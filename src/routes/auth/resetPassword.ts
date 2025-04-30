import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User";

interface DecodedToken extends jwt.JwtPayload {
  id: string;
}

const router = express.Router();

router.post("/", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ error: "Token and new password are required" });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;

    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
