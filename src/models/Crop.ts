import mongoose from "mongoose";

const CropSchema = new mongoose.Schema(
  {
    name: String,
    area: Number,
    yield: Number,
    plantingDate: Date,
    harvestDate: Date,
    stage: String,
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Crop", CropSchema);
