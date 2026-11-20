import React, { useState } from "react";
import {
  Grid,
  ShieldAlert,
  Zap,
  Info,
  CheckCircle2,
  ArrowRight,
  Eye,
  RotateCcw
} from "lucide-react";
import type { BlindSpotAnalysis, DecisionInput } from "../types/decision";

interface DecisionMatrix2x2Props {
  analysis: BlindSpotAnalysis;
  decisionInput: DecisionInput;
}

interface MatrixPoint {
  id: string;
  title: string;
  category: "assumption" | "risk" | "blindSpot";
  x: number; // 0 (Easy to reverse) to 100 (Hard to reverse / one-way door)
  y: number; // 0 (Low stakes) to 100 (High stakes)
  quadrant: "stop_verify" | "calculated_bet" | "quick_win" | "sticky_commitment";
  recommendation: string;
  detail: string;
}

export const DecisionMatrix2x2: React.FC<DecisionMatrix2x2Props> = ({
  analysis,
  decisionInput
}) => {
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [quadrantFilter, setQuadrantFilter] = useState<string>("all");

  // Determine baseline reversibility from user input keywords
  const fullText = (decisionInput.decision + " " + (decisionInput.context || "")).toLowerCase();
  const isHighCommitment = fullText.match(/quit|hire|fire|buy|marriage|sign|seed|invest|rewrite|migrate|contract/);

  // Generate interactive points from analysis
  const points: MatrixPoint[] = [];

  // 1. Primary Assumptions
  analysis.assumptions.forEach((a, idx) => {
    const isFragile = a.confidence === "low" || a.confidence === "medium";
    const x = isHighCommitment ? 72 + idx * 8 : isFragile ? 62 + idx * 7 : 40 + idx * 8;
    const y = isFragile ? 70 + idx * 8 : 45 + idx * 6;
    
    const quadrant = (x >= 50 && y >= 50) 
      ? "stop_verify" 
      : (x < 50 && y >= 50) 
        ? "calculated_bet" 
        : (x >= 50 && y < 50) 
          ? "sticky_commitment" 
          : "quick_win";

    points.push({
      id: `assumption-${idx}`,
      title: a.statement,
      category: "assumption",
      x: Math.min(92, Math.max(12, x)),
      y: Math.min(90, Math.max(15, y)),
      quadrant,
      detail: a.whyItMatters,
      recommendation: `Test this before committing: ${a.question}`
    });
  });

  // 2. Primary Risks
  analysis.risks.forEach((r, idx) => {
    const isSevere = r.uncertainty === "high";
    const x = isHighCommitment ? 75 + idx * 6 : 52 + idx * 8;
    const y = isSevere ? 78 + idx * 5 : 58 + idx * 6;

    const quadrant = (x >= 50 && y >= 50) 
      ? "stop_verify" 
      : (x < 50 && y >= 50) 
        ? "calculated_bet" 
        : (x >= 50 && y < 50) 
          ? "sticky_commitment" 
          : "quick_win";

    points.push({
      id: `risk-${idx}`,
      title: r.risk,
      category: "risk",
      x: Math.min(94, Math.max(14, x)),
      y: Math.min(92, Math.max(20, y)),
      quadrant,
      detail: r.reason,
      recommendation: `Early safeguard: ${r.mitigation}`
    });
  });

  // 3. Top Blind Spot
  if (analysis.blindSpots.length > 0) {
    const b = analysis.blindSpots[0];
    const x = isHighCommitment ? 68 : 48;
    const y = 64;
    const quadrant = (x >= 50 && y >= 50) ? "stop_verify" : "calculated_bet";

    points.push({
      id: "blindspot-0",
      title: b.factor,
      category: "blindSpot",
      x,
      y,
      quadrant,
      detail: b.impact,
      recommendation: `Check today: ${b.nextStep}`
    });
  }

  // Active or first point
  const activePoint = points.find(p => p.id === selectedPointId) || points[0] || null;

  // Filtered points
  const visiblePoints = quadrantFilter === "all" 
    ? points 
    : points.filter(p => p.quadrant === quadrantFilter);

  // Quadrant metadata
  const quadrantMeta = {
    stop_verify: {
      name: "Stop & Verify (One-Way Door)",
      color: "#ef4444",
      bgClass: "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300",
      icon: ShieldAlert,
      tagline: "High Stakes & Hard to Undo — Run a quick test before you leap"
    },
    calculated_bet: {
      name: "Calculated Experiment",
      color: "#f59e0b",
      bgClass: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
      icon: Zap,
      tagline: "High Impact but Reversible — Safe to try if you have an exit plan"
    },
    sticky_commitment: {
      name: "Sticky Commitment",
      color: "#8b5cf6",
      bgClass: "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300",
      icon: RotateCcw,
      tagline: "Low Stakes but Annoying to Undo — Keep setup simple"
    },
    quick_win: {
      name: "Quick Experiment (Two-Way Door)",
      color: "#10b981",
      bgClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
      icon: CheckCircle2,
      tagline: "Low Stakes & Easy to Reverse — Don't overthink, just try it"
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100/60 dark:border-stone-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-rose-500/20">
            <Grid className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black font-heading text-stone-900 dark:text-white flex items-center gap-2">
              <span>Risk vs. Reversibility Matrix</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                Interactive Map
              </span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              One-Way Doors (hard to undo) vs. Two-Way Doors (easy experiments). Tap any point to explore.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: "all", label: "All Pins" },
            { id: "stop_verify", label: "🔴 Stop & Verify" },
            { id: "calculated_bet", label: "🟡 Experiments" },
            { id: "quick_win", label: "🟢 Quick Wins" }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setQuadrantFilter(f.id)}
              className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                quadrantFilter === f.id
                  ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-xs"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Matrix + Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left: Interactive 2x2 Grid Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-3 rounded-2xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 relative">
          
          {/* Top Axis Label */}
          <div className="w-full flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 pb-1">
            ▲ High Stakes (Severe Downside)
          </div>

          <div className="relative w-full max-w-[340px] aspect-square">
            
            {/* 4 Quadrants Background Grids */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 rounded-2xl overflow-hidden p-1">
              
              {/* Top-Left: Calculated Experiment */}
              <div className="bg-amber-500/10 dark:bg-amber-500/5 rounded-tl-xl p-2 flex flex-col justify-between border border-amber-500/20">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Calculated Bet</span>
                <span className="text-[9px] text-stone-400">High Impact / Reversible</span>
              </div>

              {/* Top-Right: Stop & Verify */}
              <div className="bg-rose-500/15 dark:bg-rose-500/10 rounded-tr-xl p-2 flex flex-col justify-between border border-rose-500/30">
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400">Stop & Verify ⚠️</span>
                <span className="text-[9px] text-stone-400">One-Way Door</span>
              </div>

              {/* Bottom-Left: Quick Experiment */}
              <div className="bg-emerald-500/15 dark:bg-emerald-500/10 rounded-bl-xl p-2 flex flex-col justify-between border border-emerald-500/20">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Quick Experiment ✓</span>
                <span className="text-[9px] text-stone-400">Two-Way Door</span>
              </div>

              {/* Bottom-Right: Sticky Commitment */}
              <div className="bg-purple-500/10 dark:bg-purple-500/5 rounded-br-xl p-2 flex flex-col justify-between border border-purple-500/20">
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400">Sticky Setup</span>
                <span className="text-[9px] text-stone-400">Low Stakes / Sticky</span>
              </div>
            </div>

            {/* SVG Interactive Layer for Points */}
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full pointer-events-auto overflow-visible"
              aria-label="2x2 Decision Matrix"
            >
              {/* Axes Crosslines */}
              <line x1="50" y1="2" x2="50" y2="98" stroke="#a1a1aa" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.6" />
              <line x1="2" y1="50" x2="98" y2="50" stroke="#a1a1aa" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.6" />

              {/* Interactive Point Pins */}
              {visiblePoints.map((p) => {
                const isSelected = activePoint?.id === p.id;
                const meta = quadrantMeta[p.quadrant];

                return (
                  <g
                    key={p.id}
                    className="cursor-pointer transition-transform duration-150"
                    onClick={() => setSelectedPointId(p.id)}
                  >
                    {/* Ripple on selected */}
                    {isSelected && (
                      <circle
                        cx={p.x}
                        cy={100 - p.y}
                        r="6"
                        fill={meta.color}
                        opacity="0.35"
                        className="animate-ping"
                      />
                    )}

                    {/* Hit target */}
                    <circle
                      cx={p.x}
                      cy={100 - p.y}
                      r="7"
                      fill="transparent"
                    />

                    {/* Outer ring */}
                    <circle
                      cx={p.x}
                      cy={100 - p.y}
                      r={isSelected ? "4.5" : "3.5"}
                      fill={meta.color}
                      stroke="#ffffff"
                      strokeWidth="1"
                      className="drop-shadow-md"
                    />

                    {/* Inner core */}
                    <circle
                      cx={p.x}
                      cy={100 - p.y}
                      r="1.5"
                      fill="#ffffff"
                    />
                  </g>
                );
              })}
            </svg>

          </div>

          {/* Bottom & Horizontal Axis Labels */}
          <div className="w-full flex items-center justify-between text-[10px] font-bold text-stone-500 dark:text-stone-400 px-3 pt-2">
            <span>◀ Easy to Reverse</span>
            <span className="text-stone-400 dark:text-stone-500 font-normal">Reversibility Axis</span>
            <span>Hard to Reverse (One-Way) ▶</span>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 pt-0.5">
            ▼ Low Stakes (Manageable Hiccups)
          </div>

        </div>

        {/* Right: Selected Factor Detail Card */}
        <div className="lg:col-span-5 space-y-3">
          {activePoint ? (
            <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-indigo-200/60 dark:border-stone-800 space-y-3 animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${quadrantMeta[activePoint.quadrant].bgClass}`}>
                  {React.createElement(quadrantMeta[activePoint.quadrant].icon, { className: "w-3.5 h-3.5" })}
                  <span>{quadrantMeta[activePoint.quadrant].name}</span>
                </span>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">
                  {activePoint.category}
                </span>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-black text-stone-900 dark:text-white leading-snug">
                  "{activePoint.title}"
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                  {activePoint.detail}
                </p>
              </div>

              {/* Action Recommendation */}
              <div className="p-3 rounded-xl bg-white/70 dark:bg-stone-900/70 border border-indigo-100 dark:border-stone-800 text-xs space-y-1">
                <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                  Recommended Action:
                </span>
                <p className="text-stone-700 dark:text-stone-300">
                  {activePoint.recommendation}
                </p>
              </div>

              <div className="text-[11px] text-stone-500 dark:text-stone-400 italic pt-1">
                {quadrantMeta[activePoint.quadrant].tagline}
              </div>

            </div>
          ) : (
            <div className="p-6 rounded-2xl glass-panel text-center text-xs text-stone-500 space-y-2">
              <Info className="w-5 h-5 mx-auto text-indigo-400" />
              <p>Click any point on the matrix to see specific advice.</p>
            </div>
          )}

          {/* Quick Guidance Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 border border-indigo-500/20 text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2.5">
            <Eye className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-stone-900 dark:text-white mb-0.5">Rule of Thumb:</strong>
              <span>If your choice falls in <strong>Stop & Verify 🔴</strong>, never leap immediately. Turn it into a <strong>Quick Experiment 🟢</strong> by running a 24-hour test first.</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
