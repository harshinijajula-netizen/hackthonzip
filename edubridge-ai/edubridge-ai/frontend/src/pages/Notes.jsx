import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, UploadCloud, Loader2, Trash2, ChevronRight } from "lucide-react";
import api from "../api/axios.js";
import { getErrorMessage } from "../utils.js";
import ErrorBanner from "../components/ErrorBanner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { PageLoading } from "../components/Loading.jsx";

export default function Notes() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/notes");
      setNotes(data.notes);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    setError("");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await api.post("/notes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNotes((prev) => [data.note, ...prev]);
      navigate(`/notes/${data.note._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">Learn From Your Notes</h1>
      <p className="mt-1 text-sm text-slate-400">Upload a PDF to get a summary, key concepts, MCQs, flashcards — and ask questions about it.</p>

      <ErrorBanner message={error} />

      <label className="glass mt-4 flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-dashed p-10 text-center hover:bg-white/[0.03]">
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} disabled={uploading} />
        {uploading ? (
          <>
            <Loader2 size={26} className="animate-spin text-accent-cyan" />
            <p className="text-sm text-slate-300">Processing your PDF with AI...</p>
          </>
        ) : (
          <>
            <UploadCloud size={26} className="text-accent-cyan" />
            <p className="text-sm text-slate-300">Click to upload a PDF</p>
            <p className="text-xs text-slate-500">Max 15MB · text-based PDFs work best</p>
          </>
        )}
      </label>

      <h3 className="mt-8 font-display text-sm font-semibold text-white">Your Notes</h3>
      {loading ? (
        <PageLoading label="Loading notes..." />
      ) : notes.length === 0 ? (
        <div className="mt-3">
          <EmptyState icon={FileText} title="No learning data yet." subtitle="Upload your first PDF above to get started." />
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {notes.map((n) => (
            <div key={n._id} className="glass flex items-center justify-between rounded-xl px-4 py-3">
              <button onClick={() => navigate(`/notes/${n._id}`)} className="flex flex-1 items-center gap-3 text-left">
                <FileText size={16} className="text-accent-cyan" />
                <div>
                  <p className="text-sm text-white">{n.title}</p>
                  <p className="text-xs text-slate-400">{n.flashcards?.length || 0} flashcards · {n.mcqs?.length || 0} MCQs</p>
                </div>
              </button>
              <div className="flex items-center gap-2">
                <ChevronRight size={16} className="text-slate-500" />
                <button onClick={() => deleteNote(n._id)} className="rounded-lg p-1.5 text-slate-500 hover:text-red-400">
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
