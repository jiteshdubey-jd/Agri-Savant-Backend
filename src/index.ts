import resetPassword from "./routes/auth/resetPassword";
import authRoutes from "./routes/auth/authRoutes";
import forgotPassword from "./routes/auth/forgotPassword";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import adminFarmRoutes from "./routes/adminFarms";
import clientFarmRoutes from "./routes/clientFarmRoutes";
import clientCropRoutes from "./routes/clientCropRoutes";
import adminRoutes from "./routes/adminRoutes"; // ✅ Import admin routes
import clientRoutes from "./routes/clientRoutes";
import logRoutes from "./routes/logRoutes";
import events from "./routes/events"; // ✅ Import events routes
import dashboardRoutes from "./routes/dashboardRoutes";
import adminDashboardRoutes from "./routes/adminDashboardRoutes";
import adminFarmHealthRoutes from "./routes/adminFarmHealthRoutes"; // ✅ Import admin farm health routes

import farmHealthRoutes from "./routes/farmHealthRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({ origin: `${process.env.NEXT_PUBLIC_FRONTEND_URL}`, credentials: true })
); // ✅ Allow frontend to access backend

app.use(express.json());

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend server is running" });
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Routes
app.use("/api/adminFarms", adminFarmRoutes);
app.use("/api/clientFarms", clientFarmRoutes);
app.use("/api/clientCrops", clientCropRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/events", events); // ✅ Register events routes
app.use("/api/auth", authRoutes); // ✅ Register auth routes
app.use("/api/auth/forgot-password", forgotPassword);
app.use("/api/auth/reset-password", resetPassword);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/farmhealth", farmHealthRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/farmhealth", adminFarmHealthRoutes); // ✅ Register admin farm health routes

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("Backend API is running.");
});
