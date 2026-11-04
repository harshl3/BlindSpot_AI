import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Save,
  Layers,
  Lock,
  Loader2
} from "lucide-react";
import type { ReflectionState, UserReflection } from "../types/decision";
import type { PersistenceResult } from "../services/firebase";

interface ReflectionSectionProps {
  onSaveReflection: (reflection: UserReflection) => Promise<PersistenceResult | void>;
  isSaving: boolean;
  initialReflection?: UserReflection;
}

const REFLECTION_OPTIONS: { id: ReflectionState; label: string; description: string; icon: string }[] = [
  {
    id: "thinking_changed",
    label: "My thinking changed",
    description: "The analysis exposed blind spots that led me to rethink my direction.",
    icon: "🔄"
  },
  {
    id: "thinking_strengthened",
    label: "My thinking became stronger",
    description: "Seeing counterarguments clarified my reasoning and confirmed priorities.",
    icon: "🛡️"
  },
  {
    id: "need_more_info",
    label: "I need more information",
    description: "The evidence gaps are too significant to commit without validation.",
    icon: "🔍"
  },
  {
    id: "still_uncertain",
    label: "I'm still uncertain",
    description: "The trade-offs remain genuine and require further incubation or testing.",
    icon: "⚖️"
  }
];

const EXAMINED_CHECKLIST = [
  { id: "assumptions", label: "Hidden assumptions surfaced and probed" },
  { id: "blindspots", label: "Unseen variables and dependencies identified" },
  { id: "risks", label: "Plausible failure modes and mitigations weighed" },
  { id: "perspectives", label: "Alternative stakeholder viewpoints reviewed" },
  { id: "questions", label: "Trade-off uncovering questions contemplated" },
  { id: "evidenceGaps", label: "Critical unknowns and verification steps noted" }
];

export const ReflectionSection: React.FC<ReflectionSectionProps> = ({
  onSaveReflection,
  isSaving,
  initialReflection
}) => {
  const [selectedState, setSelectedState] = useState<ReflectionState>(
    initialReflection?.state || "need_more_info"
  );
  const [notes, setNotes] = useState<string>(initialReflection?.notes || "");
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [saveResult, setSaveResult] = useState<PersistenceResult | null>(null);
  const [checkedAspects, setCheckedAspects] = useState<string[]>(
    initialReflection?.checkedAspects || EXAMINED_CHECKLIST.map(c => c.id)
  );

  const toggleAspect = (id: string) => {
    setCheckedAspects(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await onSaveReflection({
        state: selectedState,
        notes: notes.trim(),
        savedAt: new Date().toISOString(),
        checkedAspects
      });
      if (res && (res as PersistenceResult).storageType) {
        setSaveResult(res as PersistenceResult);
      }
      setSavedSuccess(true);
      
      try {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.75 },
          colors: ["#4f46e5", "#7c3aed", "#f59e0b", "#10b981"],
          disableForReducedMotion: true
        });
      } catch {
        // Ignored
      }

      setTimeout(() => setSavedSuccess(false), 6000);
    } catch {
      // Ignored
    }
  };

  return (
    <section id="reflection-section" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8" aria-labelledby="reflection-heading">
      <div className="glass-panel rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
        
        {/* Header emphasizing user agency */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200/70 dark:border-emerald-800/60">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Preserving Your Cognitive Agency</span>
          </div>

          <h2 id="reflection-heading" className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-heading tracking-tight">
            Your decision is still yours.
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm leading-relaxed">
            After examining these perspectives, what do you think now?
          </p>
        </div>

        {/* Transparent Checklist */}
        <div className="bg-stone-50/80 dark:bg-stone-800/60 rounded-2xl p-5 border border-stone-200/80 dark:border-stone-700/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Aspects Examined Checklist</span>
            </h3>
            <span className="text-xs text-stone-400 font-medium">
              {checkedAspects.length} of {EXAMINED_CHECKLIST.length} reviewed
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {EXAMINED_CHECKLIST.map((item) => {
              const isChecked = checkedAspects.includes(item.id);
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => toggleAspect(item.id)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    isChecked
                      ? "text-stone-900 dark:text-white font-medium bg-white dark:bg-stone-700/80 border border-stone-200 dark:border-stone-600"
                      : "text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800/40 border border-transparent"
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      isChecked ? "text-emerald-600 dark:text-emerald-400" : "text-stone-300 dark:text-stone-600"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-2.5 italic">
            * This checklist reflects breadth of inquiry, never a pseudo-scientific "correctness score".
          </p>
        </div>

        {/* Selectable Reflection States */}
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-stone-900 dark:text-white mb-3">
              Where does your perspective stand right now?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REFLECTION_OPTIONS.map((opt) => {
                const isSelected = selectedState === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setSelectedState(opt.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-600/20"
                        : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{opt.icon}</span>
                      <span className="font-bold text-sm text-stone-900 dark:text-white">
                        {opt.label}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reflection Notes Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="reflection-notes" className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                Your Reflection Notes (Private to you)
              </label>
              <span className="text-xs text-stone-400">{notes.length}/1000</span>
            </div>
            <textarea
              id="reflection-notes"
              rows={3}
              maxLength={1000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What assumption was most surprising? What is your immediate next step or experiment before deciding?"
              className="w-full px-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-700 dark:bg-stone-800/80 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 text-sm focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition-all resize-y"
            />
          </div>

          {/* Storage feedback banner */}
          {savedSuccess && saveResult && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              {saveResult.storageType === "mongodb" ? (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold">Saved:</span> Your decision and reflection have been safely stored in your decision history.
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold">Saved on this device</p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300">
                      Your decision is safely stored in your browser and ready whenever you return.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-100 dark:border-stone-800">
            <div className="text-xs text-stone-500 dark:text-stone-400">
              {savedSuccess ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Reflection saved to your decision history!
                </span>
              ) : (
                <span>Take your time to synthesize before making your final call.</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Decision...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Decision to History</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </section>
  );
};
