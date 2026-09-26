import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";
import api from "../api/axios.js";
import { getErrorMessage } from "../utils.js";
import ErrorBanner from "../components/ErrorBanner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { PageLoading } from "../components/Loading.jsx";

const tooltipStyle = {
  background: "#141B2E",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  fontSize: 12,
  color: "#e2e8f0",
};

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/progress");
        setData(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <PageLoading label="Loading analytics..." />;

  if (!data || data.completedQuizzes === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">My Progress</h1>
        <ErrorBanner message={error} />
        <div className="mt-4">
          <EmptyState
            icon={LineChartIcon}
            title="No learning data yet."
            subtitle="Complete a quiz to see your analytics come to life here."
          />
        </div>
      </div>
    );
  }

  const quizHistoryChart = [...data.quizHistory].reverse().map((q) => ({
    date: new Date(q.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    percentage: q.percentage,
  }));

  const subjectMap = {};
  data.allTopics.forEach((t) => {
    subjectMap[t.subject] = subjectMap[t.subject] || [];
    subjectMap[t.subject].push(t.accuracy);
  });
  const subjectChart = Object.entries(subjectMap).map(([subject, accs]) => ({
    subject,
    accuracy: Math.round(accs.reduce((a, b) => a + b, 0) / accs.length),
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">My Progress</h1>
      <p className="mt-1 text-sm text-slate-400">Real analytics from your quiz history.</p>
      <ErrorBanner message={error} />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display text-sm font-semibold text-white">Overall Progress</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quizHistoryChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="percentage" stroke="#3ED0C9" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-display text-sm font-semibold text-white">Subject Performance</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="subject" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="accuracy" fill="#8B7EF7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass mt-4 rounded-2xl p-5">
        <h3 className="font-display text-sm font-semibold text-white">Topic Accuracy</h3>
        <div className="mt-4 space-y-3">
          {[...data.allTopics].sort((a, b) => a.accuracy - b.accuracy).map((t) => (
            <div key={t._id}>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{t.topic} <span className="text-slate-600">· {t.masteryLevel}</span></span>
                <span>{t.accuracy}%</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-white/5">
                <div
                  className={`h-1.5 rounded-full ${
                    t.accuracy >= 80 ? "bg-accent-cyan" : t.accuracy >= 60 ? "bg-yellow-400" : "bg-red-400"
                  }`}
                  style={{ width: `${t.accuracy}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass mt-4 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-white">Exam Readiness</h3>
          <span className="font-display text-xl font-bold text-accent-cyan">{data.examReadiness}%</span>
        </div>
        <p className="mt-2 text-sm text-slate-400">{data.examReadinessExplanation}</p>
      </div>

      <div className="glass mt-4 rounded-2xl p-5">
        <h3 className="font-display text-sm font-semibold text-white">Quiz History</h3>
        <div className="mt-3 space-y-1.5">
          {data.quizHistory.map((q) => (
            <div key={q.id} className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{q.subject} — {q.topic}</span>
              <span className="text-slate-500">
                {new Date(q.date).toLocaleDateString()} · {q.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
