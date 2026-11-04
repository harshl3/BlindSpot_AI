import React, { useState, useEffect } from "react";
import {
  Clock,
  X,
  Loader2,
  Calendar
} from "lucide-react";
import type { PremortemResponse } from "../types/decision";

interface PremortemModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: string[];
  isLoading: boolean;
  error?: string | null;
  premortemResult?: PremortemResponse | null;
  onExecutePremortem: (chosenOption: string, timeHorizon: string) => void;
}

export const PremortemModal: React.FC<PremortemModalProps> = ({
  isOpen,
  onClose,
  options,
  isLoading,
  error,
  premortemResult,
  onExecutePremortem
}) => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const activeOption = selectedOption || options[0] || "";
  const [timeHorizon, setTimeHorizon] = useState<string>("12 months");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOption) return;
    onExecutePremortem(activeOption, timeHorizon);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="premortem-modal-title"
    >
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-stone-900 dark:bg-stone-950 px-6 py-5 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Clock className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 id="premortem-modal-title" className="text-lg font-bold font-heading">
                Future Risk Simulation (What If It Fails?)
              </h2>
              <p className="text-xs text-stone-400">
                Imagine it is months later and this choice ran into problems. Uncover hidden traps and warning signs now.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            title="Close dialog"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          
          <form onSubmit={handleRun} className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-4">
            <div className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              <span>Configure Scenario Parameters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="premortem-option" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Which path to stress-test?
                </label>
                <select
                  id="premortem-option"
                  value={activeOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {options.map((opt, i) => (
                    <option key={i} value={opt}>
                      Option {String.fromCharCode(65 + i)}: {opt.slice(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="premortem-horizon" className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Time Horizon
                </label>
                <select
                  id="premortem-horizon"
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="3 months">3 Months Out</option>
                  <option value="6 months">6 Months Out</option>
                  <option value="12 months">12 Months Out</option>
                  <option value="3 years">3 Years Out</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !selectedOption}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Simulating future risks & early tripwires...</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Simulate Failure Scenario</span>
                </>
              )}
            </button>
          </form>

          {error && !isLoading && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 rounded-xl">
              {error}
            </div>
          )}

          {premortemResult && !isLoading && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-400 uppercase tracking-wider block mb-1">
                  Hypothetical Failure Scenario ({timeHorizon} Future)
                </span>
                <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-semibold">
                  {premortemResult.failureScenario}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block mb-1.5">
                  Contributing Root Causes
                </span>
                <ul className="space-y-1 text-xs sm:text-sm text-stone-700 dark:text-stone-300 list-disc list-inside">
                  {premortemResult.plausibleContributingFactors?.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                  <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-1">Preventive Questions</span>
                  <ul className="space-y-1 text-stone-700 dark:text-stone-300 list-disc list-inside">
                    {premortemResult.preventiveQuestions?.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                  <span className="font-bold text-emerald-950 dark:text-emerald-300 block mb-1">Risk Reduction Actions</span>
                  <ul className="space-y-1 text-stone-700 dark:text-stone-300 list-disc list-inside">
                    {premortemResult.riskReductionActions?.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            A stress-testing exercise to prepare safeguards, not a fixed prediction.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-700 hover:bg-stone-800 dark:hover:bg-stone-600 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
