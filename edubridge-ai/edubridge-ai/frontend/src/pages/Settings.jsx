import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem("edubridge_theme") || "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("edubridge_theme", theme);
  }, [theme]);

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-semibold text-white">Settings</h1>
      <p className="mt-1 text-sm text-slate-400">Personalize how EduBridge AI looks.</p>

      <div className="glass mt-6 flex items-center justify-between rounded-2xl p-5">
        <div>
          <p className="text-sm font-medium text-white">Appearance</p>
          <p className="text-xs text-slate-400">Switch between dark and light mode.</p>
        </div>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
        >
          {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
          {theme === "dark" ? "Dark" : "Light"}
        </button>
      </div>
    </div>
  );
}
