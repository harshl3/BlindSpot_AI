import React, { useState } from "react";
import {
  Zap,
  Clock,
  Sparkles,
  Loader2,
  Lightbulb
} from "lucide-react";
import { challengeThinking, runPremortem } from "../services/api";
import type { ChallengeResponse, PremortemResponse } from "../types/decision";

export const ThinkingLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"challenge" | "premortem">("challenge");

  // Challenge State
  const [challengeDecision, setChallengeDecision] = useState(
    "We plan to mandate a full return-to-office 5 days a week to boost team collaboration."
  );
  const [challengeThinkingText, setChallengeThinkingText] = useState(
    "In-person presence naturally creates spontaneous breakthroughs and strengthens culture."
  );
  const [isChallenging, setIsChallenging] = useState(false);
  const [challengeResult, setChallengeResult] = useState<ChallengeResponse | null>(null);

  // Pre-Mortem State
  const [premortemDecision, setPremortemDecision] = useState(
    "Launching an AI feature that automatically generates customer replies."
  );
  const [premortemOption, setPremortemOption] = useState("Roll out to 100% of users immediately");
  const [premortemHorizon, setPremortemHorizon] = useState("6 months");
  const [isPremortemLoading, setIsPremortemLoading] = useState(false);
  const [premortemResult, setPremortemResult] = useState<PremortemResponse | null>(null);

  const [error, setError] = useState<string | null>(null);

  const handleRunChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeDecision.trim()) return;
    setIsChallenging(true);
    setError(null);
    try {
      const res = await challengeThinking({
        decision: challengeDecision.trim(),
        context: "Thinking Lab quick stress-test",
        options: ["Proceed with plan", "Alternative approach"],
        currentThinking: challengeThinkingText.trim(),
        analysisSummary: "Direct stress-test inquiry"
      });
      setChallengeResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to challenge thinking.";
      setError(msg);
    } finally {
      setIsChallenging(false);
    }
  };

  const handleRunPremortem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!premortemDecision.trim()) return;
    setIsPremortemLoading(true);
    setError(null);
    try {
      const res = await runPremortem({
        decision: premortemDecision.trim(),
        context: "Thinking Lab pre-mortem simulation",
        chosenOption: premortemOption.trim(),
        timeHorizon: premortemHorizon
      });
      setPremortemResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to simulate pre-mortem.";
      setError(msg);
    } finally {
      setIsPremortemLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header banner with visual image */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-900/60 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="p-6 sm:p-10 lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Interactive Stress-Test Lab</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
              The <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">Thinking Lab</span>
            </h1>

            <p className="text-sm sm:text-base text-stone-300 max-w-xl leading-relaxed">
              Stress-test strategic choices before committing. Review ideas with a <strong>Constructive Tough Critic</strong> or run a <strong>Future Failure Simulation</strong> in seconds.
            </p>

            {/* Sub-nav tabs */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab("challenge")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "challenge"
                    ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                    : "bg-white/10 text-stone-300 hover:bg-white/15"
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Stress-Test Assumptions</span>
              </button>

              <button
                onClick={() => setActiveTab("premortem")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "premortem"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-white/10 text-stone-300 hover:bg-white/15"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Future Failure Simulation</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block h-full min-h-[260px] relative">
            <img
              src="/images/decision_crossroads.jpg"
              alt="Decision Crossroads 3D Visual"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-85 hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/90 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* TAB 1: Devil's Advocate Challenge */}
      {activeTab === "challenge" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Form */}
          <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-amber-200/50 dark:border-stone-800">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h2 className="text-lg font-bold text-stone-900 dark:text-white font-heading">
                Stress-Test Assumptions Setup
              </h2>
            </div>

            <form onSubmit={handleRunChallenge} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  Proposed Decision or Idea
                </label>
                <textarea
                  rows={3}
                  value={challengeDecision}
                  onChange={(e) => setChallengeDecision(e.target.value)}
                  placeholder="What is your plan?"
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  Your Current Rationale (Why you think it's right)
                </label>
                <textarea
                  rows={2}
                  value={challengeThinkingText}
                  onChange={(e) => setChallengeThinkingText(e.target.value)}
                  placeholder="What core belief is guiding you?"
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isChallenging || !challengeDecision.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isChallenging ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Constructing Counterarguments...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-stone-950" />
                    <span>Stress-Test My Reasoning</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm flex flex-col justify-between">
            {challengeResult ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block mb-1">
                    Strongest Counterargument
                  </span>
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 leading-relaxed">
                    {challengeResult.counterargument}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                    Fragile Premise Most Worth Questioning
                  </span>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                    {challengeResult.vulnerableAssumption}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider block mb-1">
                    Alternative Interpretation
                  </span>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                    {challengeResult.alternativeInterpretation}
                  </p>
                </div>

                {challengeResult.challengingQuestions?.length > 0 && (
                  <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60">
                    <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block mb-1.5">
                      Probing Questions to Answer
                    </span>
                    <ul className="space-y-1 text-xs text-stone-800 dark:text-stone-200 list-disc list-inside">
                      {challengeResult.challengingQuestions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-stone-400 dark:text-stone-500 space-y-2">
                <Lightbulb className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">
                  Ready to Stress-Test
                </p>
                <p className="text-xs max-w-sm mx-auto">
                  Enter your current direction on the left and click "Stress-Test My Reasoning" to inspect blind spots.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: Pre-Mortem Simulator */}
      {activeTab === "premortem" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Form */}
          <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-indigo-200/50 dark:border-stone-800">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-stone-900 dark:text-white font-heading">
                Future Failure Simulation Setup
              </h2>
            </div>

            <form onSubmit={handleRunPremortem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  Decision to Examine
                </label>
                <input
                  type="text"
                  value={premortemDecision}
                  onChange={(e) => setPremortemDecision(e.target.value)}
                  placeholder="Decision statement..."
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  Course of Action
                </label>
                <input
                  type="text"
                  value={premortemOption}
                  onChange={(e) => setPremortemOption(e.target.value)}
                  placeholder="Specific strategy or path..."
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  Future Horizon
                </label>
                <select
                  value={premortemHorizon}
                  onChange={(e) => setPremortemHorizon(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="3 months">3 Months Out</option>
                  <option value="6 months">6 Months Out</option>
                  <option value="12 months">12 Months Out</option>
                  <option value="3 years">3 Years Out</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isPremortemLoading || !premortemDecision.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPremortemLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reasoning Backward from Failure...</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Simulate Future Failure</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm flex flex-col justify-between">
            {premortemResult ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60">
                  <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block mb-1">
                    Hypothetical Failure Scenario ({premortemHorizon})
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200 leading-relaxed">
                    {premortemResult.failureScenario}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block mb-1.5">
                    Root Causes
                  </span>
                  <ul className="space-y-1 text-xs text-stone-700 dark:text-stone-300 list-disc list-inside">
                    {premortemResult.plausibleContributingFactors?.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
                    <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">Early Tripwires</span>
                    <ul className="space-y-1 text-stone-700 dark:text-stone-300 list-disc list-inside">
                      {premortemResult.earlyWarningSigns?.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-1">Preventive Actions</span>
                    <ul className="space-y-1 text-stone-700 dark:text-stone-300 list-disc list-inside">
                      {premortemResult.riskReductionActions?.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-stone-400 dark:text-stone-500 space-y-2">
                <Clock className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">
                  No Simulation Run Yet
                </p>
                <p className="text-xs max-w-sm mx-auto">
                  Configure your decision and time horizon on the left, then simulate hypothetical failure.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
