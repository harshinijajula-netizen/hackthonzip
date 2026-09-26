import React, { useEffect, useState } from "react";
import { CalendarClock, Loader2, Trash2, Plus, X } from "lucide-react";
import api from "../api/axios.js";
import { getErrorMessage } from "../utils.js";
import ErrorBanner from "../components/ErrorBanner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { PageLoading } from "../components/Loading.jsx";

export default function StudyPlanner() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ examDate: "", subjectsInput: "", dailyStudyTime: 90 });

  const activePlan = plans.find((p) => p.status === "active");

  const load = async () => {
    try {
      const { data } = await api.get("/study-plans");
      setPlans(data.plans);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const generate = async (e) => {
    e.preventDefault();
    const subjects = form.subjectsInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (!form.examDate || subjects.length === 0) {
      setError("Please provide an exam date and at least one subject.");
      return;
    }
    setError("");
    setGenerating(true);
    try {
      const { data } = await api.post("/ai/generate-plan", {
        examDate: form.examDate,
        subjects,
        dailyStudyTime: form.dailyStudyTime,
      });
      const { data: saved } = await api.post("/study-plans", data);
      setPlans((prev) => [saved.plan, ...prev.map((p) => ({ ...p, status: "archived" }))]);
      setShowForm(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (plan, taskId, completed) => {
    try {
      const { data } = await api.put(`/study-plans/${plan._id}`, { taskId, completed });
      setPlans((prev) => prev.map((p) => (p._id === plan._id ? data.plan : p)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const deletePlan = async (id) => {
    try {
      await api.delete(`/study-plans/${id}`);
      setPlans((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <PageLoading label="Loading study plans..." />;

  const days = activePlan
    ? [...new Set(activePlan.tasks.map((t) => t.day))].sort((a, b) => a - b)
    : [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Personalized Study Planner</h1>
          <p className="mt-1 text-sm text-slate-400">A day-by-day plan built around your exam and weak topics.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple px-4 py-2 text-sm font-semibold text-ink-950"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {activePlan ? "Regenerate Plan" : "Create Plan"}
        </button>
      </div>

      <ErrorBanner message={error} />

      {showForm && (
        <form onSubmit={generate} className="glass mt-4 grid gap-4 rounded-2xl p-6 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Exam Date</label>
            <input
              type="date"
              value={form.examDate}
              onChange={(e) => setForm({ ...form, examDate: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Subjects (comma separated)</label>
            <input
              value={form.subjectsInput}
              onChange={(e) => setForm({ ...form, subjectsInput: e.target.value })}
              placeholder="DBMS, OS, CN"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Daily Study Time (min)</label>
            <input
              type="number"
              min="15"
              value={form.dailyStudyTime}
              onChange={(e) => setForm({ ...form, dailyStudyTime: Number(e.target.value) })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={generating}
            className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-60 sm:col-span-3"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <CalendarClock size={16} />}
            {generating ? "Generating plan..." : "Generate with AI"}
          </button>
        </form>
      )}

      {!activePlan ? (
        <div className="mt-6">
          <EmptyState
            icon={CalendarClock}
            title="No study plan yet."
            subtitle="Create a personalized study plan and EduBridge AI will build a day-by-day schedule for you."
            actionLabel="Create Your Study Plan"
            onAction={() => setShowForm(true)}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Exam: {new Date(activePlan.examDate).toLocaleDateString()} · {activePlan.dailyStudyTime} min/day
            </p>
            <button onClick={() => deletePlan(activePlan._id)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400">
              <Trash2 size={13} /> Delete plan
            </button>
          </div>

          {days.map((day) => (
            <div key={day} className="glass rounded-2xl p-5">
              <h3 className="font-display text-sm font-semibold text-white">Day {day}</h3>
              <div className="mt-3 space-y-2">
                {activePlan.tasks
                  .filter((t) => t.day === day)
                  .map((t) => (
                    <label
                      key={t._id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
                    >
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={(e) => toggleTask(activePlan, t._id, e.target.checked)}
                        className="h-4 w-4 rounded accent-accent-cyan"
                      />
                      <span className={`flex-1 text-sm ${t.completed ? "text-slate-500 line-through" : "text-slate-200"}`}>
                        {t.subject} — {t.topic}
                      </span>
                      <span className="text-xs text-slate-500">{t.durationMinutes} min</span>
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
