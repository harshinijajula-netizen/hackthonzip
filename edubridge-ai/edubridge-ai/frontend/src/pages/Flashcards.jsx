import React, { useEffect, useState } from "react";
import { Layers, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import api from "../api/axios.js";
import { getErrorMessage } from "../utils.js";
import ErrorBanner from "../components/ErrorBanner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { PageLoading } from "../components/Loading.jsx";

export default function Flashcards() {
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/notes");
        const withCards = data.notes.filter((n) => n.flashcards?.length);
        setNotes(withCards);
        if (withCards.length) setSelectedNoteId(withCards[0]._id);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const note = notes.find((n) => n._id === selectedNoteId);
  const card = note?.flashcards?.[index];

  const markMastered = async () => {
    if (!card) return;
    try {
      const { data } = await api.put(`/notes/${note._id}/flashcard/${card._id}`, { mastered: !card.mastered });
      setNotes((prev) => prev.map((n) => (n._id === note._id ? data.note : n)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <PageLoading label="Loading flashcards..." />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">AI Flashcards</h1>
      <p className="mt-1 text-sm text-slate-400">Generated from your uploaded notes.</p>

      <ErrorBanner message={error} />

      {notes.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Layers}
            title="No flashcards yet."
            subtitle="Upload notes on the Notes page — flashcards are generated automatically."
          />
        </div>
      ) : (
        <div className="mx-auto mt-6 max-w-lg">
          <select
            value={selectedNoteId}
            onChange={(e) => {
              setSelectedNoteId(e.target.value);
              setIndex(0);
              setFlipped(false);
            }}
            className="mb-5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none"
          >
            {notes.map((n) => (
              <option key={n._id} value={n._id} className="bg-ink-900">{n.title}</option>
            ))}
          </select>

          <button
            onClick={() => setFlipped((f) => !f)}
            className="glass flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl p-8 text-center"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">{flipped ? "Answer" : "Question"}</p>
            <p className="mt-4 text-lg text-white">{flipped ? card?.back : card?.front}</p>
            <p className="mt-6 text-xs text-slate-500">Tap to flip</p>
          </button>

          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={() => {
                setIndex((i) => Math.max(0, i - 1));
                setFlipped(false);
              }}
              disabled={index === 0}
              className="flex items-center gap-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft size={15} /> Previous
            </button>

            <span className="text-xs text-slate-500">
              {index + 1} / {note.flashcards.length}
            </span>

            <button
              onClick={() => {
                setIndex((i) => Math.min(note.flashcards.length - 1, i + 1));
                setFlipped(false);
              }}
              disabled={index === note.flashcards.length - 1}
              className="flex items-center gap-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>

          <button
            onClick={markMastered}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
              card?.mastered ? "bg-emerald-500/15 text-emerald-300" : "border border-white/10 text-slate-300 hover:bg-white/5"
            }`}
          >
            <CheckCircle2 size={15} />
            {card?.mastered ? "Mastered" : "Mark as Mastered"}
          </button>
        </div>
      )}
    </div>
  );
}
