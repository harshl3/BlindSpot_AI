import React, { useState } from "react";
import {
  Compass,
  History,
  LogIn,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  LayoutGrid,
  FlaskConical,
  RotateCcw
} from "lucide-react";
import type { User } from "firebase/auth";
import { useTheme } from "../context/useTheme";

export type NavPage = "overview" | "workspace" | "lab";

interface NavbarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  currentUser: User | null;
  historyCount: number;
  onOpenHistory: () => void;
  onNewDecision: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  isAnalyzing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  historyCount,
  onOpenHistory,
  onNewDecision,
  onSignIn,
  onSignOut,
  isAnalyzing
}) => {
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate("overview")}
            className="flex items-center gap-2.5 text-left group focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-lg p-1 cursor-pointer"
            title="BlindSpot Home"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-5 h-5 text-indigo-100 group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-stone-900 dark:text-white text-lg tracking-tight font-heading">
                  BlindSpot
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium -mt-0.5 hidden sm:block">
                See what you're not seeing.
              </p>
            </div>
          </button>

          {/* Primary Page Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-100/80 dark:bg-stone-800/80 p-1 rounded-xl border border-stone-200/60 dark:border-stone-700/60" aria-label="Page navigation">
            <button
              onClick={() => onNavigate("overview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentPage === "overview"
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs"
                  : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => onNavigate("workspace")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPage === "workspace"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Decision Studio</span>
            </button>

            <button
              onClick={() => onNavigate("lab")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPage === "lab"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-xs"
                  : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Thinking Lab</span>
            </button>
          </nav>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Mobile view quick switcher */}
          <div className="flex md:hidden items-center gap-1 mr-1">
            <button
              onClick={() => onNavigate("workspace")}
              className={`p-2 rounded-lg text-xs font-bold ${
                currentPage === "workspace"
                  ? "bg-indigo-600 text-white"
                  : "text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800"
              }`}
              title="Studio"
            >
              Studio
            </button>
            <button
              onClick={() => onNavigate("lab")}
              className={`p-2 rounded-lg text-xs font-bold ${
                currentPage === "lab"
                  ? "bg-amber-500 text-stone-950"
                  : "text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800"
              }`}
              title="Thinking Lab"
            >
              Lab
            </button>
          </div>

          {/* New Decision Button */}
          <button
            onClick={onNewDecision}
            disabled={isAnalyzing}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            title="Start new decision"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
            <span>Reset</span>
          </button>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer relative"
            title="Decision History"
          >
            <History className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold text-white bg-indigo-600 rounded-full">
                {historyCount}
              </span>
            )}
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100/90 dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-bold hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer shadow-xs"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle light or dark theme"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* Authentication State */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-1 pl-2 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                aria-expanded={showUserMenu}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || "User avatar"}
                    className="w-7 h-7 rounded-full ring-2 ring-indigo-500/40"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                    {(currentUser.displayName || currentUser.email || "U")[0].toUpperCase()}
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 py-1.5 z-50 animate-in fade-in">
                  <div className="px-3.5 py-2 border-b border-stone-100 dark:border-stone-700">
                    <p className="text-xs font-semibold text-stone-900 dark:text-white truncate">
                      {currentUser.displayName || "Google Account"}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenHistory();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700/60 flex items-center gap-2"
                  >
                    <History className="w-3.5 h-3.5 text-stone-400" />
                    My Decision Records
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onSignOut();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/70 dark:border-indigo-800 rounded-lg transition-colors cursor-pointer"
              title="Sign in with Google"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Google Sign-In</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
