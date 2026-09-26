import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    originalFilename: String,
    content: { type: String, default: "" }, // extracted text, used as context for Q&A
    summary: { type: String, default: "" },
    keyConcepts: [String],
    importantQuestions: [String],
    mcqs: [
      {
        question: String,
        options: [String],
        correctAnswer: String,
      },
    ],
    flashcards: [{ front: String, back: String, mastered: { type: Boolean, default: false } }],
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
