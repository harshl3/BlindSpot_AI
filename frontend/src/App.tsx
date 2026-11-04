import { useState, useEffect } from "react";
import { Navbar, type NavPage } from "./components/Navbar";
import { HeroLanding } from "./components/HeroLanding";
import { DecisionWorkspace, SAMPLE_DECISION } from "./components/DecisionWorkspace";
import { AnalysisReport } from "./components/AnalysisReport";
import { ThinkingLabPage } from "./components/ThinkingLabPage";
import { ChallengeThinkingModal } from "./components/ChallengeThinkingModal";
import { PremortemModal } from "./components/PremortemModal";
import { ReflectionSection } from "./components/ReflectionSection";
import { DecisionHistoryModal } from "./components/DecisionHistoryModal";
import { ThemeProvider } from "./context/ThemeContext";
import {
  signInWithGoogle,
  signOut,
  onAuthChange,
  saveDecisionRecord,
  loadDecisionRecords,
  deleteDecisionRecord
} from "./services/firebase";
import {
  analyzeDecision,
  challengeThinking,
  runPremortem
} from "./services/api";
import type { User } from "firebase/auth";
import type {
  DecisionInput,
  BlindSpotAnalysis,
  ChallengeResponse,
  PremortemResponse,
  UserReflection,
  SavedDecisionRecord
} from "./types/decision";
import { AlertCircle, Compass, CheckCircle2, Save, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

export function AppContent() {
  // Navigation / Page state
  const [currentPage, setCurrentPage] = useState<NavPage>("overview");
  const [workspaceMode, setWorkspaceMode] = useState<"form" | "report">("form");

  // Decision & Analysis states
  const [currentInput, setCurrentInput] = useState<DecisionInput | null>(null);
  const [analysis, setAnalysis] = useState<BlindSpotAnalysis | null>(null);
  const [challengeResult, setChallengeResult] = useState<ChallengeResponse | null>(null);
  const [premortemResult, setPremortemResult] = useState<PremortemResponse | null>(null);
  const [reflection, setReflection] = useState<UserReflection | null>(null);

  // Loading & Async states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChallenging, setIsChallenging] = useState(false);
  const [isPremortemLoading, setIsPremortemLoading] = useState(false);
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [isPremortemOpen, setIsPremortemOpen] = useState(false);

  // Auth & Storage states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [savedRecords, setSavedRecords] = useState<SavedDecisionRecord[]>([]);
  const [historySource, setHistorySource] = useState<"mongodb" | "local">("local");

  // Subscribe to Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Load decision records on user change or mount
  useEffect(() => {
    async function fetchHistory() {
      try {
        const { records, source } = await loadDecisionRecords(currentUser);
        setSavedRecords(records);
        setHistorySource(source);
      } catch (e) {
        console.error("Failed to load records:", e);
      }
    }
    fetchHistory();
  }, [currentUser]);

  // Handle Form Submit: Analyze Decision
  const handleAnalyze = async (input: DecisionInput) => {
    setIsAnalyzing(true);
    setError(null);
    setCurrentInput(input);
    setChallengeResult(null);
    setPremortemResult(null);
    setReflection(null);

    try {
      const result = await analyzeDecision(input);
      setAnalysis(result);
      setWorkspaceMode("report");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      console.error("Analysis error:", err);
      const msg = err instanceof Error ? err.message : "Failed to analyze decision. Please check server connection.";
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Launch Devil's Advocate Challenge
  const handleOpenChallenge = async () => {
    if (!currentInput || !analysis) return;
    setIsChallengeOpen(true);

    if (challengeResult) return;

    setIsChallenging(true);
    try {
      const res = await challengeThinking({
        decision: currentInput.decision,
        context: currentInput.context,
        options: currentInput.options,
        currentThinking: currentInput.currentThinking,
        analysisSummary: analysis.decisionSummary
      });
      setChallengeResult(res);
    } catch (err: unknown) {
      console.error("Challenge error:", err);
      const msg = err instanceof Error ? err.message : "Could not generate challenge argument.";
      setError(msg);
    } finally {
      setIsChallenging(false);
    }
  };

  // Run Pre-Mortem Scenario
  const handleExecutePremortem = async (chosenOption: string, timeHorizon: string) => {
    if (!currentInput) return;
    setIsPremortemLoading(true);
    try {
      const res = await runPremortem({
        decision: currentInput.decision,
        context: currentInput.context,
        chosenOption,
        timeHorizon
      });
      setPremortemResult(res);
    } catch (err: unknown) {
      console.error("Pre-mortem error:", err);
      const msg = err instanceof Error ? err.message : "Could not generate pre-mortem scenario.";
      setError(msg);
    } finally {
      setIsPremortemLoading(false);
    }
  };

  // Save Reflection & Sync Record
  const handleSaveReflection = async (ref: UserReflection) => {
    if (!currentInput || !analysis) return;
    setIsSavingReflection(true);
    setReflection(ref);

    try {
      const result = await saveDecisionRecord(
        {
          input: currentInput,
          analysis,
          challengeResult: challengeResult || null,
          premortemResult: premortemResult || null,
          reflection: ref
        },
        currentUser
      );

      const { records, source } = await loadDecisionRecords(currentUser);
      setSavedRecords(records);
      setHistorySource(source);
      return result;
    } catch (err: unknown) {
      console.error("Save error:", err);
      throw err;
    } finally {
      setIsSavingReflection(false);
    }
  };

  // Quick 1-click save handler for header and floating bar buttons
  const [quickSaved, setQuickSaved] = useState(false);

  const handleQuickSave = async () => {
    if (!currentInput || !analysis || isSavingReflection) return;
    try {
      const defaultReflection: UserReflection = reflection || {
        state: "thinking_strengthened",
        notes: "",
        savedAt: new Date().toISOString(),
        checkedAspects: ["assumptions", "blindspots", "risks", "perspectives"]
      };
      await handleSaveReflection(defaultReflection);
      setQuickSaved(true);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#10b981", "#6366f1", "#f59e0b"]
        });
      } catch {
        // Ignored
      }

      setTimeout(() => setQuickSaved(false), 5000);
    } catch (e) {
      console.error("Quick save failed:", e);
    }
  };

  // Load selected historical record
  const handleSelectRecord = (record: SavedDecisionRecord) => {
    setCurrentInput(record.input);
    setAnalysis(record.analysis);
    setChallengeResult(record.challengeResult || null);
    setPremortemResult(record.premortemResult || null);
    setReflection(record.reflection || null);
    setCurrentPage("workspace");
    setWorkspaceMode("report");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete historical record
  const handleDeleteRecord = async (id: string) => {
    await deleteDecisionRecord(id, currentUser);
    setSavedRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Handle Google Auth
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      console.error("Sign in failed:", err);
      setError("Google Sign-In canceled or unavailable.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  const handleNewDecision = () => {
    setCurrentInput(null);
    setAnalysis(null);
    setChallengeResult(null);
    setPremortemResult(null);
    setReflection(null);
    setError(null);
    setCurrentPage("workspace");
    setWorkspaceMode("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50/70 via-slate-50 to-purple-50/60 dark:from-zinc-950 dark:via-stone-950 dark:to-neutral-950 text-stone-900 dark:text-stone-100 transition-colors relative">

      {/* Ambient Radial Gradient Glow Orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-80 h-80 bg-amber-300/20 dark:bg-amber-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Skip to Main Content Link for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white text-xs font-semibold"
      >
        Skip to main content
      </a>

      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        currentUser={currentUser}
        historyCount={savedRecords.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewDecision={handleNewDecision}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isAnalyzing={isAnalyzing}
      />

      {/* Global Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/60 border-b border-red-200 dark:border-red-800 px-4 py-3" role="alert">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-xs sm:text-sm text-red-800 dark:text-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 font-bold hover:underline text-xs ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Page Rendering */}
      <main id="main-content" className="flex-1">

        {/* PAGE 1: Overview Landing Page */}
        {currentPage === "overview" && (
          <HeroLanding
            onExploreDecision={() => {
              setCurrentPage("workspace");
              setWorkspaceMode("form");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onTryExample={() => {
              setCurrentInput(SAMPLE_DECISION);
              setCurrentPage("workspace");
              setWorkspaceMode("form");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onGoToLab={() => {
              setCurrentPage("lab");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {/* PAGE 2: Decision Studio (Workspace Form & Analysis Report) */}
        {currentPage === "workspace" && (
          <>
            {workspaceMode === "form" ? (
              <DecisionWorkspace
                onSubmit={handleAnalyze}
                isLoading={isAnalyzing}
                initialValues={currentInput || undefined}
              />
            ) : (
              analysis && currentInput && (
                <div className="pb-16 space-y-8">
                  {/* Back to Edit button */}
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 flex items-center justify-between">
                    <button
                      onClick={() => setWorkspaceMode("form")}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      ← Edit Decision Inputs
                    </button>
                    <button
                      onClick={handleNewDecision}
                      className="text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
                    >
                      Start Fresh Decision
                    </button>
                  </div>

                  <AnalysisReport
                    analysis={analysis}
                    decisionInput={currentInput}
                    onOpenChallenge={handleOpenChallenge}
                    onOpenPremortem={() => setIsPremortemOpen(true)}
                    onQuickSave={handleQuickSave}
                    isQuickSaved={quickSaved}
                    isSaving={isSavingReflection}
                  />

                  <ReflectionSection
                    onSaveReflection={handleSaveReflection}
                    isSaving={isSavingReflection}
                    initialReflection={reflection || undefined}
                  />
                </div>
              )
            )}
          </>
        )}

        {/* PAGE 3: Thinking Lab (Sandbox) */}
        {currentPage === "lab" && (
          <ThinkingLabPage />
        )}

      </main>

      {/* Floating Quick Action Bar when viewing Decision Report */}
      {currentPage === "workspace" && workspaceMode === "report" && (
        <aside aria-label="Quick Actions Bar" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-md w-11/12 animate-in slide-in-from-bottom-5 duration-300">
          <div className="glass-panel rounded-2xl p-2.5 sm:px-4 sm:py-2.5 border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${quickSaved ? "bg-emerald-500" : "bg-emerald-500 animate-pulse"}`} />
              <span className="text-xs font-bold text-stone-900 dark:text-white truncate">
                {quickSaved ? "Decision saved to your history!" : "Save this analysis to your account?"}
              </span>
            </div>
            <button
              onClick={handleQuickSave}
              disabled={isSavingReflection}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-stone-950 font-black text-xs shadow-md transition-transform hover:scale-105 cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isSavingReflection ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-950" />
                  <span>Saving...</span>
                </>
              ) : quickSaved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-stone-950" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 fill-stone-950" />
                  <span>Save Decision</span>
                </>
              )}
            </button>
          </div>
        </aside>
      )}

      {/* Screen D: Challenge My Thinking Modal */}
      <ChallengeThinkingModal
        isOpen={isChallengeOpen}
        onClose={() => setIsChallengeOpen(false)}
        isLoading={isChallenging}
        challengeResult={challengeResult}
        onRetry={handleOpenChallenge}
      />

      {/* Screen E: Pre-Mortem Scenario Modal */}
      <PremortemModal
        isOpen={isPremortemOpen}
        onClose={() => setIsPremortemOpen(false)}
        options={currentInput?.options || []}
        isLoading={isPremortemLoading}
        premortemResult={premortemResult}
        onExecutePremortem={handleExecutePremortem}
      />

      {/* Decision History Drawer */}
      <DecisionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={savedRecords}
        onSelectRecord={handleSelectRecord}
        onDeleteRecord={handleDeleteRecord}
        source={historySource}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 py-8 px-4 sm:px-6 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-stone-800 dark:text-white">BlindSpot</span>
            <span>—</span>
            <span>See what you're not seeing.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <span>An AI Thinking Companion for Clearer Decisions</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
