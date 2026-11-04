

import React, { useState } from "react";
import {
  Radar,
  Activity,
  Layers,
  Info,
  ChevronRight
} from "lucide-react";
import type { BlindSpotAnalysis, DecisionInput } from "../types/decision";

interface CognitiveRadarGraphProps {
  analysis: BlindSpotAnalysis;
  decisionInput: DecisionInput;
}

export const CognitiveRadarGraph: React.FC<CognitiveRadarGraphProps> = ({
  analysis,
  decisionInput
}) => {
  const [activeDimension, setActiveDimension] = useState<number | null>(null);

  // Compute dynamic dimensions based on analysis content
  const assumptionCount = analysis.assumptions.length;
  const highFragilityCount = analysis.assumptions.filter(
    (a) => a.confidence?.toLowerCase() === "low" || a.confidence?.toLowerCase() === "medium"
  ).length;

  // Dimension 1: Assumption Fragility (higher = more fragile assumptions)
  const assumptionFragility = Math.min(92, Math.max(38, Math.round((highFragilityCount / Math.max(1, assumptionCount)) * 100)));

  // Dimension 2: Reversibility Risk (heuristics from options and context)
  const isHighStakes = (decisionInput.decision + decisionInput.context).toLowerCase().match(/hire|fire|monolith|rewrite|quit|migrate|seed|invest|partner/);
  const reversibilityRisk = isHighStakes ? 78 : 45;

  // Dimension 3: Evidence Solidity (how many verification steps exist)
  const evidenceSolidity = Math.min(88, Math.max(32, Math.round(100 - (analysis.evidenceGaps.length * 14))));

  // Dimension 4: Downside Exposure (number of risks and severe impacts)
  const downsideExposure = Math.min(94, Math.max(40, Math.round((analysis.risks.length * 18) + 20)));

  // Dimension 5: Perspective Breadth (stakeholder diversity)
  const perspectiveBreadth = Math.min(90, Math.max(45, Math.round(analysis.perspectives.length * 28)));

  const dimensions = [
    {
      name: "Untested Assumptions",
      score: assumptionFragility,
      description: "How much of your plan relies on unverified guesses or best-case hopes.",
      color: "#6366f1", // Indigo
      label: `${assumptionFragility}% Fragility`
    },
    {
      name: "Potential Downside",
      score: downsideExposure,
      description: "The seriousness of possible risks, complications, or failure modes.",
      color: "#f59e0b", // Amber
      label: `${downsideExposure}% Risk Focus`
    },
    {
      name: "Hard to Reverse",
      score: reversibilityRisk,
      description: "How difficult or costly it would be to undo this choice if things don't work out.",
      color: "#ec4899", // Pink
      label: `${reversibilityRisk}% Commitment`
    },
    {
      name: "Solid Evidence",
      score: evidenceSolidity,
      description: "How much real-world data and verified facts back up your preferred option.",
      color: "#10b981", // Emerald
      label: `${evidenceSolidity}% Verified`
    },
    {
      name: "Diverse Viewpoints",
      score: perspectiveBreadth,
      description: "How many different team, customer, and stakeholder angles have been considered.",
      color: "#8b5cf6", // Purple
      label: `${perspectiveBreadth}% Multi-Angle`
    }
  ];

  // SVG Radar Coordinates Setup
  const centerX = 160;
  const centerY = 150;
  const maxRadius = 100;
  const numSides = dimensions.length;

  // Helper to calculate coordinates
  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 / numSides) * index - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y };
  };

  // Generate polygon points string for data
  const dataPoints = dimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.score);
      return `${x},${y}`;
    })
    .join(" ");

  // Grid level polygons (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // Thinking Trap items with friendly, accessible wording
  const cognitiveTraps = [
    {
      name: "Over-Optimism (Best-Case Thinking)",
      percentage: Math.min(85, assumptionFragility + 6),
      impact: "Assuming things will go smoothly while underestimating setup time and hiccups",
      color: "from-indigo-500 to-purple-500"
    },
    {
      name: "Rushing to Act (Action Bias)",
      percentage: Math.min(90, downsideExposure - 4),
      impact: "Urge to finalize quickly before verifying key facts or asking hard questions",
      color: "from-amber-500 to-orange-500"
    },
    {
      name: "Confirmation Bias (Cherry-Picking)",
      percentage: Math.min(75, 100 - evidenceSolidity),
      impact: "Giving extra weight to signals that confirm what you already wanted to believe",
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100/60 dark:border-stone-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
            <Radar className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black font-heading text-stone-900 dark:text-white flex items-center gap-2">
              <span>Decision Balance & Risk Map</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                Visual Snapshot
              </span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              A quick visual map showing where your decision is solid vs. where it needs care.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100/80 dark:bg-stone-800/80 text-xs text-stone-600 dark:text-stone-300 font-semibold self-start sm:self-auto">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span>Decision Balance Overview</span>
        </div>
      </div>

      {/* Main Dual-Column Graph Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

        {/* Left: SVG Radar Chart */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-2 sm:p-4 rounded-2xl glass-card-indigo relative">
          <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">

            <svg
              viewBox="0 0 320 300"
              className="w-full h-full overflow-visible drop-shadow-md"
              aria-label="Cognitive Radar Chart"
            >
              <defs>
                <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#a855f7" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.25" />
                </linearGradient>
                <radialGradient id="radarCenterGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Center Glow */}
              <circle cx={centerX} cy={centerY} r={maxRadius * 0.9} fill="url(#radarCenterGlow)" />

              {/* Concentric Polygonal Background Grids */}
              {gridLevels.map((lvl, idx) => {
                const pts = dimensions
                  .map((_, i) => {
                    const angle = (Math.PI * 2 / numSides) * i - Math.PI / 2;
                    const r = lvl * maxRadius;
                    return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
                  })
                  .join(" ");
                return (
                  <polygon
                    key={idx}
                    points={pts}
                    fill={idx % 2 === 0 ? "rgba(99, 102, 241, 0.03)" : "none"}
                    stroke="currentColor"
                    className="text-indigo-200/60 dark:text-stone-700/60"
                    strokeWidth="1"
                    strokeDasharray={idx < 3 ? "3 3" : undefined}
                  />
                );
              })}

              {/* Radial Spokes from Center */}
              {dimensions.map((_, idx) => {
                const angle = (Math.PI * 2 / numSides) * idx - Math.PI / 2;
                const endX = centerX + maxRadius * Math.cos(angle);
                const endY = centerY + maxRadius * Math.sin(angle);
                return (
                  <line
                    key={idx}
                    x1={centerX}
                    y1={centerY}
                    x2={endX}
                    y2={endY}
                    stroke="currentColor"
                    className="text-indigo-200/70 dark:text-stone-700/70"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Colored Radar Data Area */}
              <polygon
                points={dataPoints}
                fill="url(#radarFill)"
                stroke="#6366f1"
                strokeWidth="2.5"
                className="transition-all duration-500 ease-out"
              />

              {/* Interactive Vertex Nodes with stable hit-testing to prevent hover jitter */}
              {dimensions.map((dim, idx) => {
                const { x, y } = getCoordinates(idx, dim.score);
                const isHovered = activeDimension === idx;

                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveDimension(idx)}
                    onMouseLeave={() => setActiveDimension(null)}
                    onClick={() => setActiveDimension(prev => prev === idx ? null : idx)}
                  >
                    {/* Invisible expanded hit circle to prevent hover vibration */}
                    <circle
                      cx={x}
                      cy={y}
                      r={18}
                      fill="transparent"
                      className="cursor-pointer"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 7 : 5}
                      fill={dim.color}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-transform duration-150 drop-shadow-md pointer-events-none"
                    />
                  </g>
                );
              })}

              {/* Axis Label Tags positioned around polygon */}
              {dimensions.map((dim, idx) => {
                const angle = (Math.PI * 2 / numSides) * idx - Math.PI / 2;
                const labelDist = maxRadius + 28;
                const lx = centerX + labelDist * Math.cos(angle);
                const ly = centerY + labelDist * Math.sin(angle);
                const isHovered = activeDimension === idx;

                return (
                  <text
                    key={idx}
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={`text-[11px] font-bold transition-colors cursor-pointer select-none ${isHovered
                        ? "fill-indigo-600 dark:fill-indigo-400 font-extrabold"
                        : "fill-stone-700 dark:fill-stone-300"
                      }`}
                    onClick={() => setActiveDimension(prev => prev === idx ? null : idx)}
                    onMouseEnter={() => setActiveDimension(idx)}
                    onMouseLeave={() => setActiveDimension(null)}
                  >
                    {dim.name}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Interactive Vertex Explainer with fixed height to prevent layout shift */}
          <div className="w-full mt-3 p-3 rounded-xl bg-white/70 dark:bg-stone-900/70 border border-indigo-100 dark:border-stone-800 text-center text-xs min-h-[64px] flex flex-col items-center justify-center">
            {activeDimension !== null ? (
              <div className="space-y-0.5 animate-in fade-in">
                <span className="font-bold text-stone-900 dark:text-white" style={{ color: dimensions[activeDimension].color }}>
                  {dimensions[activeDimension].name}: {dimensions[activeDimension].label}
                </span>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                  {dimensions[activeDimension].description}
                </p>
              </div>
            ) : (
              <span className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-500" />
                <span>Tap or hover any point on the map to explore each factor</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Thinking Pitfall Distribution Bars */}
        <div className="lg:col-span-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Common Thinking Pitfalls to Watch For</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              Natural human tendencies that could mislead you in this decision:
            </p>
          </div>

          <div className="space-y-3.5">
            {cognitiveTraps.map((trap, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl glass-panel space-y-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-stone-900 dark:text-white">{trap.name}</span>
                  <span className="text-stone-600 dark:text-stone-300 font-mono text-[11px] bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">
                    {trap.percentage}% tendency
                  </span>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${trap.color} transition-all duration-700`}
                    style={{ width: `${trap.percentage}%` }}
                  />
                </div>

                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                  {trap.impact}
                </p>
              </div>
            ))}
          </div>

          {/* Quick takeaway chip */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/20 text-xs text-stone-700 dark:text-stone-300 flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Key Takeaway:</strong> Testing your main assumption before committing will save you time and cut risk by ~{Math.round(assumptionFragility * 0.7)}%.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
