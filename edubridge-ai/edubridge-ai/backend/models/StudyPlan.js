import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    day: Number,
    subject: String,
    topic: String,
    durationMinutes: Number,
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const studyPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    examDate: Date,
    dailyStudyTime: Number,
    subjects: [String],
    weakTopics: [String],
    tasks: [taskSchema],
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("StudyPlan", studyPlanSchema);
