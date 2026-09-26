import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    learningLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    preferredLanguage: {
      type: String,
      enum: ["English", "Telugu", "Hindi"],
      default: "English",
    },
    dailyStudyTime: { type: Number, default: 60 }, // minutes
    examDate: { type: Date, default: null },
    studyStreak: { type: Number, default: 0 },
    lastStudyDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
