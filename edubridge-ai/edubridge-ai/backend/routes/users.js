import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// GET /api/users/profile
router.get("/profile", async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/profile
router.put("/profile", async (req, res, next) => {
  try {
    const { name, learningLevel, preferredLanguage, dailyStudyTime, examDate } = req.body;

    const allowed = ["Beginner", "Intermediate", "Advanced"];
    if (learningLevel && !allowed.includes(learningLevel)) {
      return res.status(400).json({ message: "Invalid learning level." });
    }
    const allowedLang = ["English", "Telugu", "Hindi"];
    if (preferredLanguage && !allowedLang.includes(preferredLanguage)) {
      return res.status(400).json({ message: "Invalid language." });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name && { name }),
        ...(learningLevel && { learningLevel }),
        ...(preferredLanguage && { preferredLanguage }),
        ...(dailyStudyTime && { dailyStudyTime }),
        ...(examDate !== undefined && { examDate: examDate || null }),
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
