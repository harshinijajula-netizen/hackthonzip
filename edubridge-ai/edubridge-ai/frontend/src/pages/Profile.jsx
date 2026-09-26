import React, { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../utils.js";
import ErrorBanner from "../components/ErrorBanner.jsx";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    learningLevel: user?.learningLevel || "Beginner",
    preferredLanguage: user?.preferredLanguage || "English",
    dailyStudyTime: user?.dailyStudyTime || 60,
    examDate: user?.examDate ? user.examDate.slice(0, 10) : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setLoading(true);
    try {
      const { data } = await api.put("/users/profile", form);
      updateUser(data.user);
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-semibold text-white">Profile</h1>
      <p className="mt-1 text-sm text-slate-400">Update your learning preferences.</p>

      <ErrorBanner message={error} />
      {saved && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 size={16} /> Profile updated.
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass mt-4 space-y-4 rounded-2xl p-6">
        <div>
          <label className="mb-1 block text-xs text-slate-400">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-accent-cyan/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Email</label>
          <input
            value={user?.email}
            disabled
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Learning Level</label>
            <select
              value={form.learningLevel}
              onChange={(e) => setForm({ ...form, learningLevel: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-accent-cyan/50"
            >
              {["Beginner", "Intermediate", "Advanced"].map((v) => (
                <option key={v} value={v} className="bg-ink-900">{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Preferred Language</label>
            <select
              value={form.preferredLanguage}
              onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-accent-cyan/50"
            >
              {["English", "Telugu", "Hindi"].map((v) => (
                <option key={v} value={v} className="bg-ink-900">{v}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Daily Study Time (minutes)</label>
            <input
              type="number"
              min="10"
              value={form.dailyStudyTime}
              onChange={(e) => setForm({ ...form, dailyStudyTime: Number(e.target.value) })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-accent-cyan/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Exam Date</label>
            <input
              type="date"
              value={form.examDate}
              onChange={(e) => setForm({ ...form, examDate: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-accent-cyan/50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple px-6 py-2.5 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Save Changes
        </button>
      </form>
    </div>
  );
}
