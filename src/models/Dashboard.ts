import mongoose from "mongoose";

const DashboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },
    charts: {
      rh: [{ day: String, value: Number }],
      temp: [{ time: String, value: Number }],
      rainfall: [{ name: String, value: Number }],
    },
    weather: {
      forecast: String,
      temperature: String,
      humidity: String,
    },
    soil: {
      pH: Number,
      moisture: String,
    },
    upcomingTasks: [String],
    // 👇 Image URL
    image: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Dashboard", DashboardSchema);
