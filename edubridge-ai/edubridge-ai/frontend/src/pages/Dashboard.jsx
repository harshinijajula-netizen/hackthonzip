import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  MessageSquareText,
  BrainCircuit,
  CalendarClock,
  FileUp,
  LineChart,
  Flame,
  Target,
  Award,
} from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { PageLoading, Skeleton } from "../components/Loading.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import { getErrorMessage } from "../utils.js";

const quickActions = [
  { to: "/tutor", label: "Ask AI Tutor", icon: MessageSquareText },
  { to: "/quiz", label: "Generate Quiz", icon: BrainCircuit },
  { to: "/planner", label: "Create Study Plan", icon: CalendarClock },
  { to: "/notes", label: "Upload Notes", icon: FileUp },
  { to: "/progress", label: "View Progress", icon: LineChart },
];

function StatCard({ icon: Icon, label, value, suffix = "" }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
        <Icon size={18} className="text-accent-cyan" strokeWidth={1.8} />
      </div>
      <p className="font-display text-2xl font-bold text-white">
        {value}
        {suffix}
      </p>
      <p className="mt-0.5 text-xs text-slate-400">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [progressRes, recRes] = await Promise.all([
          api.get("/progress"),
          api.get("/ai/recommendation").catch(() => ({ data: { recommendation: "" } })),
        ]);
        setProgress(progressRes.data);
        setRecommendation(recRes.data.recommendation);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <PageLoading label="Loading your dashboard..." />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">
        Welcome back, {user?.name?.split(" ")[0]} 👋
      </h1>
      <p className="mt-1 text-sm text-slate-400">Here's where your learning stands today.</p>

      <ErrorBanner message={error} />

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Target} label="Overall Progress" value={progress?.overallProgress ?? 0} suffix="%" />
        <StatCard icon={BrainCircuit} label="Quiz Accuracy" value={progress?.quizAccuracy ?? 0} suffix="%" />
        <StatCard icon={Award} label="Topics Mastered" value={progress?.topicsMastered ?? 0} />
        <StatCard icon={Flame} label="Study Streak" value={progress?.studyStreak ?? 0} suffix=" days" />
        <StatCard icon={Sparkles} label="Exam Readiness" value={progress?.examReadiness ?? 0} suffix="%" />
      </div>

      {/* AI recommendation */}
      {recommendation && (
        <div className="glass mt-6 flex items-start gap-3 rounded-2xl p-5">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple">
            <Sparkles size={16} className="text-ink-950" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">AI Recommendation</p>
            <p className="mt-1 text-sm text-slate-400">{recommendation}</p>
          </div>
        </div>
      )}

      {/* Weak / Strong topics */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display text-sm font-semibold text-white">Weak Topics</h3>
          {progress?.weakTopics?.length ? (
            <div className="mt-3 space-y-3">
              {progress.weakTopics.map((t) => (
                <div key={t._id}>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{t.topic}</span>
                    <span>{t.accuracy}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-white/5">
                    <div className="h-1.5 rounded-full bg-red-400" style={{ width: `${t.accuracy}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No weak topics yet — keep taking quizzes.</p>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-display text-sm font-semibold text-white">Strong Topics</h3>
          {progress?.strongTopics?.length ? (
            <div className="mt-3 space-y-3">
              {progress.strongTopics.map((t) => (
                <div key={t._id}>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{t.topic}</span>
                    <span>{t.accuracy}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-white/5">
                    <div className="h-1.5 rounded-full bg-accent-cyan" style={{ width: `${t.accuracy}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No strong topics yet — you're just getting started.</p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6">
        <h3 className="font-display text-sm font-semibold text-white">Quick Actions</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {quickActions.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="glass flex flex-col items-center gap-2 rounded-2xl py-5 text-center transition-transform hover:-translate-y-0.5"
            >
              <Icon size={20} className="text-accent-cyan" strokeWidth={1.8} />
              <span className="text-xs text-slate-300">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
