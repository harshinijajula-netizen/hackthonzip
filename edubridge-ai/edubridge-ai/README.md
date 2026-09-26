# EduBridge AI

**Learn your way. Improve your way.**
Your personal AI learning companion.

## Problem

Most students use the same static material regardless of how they individually learn. Nobody
tracks *which specific topics* a student is weak in, and generic study plans ignore that. Students
waste time re-studying what they already know and under-practice what's actually failing them.

## Solution

EduBridge AI is a full-stack, AI-powered learning assistant built around one loop:

**ASSESS → LEARN → PRACTICE → ANALYZE → ADAPT → IMPROVE**

It generates AI quizzes, grades them, computes real per-topic accuracy from MongoDB (not
hardcoded numbers), classifies topics as Weak / Needs Practice / Good / Strong, and uses that to
drive a tutor, a study planner, and a recommendation engine — all backed by Google Gemini through
a secure backend.

## Features

- Full JWT authentication (register/login/logout, bcrypt password hashing, protected routes)
- AI Tutor chat with level (Beginner/Intermediate/Advanced) and language (English/Telugu/Hindi)
  adaptation, and persisted conversation history
- Smart Quiz generator (subject/topic/difficulty/question type) with Gemini-generated structured
  questions, a real quiz-taking flow, grading, and stored results
- Weak-topic detection engine computed from real quiz attempts (accuracy thresholds: 80–100
  Strong, 60–79 Good, 40–59 Needs Practice, 0–39 Weak)
- Adaptive AI recommendation on the dashboard, generated from actual weak/strong topic data
- AI Study Planner: generates a day-by-day plan from exam date, subjects, study time and current
  weak topics; full CRUD incl. marking tasks complete and regenerating
- Notes: upload a PDF, extract text, and get an AI summary, key concepts, important questions,
  MCQs and flashcards; ask follow-up questions answered using that note's content as context
- Flashcards with flip/next/previous/mark-as-mastered
- Progress analytics (Recharts) — quiz history trend, subject performance, topic accuracy, exam
  readiness — all computed from MongoDB, no fake chart data
- Responsive, dark-mode-first UI with a light mode toggle, glassmorphism cards, sidebar nav on
  desktop and bottom nav on mobile
- Real error handling, loading states and empty states throughout

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios, Lucide icons, Recharts
**Backend:** Node.js, Express
**Database:** MongoDB + Mongoose
**Auth:** JWT, bcryptjs
**AI:** Google Gemini API (`gemini-2.0-flash`), called only from the backend

## Architecture

```
React (Vite) frontend
   │  axios, JWT in Authorization header
   ▼
Express backend  ──▶  MongoDB (Mongoose models)
   │
   └──▶  Gemini API (server-side only, key never sent to the browser)
```

Every AI feature (tutor, quiz generation, study plan generation, note summarization/Q&A) is a
backend route that calls `utils/gemini.js`, which is the only place the Gemini API key is read
from `process.env`. The frontend never talks to Gemini directly.

### Note-based Q&A (RAG note)

Section 16 of the spec allows a document-context fallback if full vector RAG would make the MVP
unstable. This build implements the **reliable document-context approach**: extracted PDF text is
stored on the `Note` document and passed directly as context to Gemini for both summarization and
follow-up Q&A. There is no embedding/vector-store step. The `Note` model and `notes.js` routes are
isolated enough that swapping in a vector store (e.g. embeddings + a vector DB) later only touches
that one file — it is not implemented here, and this README does not claim it is.

## Environment Variables

Backend (`backend/.env`, see `backend/.env.example`):

```
MONGODB_URI=       # MongoDB Atlas connection string
JWT_SECRET=        # long random string
GEMINI_API_KEY=    # from https://aistudio.google.com/apikey
PORT=5000
CLIENT_URL=http://localhost:5173   # for CORS
```

Frontend (`frontend/.env`, see `frontend/.env.example`):

```
VITE_API_URL=http://localhost:5000/api
```

Never commit real `.env` files — both are already git-ignored.

## Installation

```bash
git clone <your-repo-url>
cd edubridge-ai

# backend
cd backend
npm install
cp .env.example .env   # fill in your own values

# frontend
cd ../frontend
npm install
cp .env.example .env
```

## Running Locally

```bash
# terminal 1
cd backend
npm run dev        # http://localhost:5000

# terminal 2
cd frontend
npm run dev         # http://localhost:5173
```

Register a new account at `http://localhost:5173/register`, then walk through the demo flow
below.

## Deployment

- **Frontend (Vercel):** import the `frontend` folder as the project root, build command
  `npm run build`, output directory `dist`, and set `VITE_API_URL` to your deployed backend URL.
- **Backend (Render/Railway/Replit):** import the `backend` folder, start command `npm start`,
  and set `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL` (your deployed frontend URL)
  as environment variables.
- **Database (MongoDB Atlas):** create a free cluster, allow network access from your backend
  host (or `0.0.0.0/0` for a hackathon demo), and use the connection string as `MONGODB_URI`.

## API Documentation

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/users/profile
PUT    /api/users/profile

POST   /api/ai/chat
GET    /api/ai/chat/history
DELETE /api/ai/chat/history
POST   /api/ai/generate-quiz
POST   /api/ai/generate-plan
GET    /api/ai/recommendation

GET    /api/quizzes
POST   /api/quizzes
GET    /api/quizzes/:id
POST   /api/quizzes/:id/submit
DELETE /api/quizzes/:id

GET    /api/progress
GET    /api/progress/topic/:topic

GET    /api/study-plans
POST   /api/study-plans
PUT    /api/study-plans/:id
DELETE /api/study-plans/:id

GET    /api/notes
POST   /api/notes/upload        (multipart/form-data, field "file")
POST   /api/notes/:id/ask
PUT    /api/notes/:id
PUT    /api/notes/:id/flashcard/:cardId
DELETE /api/notes/:id
```

All routes except `/api/auth/*` and `/api/health` require `Authorization: Bearer <jwt>`.

## Demo Flow

1. Register / log in
2. Open the dashboard
3. Ask the AI Tutor: "Explain normalization simply."
4. Generate a DBMS quiz on Smart Quiz
5. Complete the quiz
6. See the score and per-question review
7. Check weak-topic detection on the dashboard/progress page
8. Read the adaptive AI recommendation
9. Generate a personalized study plan
10. Open My Progress and see updated charts pulled from MongoDB

## Future Scope

- Voice tutor
- Teacher dashboard
- Full vector-embedding RAG for notes
- Gamification (badges, leaderboards)
- Mobile app
- Classroom / LMS integration

---

*Every student learns differently. EduBridge AI adapts to the learner.*
