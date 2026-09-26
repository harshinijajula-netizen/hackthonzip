import React from "react";

export default function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div className="glass flex flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
          <Icon size={22} className="text-accent-cyan" strokeWidth={1.8} />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      {subtitle && <p className="max-w-sm text-sm text-slate-400">{subtitle}</p>}
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-2 rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple px-5 py-2 text-sm font-medium text-ink-950 transition-opacity hover:opacity-90"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
