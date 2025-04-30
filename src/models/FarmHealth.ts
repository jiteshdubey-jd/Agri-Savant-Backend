import mongoose from "mongoose";

const FarmHealthSchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },
    pestPressure: {
      needleValue: Number,
      pests: [
        {
          name: { type: String, required: true },
          level: { type: Number, required: true }, // 0–100
        },
      ],
    },
    nutrientStatus: {
      needleValue: Number,
      nutrients: [
        {
          name: { type: String, required: true },
          level: { type: Number, required: true }, // 0–100
        },
      ],
    },
    diseaseRisk: {
      needleValue: Number,
      riskLevel: {
        type: String,
        enum: ["Low", "Moderate", "High"],
        required: true,
      },
      potentialDiseases: [String],
      suggestions: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("FarmHealth", FarmHealthSchema);
