import express from "express";
import { protect } from "../middleware/auth.js";
import { callGemini } from "../utils/gemini.js";
import ChatMessage from "../models/ChatMessage.js";
import {
  tutorSystemPrompt,
  quizGenerationPrompt,
  studyPlanPrompt,
  recommendationPrompt,
} from "../utils/prompts.js";
import { getWeakTopics, getStrongTopics } from "../utils/progressEngine.js";

const router = express.Router();
router.use(protect);

// POST /api/ai/chat - AI Tutor
router.post("/chat", async (req, res, next) => {
  try {
    const { message, level, language } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: "Please enter a question." });

    const useLevel = level || req.user.learningLevel || "Beginner";
    const useLanguage = language || req.user.preferredLanguage || "English";

    await ChatMessage.create({ userId: req.user._id, role: "user", content: message });

    const reply = await callGemini(tutorSystemPrompt(useLevel, useLanguage), message, false);

    await ChatMessage.create({ userId: req.user._id, role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

// GET /api/ai/chat/history
router.get("/chat/history", async (req, res, next) => {
  try {
    const history = await ChatMessage.find({ userId: req.user._id }).sort({ createdAt: 1 }).limit(100);
    res.json({ history });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/ai/chat/history
router.delete("/chat/history", async (req, res, next) => {
  try {
    await ChatMessage.deleteMany({ userId: req.user._id });
    res.json({ message: "Conversation cleared." });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/generate-quiz
router.post("/generate-quiz", async (req, res, next) => {
  try {
    const { subject, topic, numQuestions, difficulty, questionType } = req.body;
    if (!subject || !topic || !numQuestions) {
      return res.status(400).json({ message: "Subject, topic and number of questions are required." });
    }
    if (numQuestions < 1 || numQuestions > 20) {
      return res.status(400).json({ message: "Number of questions must be between 1 and 20." });
    }

    const questions = await callGemini(
      "You are a precise quiz-generation engine. Return only valid JSON, matching the requested shape exactly.",
      quizGenerationPrompt({ subject, topic, numQuestions, difficulty, questionType }),
      true
    );

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(502).json({ message: "We couldn't generate the quiz. Please try again." });
    }

    res.json({ subject, topic, difficulty, questionType, questions });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/generate-plan
router.post("/generate-plan", async (req, res, next) => {
  try {
    const { examDate, subjects, dailyStudyTime } = req.body;
    if (!examDate || !subjects?.length || !dailyStudyTime) {
      return res.status(400).json({ message: "Exam date, subjects and daily study time are required." });
    }

    const weak = await getWeakTopics(req.user._id, 8);
    const weakTopics = weak.map((w) => w.topic);

    const tasks = await callGemini(
      "You are a precise study-plan-generation engine. Return only valid JSON, matching the requested shape exactly.",
      studyPlanPrompt({
        examDate,
        subjects,
        weakTopics,
        dailyStudyTime,
        level: req.user.learningLevel,
      }),
      true
    );

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(502).json({ message: "We couldn't generate a study plan. Please try again." });
    }

    res.json({ examDate, subjects, dailyStudyTime, weakTopics, tasks });
  } catch (err) {
    next(err);
  }
});

// GET /api/ai/recommendation - short adaptive recommendation for the dashboard
router.get("/recommendation", async (req, res, next) => {
  try {
    const [weak, strong] = await Promise.all([
      getWeakTopics(req.user._id, 3),
      getStrongTopics(req.user._id, 3),
    ]);

    if (weak.length === 0 && strong.length === 0) {
      return res.json({
        recommendation:
          "Take your first quiz so EduBridge AI can learn your strengths and tailor recommendations to you.",
      });
    }

    const recommendation = await callGemini(
      "You are a concise, encouraging educational coach.",
      recommendationPrompt(weak, strong),
      false
    );

    res.json({ recommendation });
  } catch (err) {
    next(err);
  }
});

export default router;
