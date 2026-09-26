import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrainCircuit, Loader2, Trash2, ArrowRight } from "lucide-react";
import api from "../api/axios.js";
import { getErrorMessage } from "../utils.js";
import ErrorBanner from "../components/ErrorBanner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { PageLoading } from "../components/Loading.jsx";

export default function SmartQuiz() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: "",
    topic: "",
    numQuestions: 5,
    difficulty: "Medium",
    questionType: "MCQ",
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = async () => {
    try {
      const { data } = await api.get("/quizzes");
      setHistory(data.quizzes);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.topic) {
      setError("Please enter both subject and topic.");
      return;
    }
    setError("");
    setGenerating(true);
    try {
      const { data } = await api.post("/ai/generate-quiz", form);
      const { data: saved } = await api.post("/quizzes", data);
      navigate(`/quiz/attempt/${saved.quiz._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const deleteQuiz = async (id) => {
    try {
      await api.delete(`/quizzes/${id}`);
      setHistory((h) => h.filter((q) => q._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">Smart Quiz</h1>
      <p className="mt-1 text-sm text-slate-400">AI-generated quizzes tailored to what you want to practice.</p>

      <ErrorBanner message={error} />

      <form onSubmit={handleGenerate} className="glass mt-4 grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-slate-400">Subject</label>
          <input
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="DBMS"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-accent-cyan/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Topic</label>
          <input
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            placeholder="Normalization"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-accent-cyan/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Number of Questions</label>
          <input
            type="number"
            min="1"
            max="20"
            value={form.numQuestions}
            onChange={(e) => setForm({ ...form, numQuestions: Number(e.target.value) })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-accent-cyan/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Difficulty</label>
          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-accent-cyan/50"
          >
            {["Easy", "Medium", "Hard"].map((v) => (
              <option key={v} value={v} className="bg-ink-900">{v}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-slate-400">Question Type</label>
          <select
            value={form.questionType}
            onChange={(e) => setForm({ ...form, questionType: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-accent-cyan/50"
          >
            {["MCQ", "True/False", "Scenario-based"].map((v) => (
              <option key={v} value={v} className="bg-ink-900">{v}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={generating}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple px-6 py-2.5 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-60 sm:col-span-2"
        >
          {generating ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
          {generating ? "Generating quiz..." : "Generate Quiz"}
        </button>
      </form>

      <h3 className="mt-8 font-display text-sm font-semibold text-white">Quiz History</h3>
      {loadingHistory ? (
        <PageLoading label="Loading history..." />
      ) : history.length === 0 ? (
        <div className="mt-3">
          <EmptyState icon={BrainCircuit} title="No quizzes yet." subtitle="Generate your first quiz above to get started." />
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {history.map((q) => (
            <div key={q._id} className="glass flex items-center justify-between rounded-xl px-4 py-3">
              <div>
                <p className="text-sm text-white">{q.subject} — {q.topic}</p>
                <p className="text-xs text-slate-400">
                  {q.difficulty} · {q.questions.length} questions ·{" "}
                  {q.status === "completed" ? `${q.percentage}% score` : "Not attempted"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {q.status === "completed" ? (
                  <button
                    onClick={() => navigate(`/quiz/result/${q._id}`)}
                    className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5"
                  >
                    View Result <ArrowRight size={12} />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/quiz/attempt/${q._id}`)}
                    className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5"
                  >
                    Attempt <ArrowRight size={12} />
                  </button>
                )}
                <button onClick={() => deleteQuiz(q._id)} className="rounded-lg p-1.5 text-slate-500 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
