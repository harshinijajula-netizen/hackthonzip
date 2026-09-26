import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import api from "../api/axios.js";
import { getErrorMessage } from "../utils.js";
import ErrorBanner from "../components/ErrorBanner.jsx";
import { PageLoading } from "../components/Loading.jsx";

export default function QuizResult() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/quizzes/${id}`);
        setQuiz(data.quiz);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <PageLoading label="Loading result..." />;
  if (!quiz) return <ErrorBanner message={error || "Quiz not found."} />;

  const strong = [...new Set(quiz.questions.filter((q) => q.isCorrect).map((q) => q.topic))];
  const weak = [...new Set(quiz.questions.filter((q) => !q.isCorrect).map((q) => q.topic))];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-xs uppercase tracking-wide text-slate-400">{quiz.subject} · {quiz.topic}</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-white">
          {quiz.score} / {quiz.questions.length}
        </h1>
        <p className="mt-1 text-sm text-slate-400">Your Score</p>

        <div className="mx-auto mt-6 h-2 max-w-xs rounded-full bg-white/5">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple"
            style={{ width: `${quiz.percentage}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-300">{quiz.percentage}% Accuracy</p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display text-sm font-semibold text-white">Strong Areas</h3>
          <p className="mt-2 text-sm text-slate-400">{strong.length ? strong.join(", ") : "None yet"}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display text-sm font-semibold text-white">Weak Areas</h3>
          <p className="mt-2 text-sm text-slate-400">{weak.length ? weak.join(", ") : "None — great job!"}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <h3 className="font-display text-sm font-semibold text-white">Review</h3>
        {quiz.questions.map((q, i) => (
          <div key={i} className="glass rounded-xl p-4">
            <div className="flex items-start gap-2">
              {q.isCorrect ? (
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
              ) : (
                <XCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
              )}
              <div>
                <p className="text-sm text-white">{q.question}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Your answer: {q.userAnswer || "Not answered"} {!q.isCorrect && `· Correct: ${q.correctAnswer}`}
                </p>
                {q.explanation && <p className="mt-1 text-xs text-slate-500">{q.explanation}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Link
          to="/quiz"
          className="flex items-center gap-1 rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple px-5 py-2.5 text-sm font-semibold text-ink-950"
        >
          Take Another Quiz <ArrowRight size={14} />
        </Link>
        <Link to="/progress" className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-slate-300 hover:bg-white/5">
          View Progress
        </Link>
      </div>
    </div>
  );
}
