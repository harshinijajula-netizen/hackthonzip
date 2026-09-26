import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getAllProgress,
  getWeakTopics,
  getStrongTopics,
  calculateExamReadiness,
} from "../utils/progressEngine.js";
import Quiz from "../models/Quiz.js";
import Progress from "../models/Progress.js";

const router = express.Router();
router.use(protect);

// GET /api/progress - full dashboard analytics payload, all from real DB data
router.get("/", async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [all, weak, strong, readiness, recentQuizzes] = await Promise.all([
      getAllProgress(userId),
      getWeakTopics(userId),
      getStrongTopics(userId),
      calculateExamReadiness(userId),
      Quiz.find({ userId, status: "completed" }).sort({ createdAt: -1 }).limit(20),
    ]);

    const completedQuizzes = recentQuizzes.length;
    const avgAccuracy = all.length
      ? Math.round(all.reduce((s, p) => s + p.accuracy, 0) / all.length)
      : 0;
    const topicsMastered = all.filter((p) => p.accuracy >= 80).length;

    res.json({
      overallProgress: avgAccuracy,
      quizAccuracy: avgAccuracy,
      topicsMastered,
      studyStreak: req.user.studyStreak || 0,
      examReadiness: readiness.readiness,
      examReadinessExplanation: readiness.explanation,
      weakTopics: weak,
      strongTopics: strong,
      allTopics: all,
      quizHistory: recentQuizzes.map((q) => ({
        id: q._id,
        subject: q.subject,
        topic: q.topic,
        percentage: q.percentage,
        date: q.createdAt,
      })),
      completedQuizzes,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/progress/topic/:topic - improvement history for one topic
router.get("/topic/:topic", async (req, res, next) => {
  try {
    const progress = await Progress.findOne({ userId: req.user._id, topic: req.params.topic });
    if (!progress) return res.status(404).json({ message: "No progress data for this topic yet." });
    res.json({ progress });
  } catch (err) {
    next(err);
  }
});

export default router;
