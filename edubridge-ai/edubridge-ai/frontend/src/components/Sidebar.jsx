import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquareText,
  BrainCircuit,
  CalendarClock,
  FileText,
  Layers,
  LineChart,
  UserCircle,
  Settings,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tutor", label: "AI Tutor", icon: MessageSquareText },
  { to: "/quiz", label: "Smart Quiz", icon: BrainCircuit },
  { to: "/planner", label: "Study Planner", icon: CalendarClock },
  { to: "/notes", label: "My Notes", icon: FileText },
  { to: "/flashcards", label: "Flashcards", icon: Layers },
  { to: "/progress", label: "My Progress", icon: LineChart },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
          isActive
            ? "bg-white/10 text-white shadow-glow"
            : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
        }`
      }
    >
      <Icon size={18} strokeWidth={1.8} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-white/5 bg-ink-900/60 px-4 py-6">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple">
            <GraduationCap size={20} className="text-ink-950" />
          </div>
          <span className="font-display text-lg font-semibold text-white">EduBridge AI</span>
        </div>

        <nav className="flex-1 space-y-1">
          {items.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        <div className="mt-4 space-y-1 border-t border-white/5 pt-4">
          <NavItem to="/settings" label="Settings" icon={Settings} />
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-red-400"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-white/10 bg-ink-900/95 px-1 py-2 backdrop-blur lg:hidden">
        {items.slice(0, 5).map(({ to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] ${
                isActive ? "text-accent-cyan" : "text-slate-500"
              }`
            }
          >
            <Icon size={20} strokeWidth={1.8} />
          </NavLink>
        ))}
      </nav>
    </>
  );
}
