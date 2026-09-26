import express from "express";
import Quiz from "../models/Quiz.js";
import { protect } from "../middleware/auth.js";
import { updateProgressForTopic } from "../utils/progressEngine.js";

const router = express.Router();
router.use(protect);

// GET /api/quizzes - quiz history for the logged-in user
router.get("/", async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ quizzes });
  } catch (err) {
    next(err);
  }
});

// GET /api/quizzes/:id
router.get("/:id", async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user._id });
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });
    res.json({ quiz });
  } catch (err) {
    next(err);
  }
});

// POST /api/quizzes - save a generated quiz (called after /api/ai/generate-quiz)
router.post("/", async (req, res, next) => {
  try {
    const { subject, topic, difficulty, questionType, questions } = req.body;
    if (!subject || !topic || !questions?.length) {
      return res.status(400).json({ message: "Missing quiz data." });
    }

    const quiz = await Quiz.create({
      userId: req.user._id,
      subject,
      topic,
      difficulty,
      questionType,
      questions: questions.map((q) => ({ ...q, userAnswer: null, isCorrect: null })),
    });

    res.status(201).json({ quiz });
  } catch (err) {
    next(err);
  }
});

// POST /api/quizzes/:id/submit - submit answers, grade, update progress
router.post("/:id/submit", async (req, res, next) => {
  try {
    const { answers } = req.body; // [{ index, answer }]
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user._id });
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });
    if (quiz.status === "completed") {
      return res.status(400).json({ message: "This quiz has already been submitted." });
    }

    let correctCount = 0;
    const topicStats = {};

    quiz.questions.forEach((q, idx) => {
      const given = answers.find((a) => a.index === idx)?.answer ?? null;
      const isCorrect = given !== null && given === q.correctAnswer;
      q.userAnswer = given;
      q.isCorrect = isCorrect;
      if (isCorrect) correctCount++;

      const t = q.topic || quiz.topic;
      if (!topicStats[t]) topicStats[t] = { correct: 0, total: 0 };
      topicStats[t].total++;
      if (isCorrect) topicStats[t].correct++;
    });

    const percentage = Math.round((correctCount / quiz.questions.length) * 100);
    quiz.score = correctCount;
    quiz.percentage = percentage;
    quiz.status = "completed";

    // Update per-topic progress in MongoDB (real data, not simulated)
    for (const [topic, stat] of Object.entries(topicStats)) {
      await updateProgressForTopic(req.user._id, quiz.subject, topic, stat.correct, stat.total);
    }

    const weakTopics = Object.entries(topicStats)
      .filter(([, s]) => Math.round((s.correct / s.total) * 100) < 60)
      .map(([t]) => t);
    quiz.weakTopics = weakTopics;

    await quiz.save();
    res.json({ quiz });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/quizzes/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });
    res.json({ message: "Quiz deleted." });
  } catch (err) {
    next(err);
  }
});

export default router;
