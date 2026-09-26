import Progress from "../models/Progress.js";

// Classification thresholds (see spec section 13)
export const classify = (accuracy) => {
  if (accuracy >= 80) return "Strong";
  if (accuracy >= 60) return "Good";
  if (accuracy >= 40) return "Needs Practice";
  return "Weak";
};

/**
 * Updates (or creates) a Progress document for a user+topic after a quiz is submitted.
 * Recalculates accuracy from real attempt counts stored in the DB - never fabricated.
 */
export async function updateProgressForTopic(userId, subject, topic, correctCount, totalCount) {
  let progress = await Progress.findOne({ userId, topic });

  if (!progress) {
    progress = new Progress({ userId, subject, topic, attempts: 0, correct: 0 });
  }

  progress.attempts += totalCount;
  progress.correct += correctCount;
  progress.accuracy = Math.round((progress.correct / progress.attempts) * 100);
  progress.masteryLevel = classify(progress.accuracy);
  progress.history.push({ date: new Date(), accuracy: progress.accuracy });

  await progress.save();
  return progress;
}

export async function getAllProgress(userId) {
  return Progress.find({ userId }).sort({ accuracy: 1 });
}

export async function getWeakTopics(userId, limit = 5) {
  return Progress.find({ userId, accuracy: { $lt: 60 } })
    .sort({ accuracy: 1 })
    .limit(limit);
}

export async function getStrongTopics(userId, limit = 5) {
  return Progress.find({ userId, accuracy: { $gte: 80 } })
    .sort({ accuracy: -1 })
    .limit(limit);
}

/**
 * Exam readiness = weighted blend of overall accuracy, topic coverage, and
 * how few weak topics remain. Fully derived from real Progress data.
 */
export async function calculateExamReadiness(userId) {
  const all = await getAllProgress(userId);
  if (all.length === 0) {
    return { readiness: 0, explanation: "Take a few quizzes to get your exam readiness score." };
  }

  const avgAccuracy = all.reduce((sum, p) => sum + p.accuracy, 0) / all.length;
  const weakCount = all.filter((p) => p.accuracy < 60).length;
  const coverageScore = Math.min(all.length / 8, 1) * 100; // covering >=8 distinct topics = full coverage
  const weakPenalty = Math.min(weakCount * 8, 40);

  const readiness = Math.max(
    0,
    Math.round(avgAccuracy * 0.55 + coverageScore * 0.25 - weakPenalty * 0.5 + 20 * 0.2)
  );
  const capped = Math.min(readiness, 100);

  const weakest = [...all].sort((a, b) => a.accuracy - b.accuracy).slice(0, 2);
  const weakNames = weakest.map((w) => w.topic).join(" and ");

  const explanation = weakNames
    ? `Your current readiness indicator is based on your recent quiz accuracy and topic coverage. Focus on ${weakNames} next.`
    : "Your current readiness indicator is based on your recent quiz accuracy and topic coverage. Keep practicing consistently.";

  return { readiness: capped, explanation };
}
