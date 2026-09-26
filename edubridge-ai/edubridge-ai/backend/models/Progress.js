import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    masteryLevel: {
      type: String,
      enum: ["Weak", "Needs Practice", "Good", "Strong"],
      default: "Weak",
    },
    history: [{ date: { type: Date, default: Date.now }, accuracy: Number }],
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, topic: 1 }, { unique: true });

export default mongoose.model("Progress", progressSchema);
