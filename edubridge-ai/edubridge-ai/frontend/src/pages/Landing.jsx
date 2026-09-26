import React from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Sparkles,
  Target,
  BrainCircuit,
  CalendarClock,
  AlertTriangle,
  LineChart,
  ArrowRight,
} from "lucide-react";

const why = [
  { icon: Target, title: "Personalized learning", text: "Every path adapts to how you actually learn, not a generic syllabus." },
  { icon: Sparkles, title: "AI-powered explanations", text: "Ask anything and get a patient, step-by-step explanation." },
  { icon: BrainCircuit, title: "Adaptive quizzes", text: "Questions get harder or gentler based on your real performance." },
  { icon: CalendarClock, title: "Smart study plans", text: "A day-by-day plan built around your exam date and weak spots." },
  { icon: AlertTriangle, title: "Weak-topic detection", text: "We quietly track where you're struggling before it costs you marks." },
  { icon: LineChart, title: "Learning analytics", text: "Real charts from real quiz data — no vanity numbers." },
];

const steps = ["Assess", "Learn", "Practice", "Analyze", "Adapt", "Improve"];

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink-950 text-slate-200">
      {/* subtle background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-accent-cyan/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full bg-accent-purple/10 blur-[120px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple">
            <GraduationCap size={20} className="text-ink-950" />
          </div>
          <span className="font-display text-lg font-semibold text-white">EduBridge AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-slate-300 hover:text-white">Log in</Link>
          <Link
            to="/register"
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-16 text-center sm:pt-24">
        <p className="mb-5 font-display text-sm tracking-wide text-accent-cyan/90">
          Learn your way. Improve your way.
        </p>
        <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
          Your Personal AI Learning Companion
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-slate-400 sm:text-lg">
          Understand concepts, discover your weak areas, practice smarter, and build a
          personalized learning path with AI.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/register"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple px-7 py-3 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90"
          >
            Get Started <ArrowRight size={16} />
          </Link>
          <a
            href="#features"
            className="rounded-full border border-white/15 px-7 py-3 text-sm font-medium text-slate-200 hover:bg-white/5"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* Why EduBridge */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">Why EduBridge?</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {why.map(({ icon: Icon, title, text }) => (
            <div key={title} className="glass rounded-2xl p-6 transition-transform hover:-translate-y-1">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                <Icon size={20} className="text-accent-cyan" strokeWidth={1.8} />
              </div>
              <h3 className="font-display text-base font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">How It Works</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {steps.map((step, i) => (
            <div key={step} className="glass flex flex-col items-center gap-2 rounded-2xl py-6 text-center">
              <span className="font-display text-xl font-bold text-accent-cyan">{i + 1}</span>
              <span className="text-sm text-slate-300">{step}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
          Start your personalized learning journey.
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          Every student learns differently. EduBridge AI adapts to the learner.
        </p>
        <Link
          to="/register"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple px-7 py-3 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90"
        >
          Get Started <ArrowRight size={16} />
        </Link>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-slate-500">
        EduBridge AI — Your personal AI learning companion.
      </footer>
    </div>
  );
}
