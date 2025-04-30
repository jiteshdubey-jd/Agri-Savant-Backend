import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Log || mongoose.model("Log", LogSchema);
