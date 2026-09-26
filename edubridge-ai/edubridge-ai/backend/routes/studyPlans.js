import express from "express";
import StudyPlan from "../models/StudyPlan.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// GET /api/study-plans
router.get("/", async (req, res, next) => {
  try {
    const plans = await StudyPlan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ plans });
  } catch (err) {
    next(err);
  }
});

// POST /api/study-plans - persist an AI-generated plan
router.post("/", async (req, res, next) => {
  try {
    const { examDate, dailyStudyTime, subjects, weakTopics, tasks } = req.body;
    if (!tasks?.length) {
      return res.status(400).json({ message: "Study plan must include tasks." });
    }

    // archive previous active plans so the dashboard shows only one current plan
    await StudyPlan.updateMany({ userId: req.user._id, status: "active" }, { status: "archived" });

    const plan = await StudyPlan.create({
      userId: req.user._id,
      examDate,
      dailyStudyTime,
      subjects,
      weakTopics,
      tasks,
    });

    res.status(201).json({ plan });
  } catch (err) {
    next(err);
  }
});

// PUT /api/study-plans/:id - update plan fields or mark a task completed
router.put("/:id", async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!plan) return res.status(404).json({ message: "Study plan not found." });

    const { taskId, completed, examDate, dailyStudyTime } = req.body;

    if (taskId) {
      const task = plan.tasks.id(taskId);
      if (!task) return res.status(404).json({ message: "Task not found." });
      task.completed = completed;
    }
    if (examDate !== undefined) plan.examDate = examDate;
    if (dailyStudyTime !== undefined) plan.dailyStudyTime = dailyStudyTime;

    await plan.save();
    res.json({ plan });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/study-plans/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!plan) return res.status(404).json({ message: "Study plan not found." });
    res.json({ message: "Study plan deleted." });
  } catch (err) {
    next(err);
  }
});

export default router;
