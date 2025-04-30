import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  type: {
    type: String,
    enum: ["irrigation", "fertilizer", "pesticide", "harvest", "custom"],
    default: "custom",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
