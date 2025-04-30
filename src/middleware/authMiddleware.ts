import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import Farm from "../models/Farm";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string }; // Defined user type
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT secret is missing from environment variables");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { id: user._id.toString(), role: user.role };
    console.log("✅ User authenticated:", req.user);

    next();
  } catch (error) {
    console.error("❌ Auth error:", error);
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

// ✅ Middleware to Restrict Admin-Only Routes
export const adminOnly = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("🛡 Checking adminOnly middleware");
  console.log("🔍 req.user:", req.user);
  console.log("🔍 role type:", typeof req.user?.role);
  console.log("🔍 role value:", req.user?.role);

  if (req.user && req.user.role === "admin") {
    console.log("✅ Access granted to admin");

    next();
  } else {
    console.warn("🚫 Access denied. User role:", req.user?.role);

    res.status(403).json({ message: "Not authorized" });
  }
};

// ✅ Middleware to Restrict Client-Only Routes
export const clientOnly = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== "client") {
    return res.status(403).json({ message: "Access denied. Clients only." });
  }
  next();
};

export const authorizeFarmEdit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const farmId = req.params.id;

  try {
    const farm = await Farm.findById(farmId);
    if (!farm) return res.status(404).json({ message: "Farm not found" });

    const isOwner = farm.userId?.toString() === user?.id;
    const isAdmin = user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    next();
  } catch (err) {
    console.error("❌ Authorization error:", err);
    res.status(500).json({ message: "Authorization failed" });
  }
};
