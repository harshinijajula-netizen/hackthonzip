import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import api from "../api/axios.js";
import { getErrorMessage } from "../utils.js";
import ErrorBanner from "../components/ErrorBanner.jsx";
import { PageLoading } from "../components/Loading.jsx";

export default function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/quizzes/${id}`);
        if (data.quiz.status === "completed") {
          navigate(`/quiz/result/${id}`, { replace: true });
          return;
        }
        setQuiz(data.quiz);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  if (loading) return <PageLoading label="Loading quiz..." />;
  if (!quiz) return <ErrorBanner message={error || "Quiz not found."} />;

  const question = quiz.questions[current];
  const total = quiz.questions.length;

  const selectAnswer = (option) => {
    setAnswers((prev) => ({ ...prev, [current]: option }));
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        answers: Object.entries(answers).map(([index, answer]) => ({ index: Number(index), answer })),
      };
      await api.post(`/quizzes/${id}/submit`, payload);
      navigate(`/quiz/result/${id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          Question {current + 1} of {total}
        </p>
        <p className="text-xs text-slate-500">{quiz.subject} · {quiz.topic}</p>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-white/5">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple transition-all"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>

      <ErrorBanner message={error} />

      <div className="glass mt-6 rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold text-white">{question.question}</h2>
        <div className="mt-5 space-y-2">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => selectAnswer(opt)}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                answers[current] === opt
                  ? "border-accent-cyan/60 bg-accent-cyan/10 text-white"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="flex items-center gap-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
        >
          <ChevronLeft size={15} /> Previous
        </button>

        {current === total - 1 ? (
          <button
            onClick={submit}
            disabled={submitting || Object.keys(answers).length === 0}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-cyan to-accent-purple px-5 py-2 text-sm font-semibold text-ink-950 disabled:opacity-60"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
            className="flex items-center gap-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300"
          >
            Next <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
