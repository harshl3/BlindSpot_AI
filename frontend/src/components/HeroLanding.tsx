import React from "react";
import {
  Sparkles,
  ArrowRight,
  Eye,
  Lock,
  FlaskConical
} from "lucide-react";

interface HeroLandingProps {
  onExploreDecision: () => void;
  onTryExample: () => void;
  onGoToLab: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  onExploreDecision,
  onTryExample,
  onGoToLab
}) => {
  return (
    <div className="relative overflow-hidden pt-6 pb-16 sm:pt-10 sm:pb-24">
      
      {/* Background ambient gradient glow */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-amber-400/20 blur-3xl pointer-events-none -z-10"
        aria-hidden="true" 
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 text-left space-y-5">
            
            {/* Pill badge without competition branding */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/60 dark:to-purple-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>AI Cognitive Thinking Companion</span>
            </div>

            {/* Hero Heading */}
            <h1 className="text-4xl sm:text-6xl font-black text-stone-900 dark:text-white tracking-tight font-heading leading-[1.08]">
              See what you're <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 dark:from-indigo-400 dark:via-purple-300 dark:to-amber-400 bg-clip-text text-transparent">
                not seeing
              </span>.
            </h1>

            {/* Subheading - punchy and human */}
            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-xl leading-relaxed font-normal">
              We make decisions based on what we notice first. <strong>BlindSpot</strong> spots hidden assumptions, second-order risks, and evidence gaps — <span className="underline decoration-indigo-500 underline-offset-4 font-semibold text-stone-900 dark:text-stone-100">without deciding for you</span>.
            </p>

            {/* Action buttons with rich gradients */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreDecision}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Launch Decision Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onTryExample}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-sm transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Load Quick Demo</span>
              </button>

              <button
                onClick={onGoToLab}
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-2xl text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <FlaskConical className="w-4 h-4 text-amber-500" />
                <span>Thinking Lab Sandbox</span>
              </button>
            </div>

            {/* Clear agency notice */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400 pt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Your decision remains yours. We never assign a score or choose for you.</span>
            </div>
          </div>

          {/* Right Column: Visual Artwork */}
          <div className="lg:col-span-5 relative group">
            <div className="relative rounded-3xl overflow-hidden border border-stone-200/90 dark:border-stone-800 shadow-2xl shadow-indigo-900/15">
              <img
                src="/images/blindspot_perspective.jpg"
                alt="BlindSpot Cognitive Perspective Visual"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent flex items-end p-6">
                <div className="text-white space-y-0.5">
                  <p className="font-bold text-amber-400 text-sm">The Cognitive Aperture</p>
                  <p className="text-stone-300 text-xs">Illuminating unexamined premises and blind spots</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Feature Cards with Second Visual Artwork */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-4 rounded-3xl overflow-hidden glass-panel border border-stone-200/80 dark:border-stone-800 shadow-xl group">
            <img
              src="/images/cognitive_reflection.jpg"
              alt="Cognitive Reflection Visual"
              className="w-full h-48 sm:h-56 object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="p-5 text-left space-y-1">
              <h3 className="font-extrabold text-stone-900 dark:text-white text-sm sm:text-base">
                Intellectual Rigor, Zero Pressure
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                BlindSpot challenges assumptions constructively, probing trade-offs without bias or numerical scores.
              </p>
            </div>
          </div>

          {/* Before vs After Contrast Cards */}
          <div className="lg:col-span-8 glass-panel rounded-3xl p-6 sm:p-7 space-y-4 text-left shadow-xl">
            <div className="flex items-center justify-between border-b border-indigo-100/60 dark:border-stone-800 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>How BlindSpot Reframes Your Thinking</span>
              </h2>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/70 px-2.5 py-1 rounded-full border border-purple-200/60 dark:border-purple-800/60">
                Before vs. After
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl glass-card-amber">
                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase mb-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>What We Notice First</span>
                </div>
                <p className="text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-medium leading-relaxed">
                  "Let's rewrite our entire monolith in Rust right now. It's lightning fast and will fix all our concurrency bugs."
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-2 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Driven by optimism bias and initial salience.
                </p>
              </div>

              <div className="p-4 rounded-2xl glass-card-indigo">
                <div className="flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300 text-xs font-bold uppercase mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>What BlindSpot Spots</span>
                </div>
                <ul className="text-xs text-stone-700 dark:text-stone-300 space-y-1.5">
                  <li>
                    <strong className="text-indigo-900 dark:text-indigo-300 font-bold">Hidden Assumption:</strong> You assume velocity won't drop, though 5 of 6 devs haven't written Rust.
                  </li>
                  <li>
                    <strong className="text-amber-900 dark:text-amber-300 font-bold">Overlooked Risk:</strong> A 9-month feature freeze while competitors ship user features.
                  </li>
                  <li>
                    <strong className="text-emerald-900 dark:text-emerald-300 font-bold">Critical Test:</strong> Have you verified whether DB locks are the bottleneck?
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* 4-Stage Cognitive Journey */}
        <div className="space-y-5 text-center pt-2">
          <div className="space-y-1 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white font-heading">
              The 4-Stage Cognitive Journey
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
              A guided structure built on cognitive reasoning principles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left pt-2">
            
            {/* Stage 1: Indigo */}
            <div className="p-5 rounded-2xl glass-card-indigo hover:scale-[1.02] transition-transform shadow-md">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center mb-3 shadow-md shadow-indigo-600/30">
                1
              </div>
              <h3 className="font-extrabold text-stone-900 dark:text-white text-sm">Frame Decision</h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1.5 leading-relaxed">
                Define the dilemma, choices under review, and core constraints.
              </p>
            </div>

            {/* Stage 2: Purple */}
            <div className="p-5 rounded-2xl glass-card-purple hover:scale-[1.02] transition-transform shadow-md">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-purple-700 text-white font-black text-xs flex items-center justify-center mb-3 shadow-md shadow-purple-600/30">
                2
              </div>
              <h3 className="font-extrabold text-stone-900 dark:text-white text-sm">Uncover Blind Spots</h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1.5 leading-relaxed">
                Identify unproven premises, failure modes, and evidence gaps.
              </p>
            </div>

            {/* Stage 3: Amber */}
            <div className="p-5 rounded-2xl glass-card-amber hover:scale-[1.02] transition-transform shadow-md">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-stone-950 font-black text-xs flex items-center justify-center mb-3 shadow-md shadow-amber-500/30">
                3
              </div>
              <h3 className="font-extrabold text-stone-900 dark:text-white text-sm">Stress-Test Reasoning</h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1.5 leading-relaxed">
                Challenge assumptions and simulate what could go wrong before committing.
              </p>
            </div>

            {/* Stage 4: Emerald */}
            <div className="p-5 rounded-2xl glass-card-emerald hover:scale-[1.02] transition-transform shadow-md">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-700 text-white font-black text-xs flex items-center justify-center mb-3 shadow-md shadow-emerald-600/30">
                4
              </div>
              <h3 className="font-extrabold text-stone-900 dark:text-white text-sm">Reflect & Own</h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1.5 leading-relaxed">
                Synthesize takeaways and make your own empowered decision.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
