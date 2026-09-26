import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Send, Loader2 } from "lucide-react";
import api from "../api/axios.js";
import { getErrorMessage } from "../utils.js";
import ErrorBanner from "../components/ErrorBanner.jsx";
import { PageLoading } from "../components/Loading.jsx";

const tabs = ["Summary", "Key Concepts", "MCQs", "Ask AI"];

export default function NoteDetail() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [tab, setTab] = useState("Summary");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [qaHistory, setQaHistory] = useState([]);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/notes/${id}`);
        setNote(data.note);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const ask = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    const q = question.trim();
    setQuestion("");
    setQaHistory((prev) => [...prev, { role: "user", content: q }]);
    setAsking(true);
    try {
      const { data } = await api.post(`/notes/${id}/ask`, { question: q });
      setQaHistory((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAsking(false);
    }
  };

  if (loading) return <PageLoading label="Loading note..." />;
  if (!note) return <ErrorBanner message={error || "Note not found."} />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">{note.title}</h1>
      <ErrorBanner message={error} />

      <div className="mt-4 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium ${
              tab === t ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="glass mt-4 rounded-2xl p-6">
        {tab === "Summary" && (
          <div>
            <p className="text-sm leading-relaxed text-slate-300">{note.summary}</p>
            <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">Important Questions</h4>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-400">
              {note.importantQuestions?.map((q, i) => <li key={i}>{q}</li>)}
            </ul>
          </div>
        )}

        {tab === "Key Concepts" && (
          <ul className="grid gap-2 sm:grid-cols-2">
            {note.keyConcepts?.map((c, i) => (
              <li key={i} className="rounded-xl bg-white/5 px-4 py-2.5 text-sm text-slate-300">{c}</li>
            ))}
          </ul>
        )}

        {tab === "MCQs" && (
          <div className="space-y-4">
            {note.mcqs?.map((m, i) => (
              <div key={i} className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-white">{i + 1}. {m.question}</p>
                <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {m.options.map((o) => (
                    <span
                      key={o}
                      className={`rounded-lg px-3 py-1.5 text-xs ${
                        o === m.correctAnswer ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-slate-400"
                      }`}
                    >
                      {o}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Ask AI" && (
          <div>
            <div className="max-h-80 space-y-3 overflow-y-auto scrollbar-thin">
              {qaHistory.length === 0 && (
                <p className="text-sm text-slate-500">Ask a question and I'll answer using your uploaded notes.</p>
              )}
              {qaHistory.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-4 py-2.5 text-sm ${
                      m.role === "user" ? "bg-accent-cyan/20 text-white" : "bg-white/5 text-slate-300"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {asking && <Loader2 size={14} className="animate-spin text-slate-400" />}
            </div>
            <form onSubmit={ask} className="mt-4 flex gap-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about this note..."
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none"
              />
              <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-ink-950">
                <Send size={15} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
