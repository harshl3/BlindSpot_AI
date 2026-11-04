import React from "react";
import { Cpu, Briefcase, Rocket, DollarSign } from "lucide-react";
import type { DecisionInput } from "../types/decision";

export interface DecisionPreset {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  data: DecisionInput;
}

export const QUICK_PRESETS: DecisionPreset[] = [
  {
    title: "Tech: Rewrite vs Optimize",
    icon: Cpu,
    tag: "Architecture",
    data: {
      decision: "Should we rewrite our core backend in Go or keep refactoring our Node.js monolith?",
      context: "We have 8 engineers. 2 heavy ingestion endpoints are hitting 800ms latency at peak hours.",
      options: [
        "Rewrite entire backend in Go over the next 6 months",
        "Extract only the 2 slow ingestion endpoints into Go",
        "Keep Node.js monolith and add Redis caching with read-replicas"
      ],
      priorities: "Sub-150ms customer latency without freezing new product features.",
      currentThinking: "Go is faster, but 6 of 8 engineers only know TypeScript."
    }
  },
  {
    title: "Career: Startup vs Big Tech",
    icon: Briefcase,
    tag: "Career",
    data: {
      decision: "Should I accept an early founding engineer role at a Series A startup or stay as Senior SWE at Big Tech?",
      context: "Big Tech offers high stability, 401k, and predictable hours. The startup offers 1.5% equity and autonomy but high burn rate.",
      options: [
        "Accept startup offer with 1.5% equity",
        "Stay at Big Tech and seek internal promotion to Staff",
        "Negotiate part-time advisory at startup while keeping job"
      ],
      priorities: "High learning velocity, long-term wealth upside vs current family stability.",
      currentThinking: "I'm worried I'll regret not taking the startup risk before having kids."
    }
  },
  {
    title: "Product: Launch Fast vs Polish",
    icon: Rocket,
    tag: "Strategy",
    data: {
      decision: "Should we launch our MVP publicly this week or spend 4 more weeks polishing UX and edge cases?",
      context: "Core workflow works but onboarding has rough edges and lacks automated billing.",
      options: [
        "Launch publicly on ProductHunt & X this Thursday with manual billing",
        "Delay launch by 4 weeks to complete slick onboarding and automated stripe flow",
        "Invite 30 private beta users first to collect feedback before public launch"
      ],
      priorities: "Validating genuine buyer demand before burning engineering cycles on perfection.",
      currentThinking: "We fear making a bad first impression if early users encounter bugs."
    }
  },
  {
    title: "Funding: Bootstrap vs Venture",
    icon: DollarSign,
    tag: "Business",
    data: {
      decision: "Should we raise a $1.5M Seed round from VCs or remain bootstrapped and cash-flow positive?",
      context: "Current MRR is $22k growing at 12% MoM. 2 VC term sheets on the table at $9M post-money.",
      options: [
        "Sign the $1.5M VC term sheet to hire 3 engineers and outpace competitors",
        "Decline VC, hire slowly from profits and keep 100% founder equity",
        "Negotiate a smaller $500k angel round to accelerate without VC board control"
      ],
      priorities: "Long-term founder freedom vs capturing market share before incumbents wake up.",
      currentThinking: "Competitors just raised $5M; will they crush our distribution if we stay bootstrapped?"
    }
  }
];

export const SAMPLE_DECISION: DecisionInput = QUICK_PRESETS[0].data;
