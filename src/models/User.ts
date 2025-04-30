import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "client"],
      default: "client",
    },
    mobileNumber: {
      type: String,
      // required: true, // ✅ Ensure users provide a phone number
    },
    address: {
      type: String, // ✅ Optional field for user's address
    },
    country: {
      type: String, // ✅ Optional field for user's country
    },
    state: {
      type: String, // ✅ Optional field for user's state/region
    },
  },
  { timestamps: true } // ✅ Auto-handles `createdAt` & `updatedAt`
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
