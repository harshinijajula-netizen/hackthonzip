import React, { useEffect, useRef, useState } from "react";
import { Send, Trash2, Sparkles, Loader2 } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../utils.js";
import ErrorBanner from "../components/ErrorBanner.jsx";
import { PageLoading } from "../components/Loading.jsx";

export default function AITutor() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [level, setLevel] = useState(user?.learningLevel || "Beginner");
  const [language, setLanguage] = useState(user?.preferredLanguage || "English");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/ai/chat/history");
        setMessages(data.history);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoadingHistory(false);
      }
    })();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const question = input.trim();
    setInput("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", content: question, _id: `tmp-${Date.now()}` }]);
    setSending(true);
    try {
      const { data } = await api.post("/ai/chat", { message: question, level, language });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, _id: `tmp-r-${Date.now()}` }]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const clearHistory = async () => {
    try {
      await api.delete("/ai/chat/history");
      setMessages([]);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loadingHistory) return <PageLoading label="Loading conversation..." />;

  return (
    <div className="flex h-[calc(100vh-3rem)] max-h-[850px] flex-col lg:h-[calc(100vh-5rem)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">EduBridge AI Tutor</h1>
          <p className="mt-1 text-sm text-slate-400">Ask anything. Get a patient, step-by-step explanation.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none"
          >
            {["Beginner", "Intermediate", "Advanced"].map((v) => (
              <option key={v} value={v} className="bg-ink-900">{v}</option>
            ))}
          </select>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none"
          >
            {["English", "Telugu", "Hindi"].map((v) => (
              <option key={v} value={v} className="bg-ink-900">{v}</option>
            ))}
          </select>
          <button
            onClick={clearHistory}
            title="Clear conversation"
            className="rounded-lg border border-white/10 p-2 text-slate-400 hover:text-red-400"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <ErrorBanner message={error} />

      <div className="glass mt-4 flex-1 overflow-y-auto rounded-2xl p-5 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
              <Sparkles size={22} className="text-accent-cyan" />
            </div>
            <p className="text-sm text-slate-400">
              Try: "Explain normalization with an example" or "Give me an example of polymorphism."
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m._id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-accent-cyan to-accent-purple text-ink-950"
                      : "bg-white/5 text-slate-200"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-400">
                  <Loader2 size={14} className="animate-spin" /> Thinking...
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="mt-4 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Explain recursion simply..."
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent-cyan/50"
        />
        <button
          type="submit"
          disabled={sending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-ink-950 disabled:opacity-60"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
}
