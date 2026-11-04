import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  Compass,
  ArrowRight,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import type { DecisionInput } from "../types/decision";

import { QUICK_PRESETS, SAMPLE_DECISION } from "../constants/presets";

interface DecisionWorkspaceProps {
  onSubmit: (input: DecisionInput) => void;
  isLoading: boolean;
  initialValues?: Partial<DecisionInput>;
}

export { QUICK_PRESETS, SAMPLE_DECISION };

export const DecisionWorkspace: React.FC<DecisionWorkspaceProps> = ({
  onSubmit,
  isLoading,
  initialValues
}) => {
  const [decision, setDecision] = useState(initialValues?.decision || "");
  const [context, setContext] = useState(initialValues?.context || "");
  const [options, setOptions] = useState<string[]>(
    initialValues?.options && initialValues.options.length >= 2
      ? initialValues.options
      : ["", ""]
  );
  const [priorities, setPriorities] = useState(initialValues?.priorities || "");
  const [currentThinking, setCurrentThinking] = useState(initialValues?.currentThinking || "");
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
    if (errors.options) {
      setErrors((prev) => ({ ...prev, options: "" }));
    }
  };

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, idx) => idx !== index));
    }
  };

  const loadPreset = (preset: DecisionInput) => {
    setDecision(preset.decision);
    setContext(preset.context);
    setOptions(preset.options);
    setPriorities(preset.priorities || "");
    setCurrentThinking(preset.currentThinking || "");
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!decision.trim()) {
      newErrors.decision = "Please enter the decision you want to analyze.";
    } else if (decision.trim().length < 6) {
      newErrors.decision = "Please provide a slightly more descriptive question (at least 6 characters).";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Auto-infer options if left blank
    let filledOptions = options.map((o) => o.trim()).filter(Boolean);
    if (filledOptions.length < 2) {
      filledOptions = [
        "Pursue primary proposed direction",
        "Maintain current status quo or alternative route"
      ];
    }

    setErrors({});
    onSubmit({
      decision: decision.trim(),
      context: context.trim() || "Analyzed with general operational principles and domain heuristics.",
      options: filledOptions,
      priorities: priorities.trim() || "Balance execution velocity against long-term risk and reversibility.",
      currentThinking: currentThinking.trim()
    });
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8" aria-labelledby="workspace-heading">
      <div className="glass-panel rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-indigo-100/60 dark:border-stone-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2">
              <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Step 1: Frame The Decision</span>
            </div>
            <h2 id="workspace-heading" className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-heading tracking-tight">
              What are you trying to decide?
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm mt-1">
              Type your dilemma in plain English. BlindSpot will uncover the hidden trade-offs.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadPreset(SAMPLE_DECISION)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/90 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl border border-indigo-200/80 dark:border-indigo-800 transition-colors shrink-0 self-start sm:self-auto cursor-pointer shadow-xs"
            title="Populate form with a realistic scenario"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Load Quick Demo</span>
          </button>
        </div>

        {/* 1-Click Scenario Chips */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            Quick Scenarios (1-Click to Test):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {QUICK_PRESETS.map((preset, idx) => {
              const Icon = preset.icon;
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => loadPreset(preset.data)}
                  className="p-2.5 rounded-xl glass-card-indigo hover:scale-[1.02] transition-all text-left flex items-center gap-2 cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/80 dark:bg-stone-800 flex items-center justify-center shrink-0 shadow-xs">
                    <Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="truncate">
                    <p className="text-[11px] font-bold text-stone-900 dark:text-white truncate">
                      {preset.tag}
                    </p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                      {preset.title.split(": ")[1]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Primary Decision Input Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="decision-query" className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Decision Dilemma or Question <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-stone-400">Be as specific as possible</span>
            </div>
            
            <textarea
              id="decision-query"
              rows={3}
              value={decision}
              onChange={(e) => {
                setDecision(e.target.value);
                if (errors.decision) setErrors((prev) => ({ ...prev, decision: "" }));
              }}
              placeholder="e.g. Should I accept the founding engineer role at a Series A startup or stay as Senior SWE at Google?"
              className={`w-full px-4 py-3 rounded-2xl glass-card-indigo text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 text-sm sm:text-base font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all resize-y ${
                errors.decision ? "border-red-500" : ""
              }`}
            />
            
            {errors.decision && (
              <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.decision}</span>
              </p>
            )}
          </div>

          {/* Collapsible Section for Options & Context */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showAdvanced ? "Hide options & context details" : "Add options, constraints & context (Optional)"}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Optional Extended Details Drawer */}
          {showAdvanced && (
            <div className="space-y-4 pt-2 border-t border-stone-100 dark:border-stone-800 animate-in fade-in duration-200">
              
              {/* Options Considered */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Specific Options Under Consideration (Optional)
                  </label>
                  {options.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Option</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 text-center text-xs font-bold text-stone-400">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + idx)} description...`}
                        className="flex-1 px-3.5 py-2 rounded-xl glass-card-neutral text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-2 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove option"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Context */}
              <div className="space-y-1.5">
                <label htmlFor="context-input" className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Background Context & Team Situation
                </label>
                <textarea
                  id="context-input"
                  rows={2}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Team size, timeline constraints, budget limits..."
                  className="w-full px-3.5 py-2 rounded-xl glass-card-neutral text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 resize-y"
                />
              </div>

              {/* Current Lean & Priorities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="priorities-input" className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Key Priorities / Non-Negotiables
                  </label>
                  <input
                    type="text"
                    id="priorities-input"
                    value={priorities}
                    onChange={(e) => setPriorities(e.target.value)}
                    placeholder="Speed, stability, cost, career upside..."
                    className="w-full px-3.5 py-2 rounded-xl glass-card-neutral text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="current-lean-input" className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    What are you leaning toward right now?
                  </label>
                  <input
                    type="text"
                    id="current-lean-input"
                    value={currentThinking}
                    onChange={(e) => setCurrentThinking(e.target.value)}
                    placeholder="Initial gut feel..."
                    className="w-full px-3.5 py-2 rounded-xl glass-card-neutral text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

            </div>
          )}

          {/* Action Row */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-indigo-100/60 dark:border-stone-800">
            <p className="text-xs text-stone-500 dark:text-stone-400 text-center sm:text-left">
              Rigorous cognitive framing • No fake numbers • Decision stays 100% yours
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 text-white font-black text-sm shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Illuminating Blind Spots...</span>
                </>
              ) : (
                <>
                  <span>Analyze Decision</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </section>
  );
};
