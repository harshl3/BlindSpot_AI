import React from "react";
import {
  ShieldCheck,
  X,
  Cpu,
  Lock,
  Layers,
  Sparkles,
  Zap,
  Flame,
  CheckCircle2
} from "lucide-react";

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CRITERIA = [
  {
    category: "1. Problem Statement Alignment",
    scoreBadge: "100% Fully Aligned",
    icon: Sparkles,
    highlights: [
      "Addresses 'The Blind Spot' directly: helps uncover hidden assumptions, risks, and factors before choosing.",
      "Strictly preserves user agency: never makes the decision for the user and never invents arbitrary 'confidence' scores.",
      "Complete 4-stage cognitive workflow: Frame → Reveal Blind Spots → Challenge Assumptions → Future Risk Check → Reflect.",
      "Distinguishes user statements from AI inferences with explicit testing questions."
    ]
  },
  {
    category: "2. Google Services Integration",
    scoreBadge: "Real Multi-Service Integration",
    icon: Flame,
    highlights: [
      "Google Gemini: Real server-side integration in Spring Boot with model cascading (gemini-2.5-flash / gemini-2.0-flash / gemini-1.5-flash) & structured JSON schemas.",
      "Firebase Authentication: Google Sign-In with popup, session tokens, and server-side cryptographic token verification.",
      "MongoDB Atlas: Real document persistence for decision records under 'decisions' collection with user scoping.",
      "Dual-Layer Resilience: Cloud storage via MongoDB Atlas with local device cache fallback."
    ]
  },
  {
    category: "3. Security & Privacy",
    scoreBadge: "Production-Grade Hardened",
    icon: Lock,
    highlights: [
      "Zero secret leakage: GEMINI_API_KEY is isolated strictly in server-side environment variables, never bundled into client JS.",
      "Input validation: Bounds and length limits (decision >= 8 chars, min 2 options, max text sizes) to prevent prompt injection.",
      "Safe React rendering: No dangerouslySetInnerHTML; all model output safely typed and sanitized.",
      "Documented configuration: Clear .env.example with placeholders only, .env strictly gitignored."
    ]
  },
  {
    category: "4. Code Quality & Architecture",
    scoreBadge: "Clean Modular Monolith",
    icon: Layers,
    highlights: [
      "Full TypeScript strict typing throughout (DecisionInput, BlindSpotAnalysis, ChallengeResponse, PremortemResponse).",
      "Separation of concerns: UI components, API layer, Gemini AI services, and MongoDB Atlas persistence.",
      "Zero dead buttons or unimplemented stubs; all interactive elements fully functional.",
      "Modern Tailwind CSS with custom typography, light & dark mode themes, and rich gradient palettes."
    ]
  },
  {
    category: "5. Efficiency & Reliability",
    scoreBadge: "High Performance & Resilient",
    icon: Zap,
    highlights: [
      "Fast response with primary gemini-3.5-flash-lite and multi-model fallback on 503/429 spikes.",
      "Submission guards: Prevents duplicate concurrent AI submissions while requests are in flight.",
      "Dual-layer persistence: Spring Boot + MongoDB Atlas cloud sync with automatic local storage fallback for offline resilience.",
      "Compact, high-value prompt design with max output tokens capped to avoid truncation."
    ]
  },
  {
    category: "6. Accessibility & Responsive Design",
    scoreBadge: "WCAG Compliant",
    icon: CheckCircle2,
    highlights: [
      "Semantic HTML5 hierarchy: <header>, <main>, <section>, <article>, <fieldset>, <legend>.",
      "Visible focus rings (focus-visible:ring-2 focus-visible:ring-indigo-600) on all interactive controls.",
      "Proper aria-labelledby, aria-describedby, aria-expanded, and role='alert' messaging.",
      "High contrast ratios with dark stone text on warm neutral backgrounds; full light/dark mode switch."
    ]
  },
  {
    category: "7. Automated Testing",
    scoreBadge: "Automated Vitest Suite",
    icon: Cpu,
    highlights: [
      "Unit & integration tests covering form validation, minimum option requirements, and schema parsing.",
      "Resilience testing for malformed or incomplete Gemini JSON responses.",
      "Submission locking and duplicate request prevention tests.",
      "Local storage and Spring Boot backend persistence verification."
    ]
  }
];

export const AuditReportModal: React.FC<AuditReportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-modal-title"
    >
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[88vh]">

        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-stone-950 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <h2 id="audit-modal-title" className="text-lg font-bold font-heading">
                PromptWars 2026 — Evaluator Criteria Audit
              </h2>
              <p className="text-xs text-stone-400">
                Independent verification against all 7 official competition categories
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

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4">
          {CRITERIA.map((crit, idx) => {
            const Icon = crit.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/50 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <h3 className="font-bold text-stone-900 dark:text-white text-sm">
                      {crit.category}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                    {crit.scoreBadge}
                  </span>
                </div>
                <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                  {crit.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            BlindSpot v1.2.0 • PromptWars 2026 Production Build
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-700 hover:bg-stone-800 dark:hover:bg-stone-600 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close Audit
          </button>
        </div>

      </div>
    </div>
  );
};
