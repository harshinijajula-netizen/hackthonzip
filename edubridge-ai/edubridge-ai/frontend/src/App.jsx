import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import AITutor from "./pages/AITutor.jsx";
import SmartQuiz from "./pages/SmartQuiz.jsx";
import QuizAttempt from "./pages/QuizAttempt.jsx";
import QuizResult from "./pages/QuizResult.jsx";
import StudyPlanner from "./pages/StudyPlanner.jsx";
import Notes from "./pages/Notes.jsx";
import NoteDetail from "./pages/NoteDetail.jsx";
import Flashcards from "./pages/Flashcards.jsx";
import Progress from "./pages/Progress.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";

const withLayout = (el) => <Layout>{el}</Layout>;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<ProtectedRoute>{withLayout(<Dashboard />)}</ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute>{withLayout(<Profile />)}</ProtectedRoute>} />
      <Route path="/tutor" element={<ProtectedRoute>{withLayout(<AITutor />)}</ProtectedRoute>} />
      <Route path="/quiz" element={<ProtectedRoute>{withLayout(<SmartQuiz />)}</ProtectedRoute>} />
      <Route path="/quiz/attempt/:id" element={<ProtectedRoute>{withLayout(<QuizAttempt />)}</ProtectedRoute>} />
      <Route path="/quiz/result/:id" element={<ProtectedRoute>{withLayout(<QuizResult />)}</ProtectedRoute>} />
      <Route path="/planner" element={<ProtectedRoute>{withLayout(<StudyPlanner />)}</ProtectedRoute>} />
      <Route path="/notes" element={<ProtectedRoute>{withLayout(<Notes />)}</ProtectedRoute>} />
      <Route path="/notes/:id" element={<ProtectedRoute>{withLayout(<NoteDetail />)}</ProtectedRoute>} />
      <Route path="/flashcards" element={<ProtectedRoute>{withLayout(<Flashcards />)}</ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute>{withLayout(<Progress />)}</ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute>{withLayout(<Settings />)}</ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
