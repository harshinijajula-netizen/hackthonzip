import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: String,
    options: [String],
    correctAnswer: String,
    userAnswer: { type: String, default: null },
    isCorrect: { type: Boolean, default: null },
    topic: String,
    explanation: String,
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    questionType: { type: String, enum: ["MCQ", "True/False", "Scenario-based"], default: "MCQ" },
    questions: [questionSchema],
    status: { type: String, enum: ["generated", "completed"], default: "generated" },
    score: { type: Number, default: null },
    percentage: { type: Number, default: null },
    weakTopics: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
