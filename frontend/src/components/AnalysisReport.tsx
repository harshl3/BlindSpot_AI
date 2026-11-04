import React, { useState } from "react";
import {
  AlertTriangle,
  Users,
  Brain,
  Zap,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  Compass,
  Save,
  Target,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Loader2
} from "lucide-react";
import type { BlindSpotAnalysis, DecisionInput } from "../types/decision";
import { CognitiveRadarGraph } from "./CognitiveRadarGraph";

interface AnalysisReportProps {
  analysis: BlindSpotAnalysis;
  decisionInput: DecisionInput;
  onOpenChallenge: () => void;
  onOpenPremortem: () => void;
  onQuickSave?: () => void;
  isQuickSaved?: boolean;
  isSaving?: boolean;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({
  analysis,
  decisionInput,
  onOpenChallenge,
  onOpenPremortem,
  onQuickSave,
  isQuickSaved,
  isSaving
}) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    perspectives: true,
    questions: true,
    evidenceGaps: true
  });

  const toggleSection = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToReflection = () => {
    const el = document.getElementById("reflection-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleExportMarkdown = () => {
    let md = `# BlindSpot Analysis Report: ${decisionInput.decision}\n\n`;
    md += `*Generated: ${new Date().toLocaleDateString()}*\n\n`;
    md += `## 1. Decision Snapshot\n${analysis.decisionSummary}\n\n`;
    md += `### Stated Priorities\n${decisionInput.priorities || "Not specified"}\n\n`;

    md += `## 2. Hidden Assumptions\n`;
    analysis.assumptions.forEach((a, i) => {
      md += `### ${i + 1}. ${a.statement} (${a.confidence?.toUpperCase() || "MED"} CONFIDENCE)\n`;
      md += `- **Why it matters:** ${a.whyItMatters}\n`;
      md += `- **Probing question:** ${a.question}\n\n`;
    });

    md += `## 3. Potential Blind Spots\n`;
    analysis.blindSpots.forEach((b, i) => {
      md += `### ${i + 1}. ${b.factor}\n`;
      md += `- **Impact:** ${b.impact}\n`;
      md += `- **Next step:** ${b.nextStep}\n\n`;
    });

    md += `## 4. Potential Risks & Failure Modes\n`;
    analysis.risks.forEach((r, i) => {
      md += `### ${i + 1}. ${r.risk}\n`;
      md += `- **Reason:** ${r.reason}\n`;
      md += `- **Early Warning Sign:** ${r.warningSign}\n`;
      md += `- **Mitigation:** ${r.mitigation}\n\n`;
    });

    md += `## 5. Alternative Perspectives\n`;
    analysis.perspectives.forEach((p, i) => {
      md += `### ${i + 1}. ${p.viewpoint}\n${p.reasoning}\n\n`;
    });

    md += `## 6. Questions Worth Asking\n`;
    analysis.questions.forEach((q) => {
      md += `- **${q.question}**\n  *Purpose: ${q.purpose}*\n`;
    });
    md += `\n`;

    md += `## 7. Evidence Gaps — What Could Change Your Mind?\n`;
    analysis.evidenceGaps.forEach((e, i) => {
      md += `### ${i + 1}. ${e.unknown}\n`;
      md += `- **Importance:** ${e.importance}\n`;
      md += `- **How to verify:** ${e.verification}\n\n`;
    });

    md += `## 8. Reflection Prompt\n${analysis.reflectionPrompt}\n`;

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `blindspot-analysis-${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-300">

      {/* Top Banner with Rich Gradients & Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 dark:from-indigo-950 dark:via-purple-950 dark:to-stone-900 rounded-3xl text-white p-6 sm:p-8 shadow-2xl border border-indigo-800/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold border border-white/20">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Decision Review & Strategic Insights</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-heading text-white leading-snug">
              {decisionInput.decision}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
              Unbiased breakdown of hidden assumptions, overlooked risks, and blind spots. You stay in full control of the final choice.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Quick Save Decision button */}
            <button
              onClick={onQuickSave || scrollToReflection}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-stone-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
              title="Save this decision to your history"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                  <span>Saving...</span>
                </>
              ) : isQuickSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-stone-950" />
                  <span>Saved to History!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 fill-stone-950" />
                  <span>Save Decision</span>
                </>
              )}
            </button>

            {/* Stress-Test Assumptions CTA */}
            <button
              onClick={onOpenChallenge}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              title="Stress-test this decision with constructive counterarguments"
            >
              <Zap className="w-4 h-4 text-stone-950 fill-stone-950" />
              <span>Stress-Test Idea</span>
            </button>

            {/* Simulate Failure Risks CTA */}
            <button
              onClick={onOpenPremortem}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-xs transition-colors cursor-pointer"
              title="Imagine future failure and work backward to set tripwires"
            >
              <Clock className="w-4 h-4 text-indigo-300" />
              <span>Simulate Failure Risks</span>
            </button>

            {/* Export Markdown */}
            <button
              onClick={handleExportMarkdown}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
              title="Export report as Markdown"
              aria-label="Export Markdown"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* EXECUTIVE INSIGHTS CARD: Bite-Sized Takeaways */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4 border border-indigo-200/60 dark:border-indigo-800/40 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-indigo-100/60 dark:border-stone-800">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Executive Insights (At a Glance)</span>
          </div>
          <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">Core Takeaways</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1. Crucial Assumption */}
          <div className="p-4 rounded-2xl glass-card-indigo space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300 text-[11px] font-black uppercase tracking-wide">
              <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Core Assumption</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white leading-snug line-clamp-3">
              "{analysis.assumptions[0]?.statement || "Key premise under evaluation."}"
            </p>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2">
              {analysis.assumptions[0]?.whyItMatters || "Significant bearing on success."}
            </p>
          </div>

          {/* 2. Top Blind Spot */}
          <div className="p-4 rounded-2xl glass-card-purple space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-purple-800 dark:text-purple-300 text-[11px] font-black uppercase tracking-wide">
              <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Top Blind Spot</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white leading-snug line-clamp-3">
              {analysis.blindSpots[0]?.factor || "Unexamined dependency surfaced."}
            </p>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2">
              {analysis.blindSpots[0]?.impact || "May affect implementation timeline."}
            </p>
          </div>

          {/* 3. Primary Risk */}
          <div className="p-4 rounded-2xl glass-card-amber space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 text-[11px] font-black uppercase tracking-wide">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Leading Risk</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white leading-snug line-clamp-3">
              {analysis.risks[0]?.risk || "Operational friction point."}
            </p>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2">
              {analysis.risks[0]?.mitigation || "Mitigation strategy outlined below."}
            </p>
          </div>
        </div>
      </div>

      {/* COGNITIVE RADAR & TOPOLOGY GRAPH */}
      <CognitiveRadarGraph analysis={analysis} decisionInput={decisionInput} />

      {/* SECTION 1: Decision Snapshot */}
      <section className="glass-panel rounded-3xl p-6 sm:p-7 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-indigo-100/60 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              1
            </div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white font-heading">
              Decision Snapshot
            </h2>
          </div>
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Objective Framing</span>
        </div>

        <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-sm sm:text-base">
          {analysis.decisionSummary}
        </p>

        {decisionInput.priorities && (
          <div className="p-3.5 glass-card-indigo rounded-xl text-xs sm:text-sm text-stone-700 dark:text-stone-300">
            <strong className="text-indigo-900 dark:text-indigo-200">Your stated priorities: </strong>
            {decisionInput.priorities}
          </div>
        )}
      </section>

      {/* SECTION 2: Hidden Assumptions */}
      <section className="glass-panel rounded-3xl shadow-lg overflow-hidden">
        <button
          onClick={() => toggleSection("assumptions")}
          className="w-full p-6 sm:p-7 flex items-center justify-between text-left hover:bg-white/40 dark:hover:bg-stone-800/40 transition-colors cursor-pointer"
          aria-expanded={!collapsed.assumptions}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              2
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white font-heading">
                Hidden Assumptions
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Premises treated as true without sufficient verification.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-stone-400">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {analysis.assumptions?.length || 0} identified
            </span>
            {collapsed.assumptions ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>

        {!collapsed.assumptions && (
          <div className="px-6 pb-6 sm:px-7 sm:pb-7 space-y-3.5 pt-2 border-t border-indigo-100/60 dark:border-stone-800">
            {analysis.assumptions?.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl glass-card-indigo shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-stone-900 dark:text-white text-sm sm:text-base">
                    "{item.statement}"
                  </h3>
                  {item.confidence && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${item.confidence === "high"
                          ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                          : item.confidence === "medium"
                            ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"
                            : "bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
                        }`}
                    >
                      {item.confidence} unexamined
                    </span>
                  )}
                </div>
                <div className="mt-2.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300 space-y-2">
                  <p>
                    <strong className="text-stone-900 dark:text-stone-100">Why it matters:</strong> {item.whyItMatters}
                  </p>
                  <p className="text-indigo-950 dark:text-indigo-200 font-medium bg-white/70 dark:bg-indigo-950/70 p-3 rounded-xl border border-indigo-200/80 dark:border-indigo-800/80">
                    <strong>Testing Question:</strong> {item.question}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3: Potential Blind Spots */}
      <section className="glass-panel rounded-3xl shadow-lg overflow-hidden">
        <button
          onClick={() => toggleSection("blindSpots")}
          className="w-full p-6 sm:p-7 flex items-center justify-between text-left hover:bg-white/40 dark:hover:bg-stone-800/40 transition-colors cursor-pointer"
          aria-expanded={!collapsed.blindSpots}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              3
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white font-heading">
                Potential Blind Spots
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Important factors absent from current reasoning.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-stone-400">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              {analysis.blindSpots?.length || 0} factors
            </span>
            {collapsed.blindSpots ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>

        {!collapsed.blindSpots && (
          <div className="px-6 pb-6 sm:px-7 sm:pb-7 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-purple-100/60 dark:border-stone-800">
            {analysis.blindSpots?.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl glass-card-purple flex flex-col justify-between shadow-xs"
              >
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-white text-sm mb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    {item.factor}
                  </h3>
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                    <strong>Impact:</strong> {item.impact}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-purple-200/60 dark:border-purple-800 text-xs text-emerald-900 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 font-medium">
                  <strong>Practical Next Step:</strong> {item.nextStep}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 4: Potential Risks & Trade-Offs */}
      <section className="glass-panel rounded-3xl shadow-lg overflow-hidden">
        <button
          onClick={() => toggleSection("risks")}
          className="w-full p-6 sm:p-7 flex items-center justify-between text-left hover:bg-white/40 dark:hover:bg-stone-800/40 transition-colors cursor-pointer"
          aria-expanded={!collapsed.risks}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              4
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white font-heading">
                Potential Risks & Trade-Offs
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Plausible failure modes and early warning indicators.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-stone-400">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              {analysis.risks?.length || 0} risks
            </span>
            {collapsed.risks ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>

        {!collapsed.risks && (
          <div className="px-6 pb-6 sm:px-7 sm:pb-7 space-y-3.5 pt-2 border-t border-amber-100/60 dark:border-stone-800">
            {analysis.risks?.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl glass-card-amber shadow-xs"
              >
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{item.risk}</span>
                </div>
                <p className="mt-1.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                  <strong>Why it could happen:</strong> {item.reason}
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/70 dark:bg-stone-900/60 p-2.5 rounded-xl border border-amber-200/70 dark:border-amber-900/50">
                    <span className="font-bold text-amber-900 dark:text-amber-400 block mb-0.5">
                      Early Warning Sign:
                    </span>
                    <span className="text-stone-600 dark:text-stone-300">{item.warningSign}</span>
                  </div>
                  <div className="bg-white/70 dark:bg-stone-900/60 p-2.5 rounded-xl border border-emerald-200/70 dark:border-emerald-900/50">
                    <span className="font-bold text-emerald-800 dark:text-emerald-400 block mb-0.5">
                      Plausible Mitigation:
                    </span>
                    <span className="text-stone-600 dark:text-stone-300">{item.mitigation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 5: Alternative Perspectives */}
      <section className="glass-panel rounded-3xl shadow-lg overflow-hidden">
        <button
          onClick={() => toggleSection("perspectives")}
          className="w-full p-6 sm:p-7 flex items-center justify-between text-left hover:bg-white/40 dark:hover:bg-stone-800/40 transition-colors cursor-pointer"
          aria-expanded={!collapsed.perspectives}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              5
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white font-heading">
                Alternative Perspectives
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                How other stakeholders would view this situation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-stone-400">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {analysis.perspectives?.length || 0} viewpoints
            </span>
            {collapsed.perspectives ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>

        {!collapsed.perspectives && (
          <div className="px-6 pb-6 sm:px-7 sm:pb-7 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-emerald-100/60 dark:border-stone-800">
            {analysis.perspectives?.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl glass-card-emerald shadow-xs"
              >
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-xs sm:text-sm mb-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{item.viewpoint}</span>
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  {item.reasoning}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 6: Questions Worth Asking */}
      <section className="glass-panel rounded-3xl shadow-lg overflow-hidden">
        <button
          onClick={() => toggleSection("questions")}
          className="w-full p-6 sm:p-7 flex items-center justify-between text-left hover:bg-white/40 dark:hover:bg-stone-800/40 transition-colors cursor-pointer"
          aria-expanded={!collapsed.questions}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              6
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white font-heading">
                Questions Worth Asking
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Inquiries that expose trade-offs rather than prescribing answers.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-stone-400">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
              {analysis.questions?.length || 0} questions
            </span>
            {collapsed.questions ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>

        {!collapsed.questions && (
          <div className="px-6 pb-6 sm:px-7 sm:pb-7 space-y-3 pt-2 border-t border-cyan-100/60 dark:border-stone-800">
            {analysis.questions?.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl glass-card-cyan flex items-start gap-3 shadow-xs"
              >
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  Q{idx + 1}
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white leading-snug">
                    {item.question}
                  </p>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    <em>Purpose:</em> {item.purpose}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 7: Evidence Gaps */}
      <section className="glass-panel rounded-3xl shadow-lg overflow-hidden">
        <button
          onClick={() => toggleSection("evidenceGaps")}
          className="w-full p-6 sm:p-7 flex items-center justify-between text-left hover:bg-white/40 dark:hover:bg-stone-800/40 transition-colors cursor-pointer"
          aria-expanded={!collapsed.evidenceGaps}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              7
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white font-heading">
                Evidence Gaps: What Would Change Your Mind?
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Critical missing information and how to acquire it.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-stone-400">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {analysis.evidenceGaps?.length || 0} gaps
            </span>
            {collapsed.evidenceGaps ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>

        {!collapsed.evidenceGaps && (
          <div className="px-6 pb-6 sm:px-7 sm:pb-7 space-y-3.5 pt-2 border-t border-indigo-100/60 dark:border-stone-800">
            {analysis.evidenceGaps?.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl glass-card-indigo shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-stone-900 dark:text-white text-xs sm:text-sm">
                    {item.unknown}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200/80 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 shrink-0">
                    High Value
                  </span>
                </div>
                <div className="mt-2 text-xs text-stone-700 dark:text-stone-300 space-y-1.5">
                  <p>
                    <strong>Why it matters:</strong> {item.importance}
                  </p>
                  <p className="text-indigo-950 dark:text-indigo-200 bg-white/70 dark:bg-stone-900/60 p-2.5 rounded-xl border border-indigo-200/70 dark:border-indigo-800">
                    <strong>How to verify before deciding:</strong> {item.verification}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 8: Reflection Prompt */}
      <section className="glass-card-purple rounded-3xl p-6 sm:p-7 shadow-lg space-y-3 border border-purple-200/70 dark:border-purple-800/60">
        <div className="flex items-center gap-2.5 pb-2 border-b border-purple-200/50 dark:border-purple-800/60">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            8
          </div>
          <h2 className="text-base sm:text-lg font-bold text-purple-950 dark:text-purple-200 font-heading">
            Closing Reflection Prompt
          </h2>
        </div>

        <p className="text-stone-800 dark:text-stone-200 text-xs sm:text-sm leading-relaxed italic bg-white/60 dark:bg-stone-900/50 p-4 rounded-2xl border border-purple-200/60 dark:border-purple-800/60">
          "{analysis.reflectionPrompt}"
        </p>
      </section>

    </article>
  );
};
