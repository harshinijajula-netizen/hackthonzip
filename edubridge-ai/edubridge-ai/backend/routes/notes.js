import express from "express";
import multer from "multer";
import Note from "../models/Note.js";
import { protect } from "../middleware/auth.js";
import { callGemini } from "../utils/gemini.js";
import { noteSummaryPrompt, noteQAPrompt } from "../utils/prompts.js";

const router = express.Router();
router.use(protect);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are supported."));
    }
    cb(null, true);
  },
});

// GET /api/notes
router.get("/", async (req, res, next) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ notes });
  } catch (err) {
    next(err);
  }
});

// GET /api/notes/:id
router.get("/:id", async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found." });
    res.json({ note });
  } catch (err) {
    next(err);
  }
});

// POST /api/notes/upload - upload a PDF, extract text, run AI summary/MCQs/flashcards
router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Please attach a PDF file." });

    // Lazy import keeps pdf-parse (which touches the filesystem on load) out of
    // the request path until we actually need it.
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(req.file.buffer);
    const text = (parsed.text || "").trim();

    if (!text) {
      return res.status(422).json({
        message: "We couldn't extract readable text from this PDF (it may be scanned/image-only).",
      });
    }

    const ai = await callGemini(
      "You are an educational content processor. Follow the instructions exactly and return only valid JSON.",
      noteSummaryPrompt() + `\n\nTEXT:\n"""${text.slice(0, 15000)}"""`,
      true
    );

    const note = await Note.create({
      userId: req.user._id,
      title: req.body.title || req.file.originalname.replace(/\.pdf$/i, ""),
      originalFilename: req.file.originalname,
      content: text.slice(0, 20000),
      summary: ai.summary || "",
      keyConcepts: ai.keyConcepts || [],
      importantQuestions: ai.importantQuestions || [],
      mcqs: ai.mcqs || [],
      flashcards: (ai.flashcards || []).map((f) => ({ ...f, mastered: false })),
    });

    res.status(201).json({ note });
  } catch (err) {
    if (err.message?.includes("Only PDF")) err.status = 400;
    next(err);
  }
});

// POST /api/notes/:id/ask - ask a question about a specific note using its content as context
router.post("/:id/ask", async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: "Please enter a question." });

    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found." });

    const answer = await callGemini(noteQAPrompt(note.content), question, false);
    res.json({ answer });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notes/:id - rename / edit note
router.put("/:id", async (req, res, next) => {
  try {
    const { title } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...(title && { title }) },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found." });
    res.json({ note });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notes/:id/flashcard/:cardId - mark flashcard mastered
router.put("/:id/flashcard/:cardId", async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found." });
    const card = note.flashcards.id(req.params.cardId);
    if (!card) return res.status(404).json({ message: "Flashcard not found." });
    card.mastered = req.body.mastered;
    await note.save();
    res.json({ note });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notes/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found." });
    res.json({ message: "Note deleted." });
  } catch (err) {
    next(err);
  }
});

export default router;
