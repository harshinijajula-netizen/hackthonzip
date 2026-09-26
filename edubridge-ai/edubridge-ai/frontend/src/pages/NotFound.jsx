import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 text-center text-slate-300">
      <h1 className="font-display text-3xl font-bold text-white">404</h1>
      <p className="mt-2 text-sm text-slate-400">This page doesn't exist.</p>
      <Link to="/" className="mt-6 text-accent-cyan hover:underline">Back to home</Link>
    </div>
  );
}
