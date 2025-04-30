import mongoose from "mongoose";

const FarmSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    size: { type: Number, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    crops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Crop", // Reference to Crop model
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Farm", FarmSchema);
