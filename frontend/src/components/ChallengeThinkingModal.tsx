import React, { useEffect } from "react";
import {
  Zap,
  X,
  AlertCircle,
  Loader2,
  ShieldAlert
} from "lucide-react";
import type { ChallengeResponse } from "../types/decision";

interface ChallengeThinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  error?: string | null;
  challengeResult?: ChallengeResponse | null;
  onRetry: () => void;
}

export const ChallengeThinkingModal: React.FC<ChallengeThinkingModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  error,
  challengeResult,
  onRetry
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="challenge-modal-title"
    >
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center text-stone-950 font-bold shadow-xs">
              <Zap className="w-5 h-5 fill-stone-950" />
            </div>
            <div>
              <h2 id="challenge-modal-title" className="text-lg font-bold font-heading text-stone-950">
                Stress-Test My Assumptions
              </h2>
              <p className="text-xs text-amber-950/80 font-medium">
                Constructive tough-critic review to reveal where your plan might be fragile
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-900 hover:bg-amber-600/40 transition-colors cursor-pointer"
            title="Close dialog"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Helpful Note:</strong> This is a constructive stress-test to help you find blind spots and strengthen your plan before taking action.
            </span>
          </div>

          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                Constructing the strongest reasonable counterargument...
              </p>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Could not generate counterargument</span>
              </div>
              <p>{error}</p>
              <button
                onClick={onRetry}
                className="mt-2 px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {challengeResult && !isLoading && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block mb-1">
                  Strongest Counterargument
                </span>
                <p className="text-sm sm:text-base font-bold text-stone-900 dark:text-white leading-relaxed">
                  {challengeResult.counterargument}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                  Fragile Premise Most Worth Questioning
                </span>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                  {challengeResult.vulnerableAssumption}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1">
                  Alternative Interpretation of Same Facts
                </span>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                  {challengeResult.alternativeInterpretation}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <span className="text-[11px] font-bold text-purple-800 dark:text-purple-400 uppercase tracking-wider block mb-1">
                  Second-Order Consequence (6–18 Months)
                </span>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                  {challengeResult.secondOrderConsequence}
                </p>
              </div>

              {challengeResult.challengingQuestions?.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60">
                  <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block mb-2">
                    Questions You Must Answer Before Proceeding
                  </span>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-stone-800 dark:text-stone-200 list-disc list-inside">
                    {challengeResult.challengingQuestions.map((q, i) => (
                      <li key={i} className="leading-snug">{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {challengeResult.evidenceConsiderations && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60">
                    <span className="font-bold text-amber-950 dark:text-amber-300 block mb-1">What would strengthen this?</span>
                    <p className="text-stone-700 dark:text-stone-300">{challengeResult.evidenceConsiderations.strengthens}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60">
                    <span className="font-bold text-emerald-950 dark:text-emerald-300 block mb-1">What would disprove it?</span>
                    <p className="text-stone-700 dark:text-stone-300">{challengeResult.evidenceConsiderations.weakens}</p>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Keep or discard this critique as you see fit.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-700 hover:bg-stone-800 dark:hover:bg-stone-600 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Done Reviewing
          </button>
        </div>

      </div>
    </div>
  );
};
