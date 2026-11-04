# BlindSpot AI — Frontend Client (React 19 + TypeScript)

> **Modern, reactive decision-reflection workspace powered by Vite, Tailwind CSS, Lucide icons, and Google Firebase Authentication.**

[![React 19](https://img.shields.io/badge/React-19.x-61DAFB.svg?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase Auth](https://img.shields.io/badge/Firebase%20Auth-Google%20Sign--In-FFCA28.svg?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Vitest](https://img.shields.io/badge/Vitest-11%20Passed-10b981.svg?style=flat-square&logo=vitest)](https://vitest.dev/)

---

## 💡 Overview

The BlindSpot AI frontend provides a fluid, responsive user experience for exploring complex decisions:
- **Decision Studio**: Intuitive multi-field framing (decision dilemma, context, options, priorities, and preliminary leaning).
- **Decision Balance & Risk Map**: Interactive SVG radar graph mapping untested assumptions, potential downsides, reversibility, evidence quality, and alternative perspectives with zero edge jitter.
- **Thinking Pitfalls Index**: Visualizes common human cognitive biases (Over-Optimism, Action Bias, Confirmation Bias) detected in the framing.
- **Constructive Stress-Testing**: Constructive tough-critic counterarguments and future failure simulations (What If It Fails?).
- **Dual-Layer Persistence**: Cloud synchronization with the Spring Boot + MongoDB Atlas backend, with instant local storage fallback for offline resilience.
- **Firebase Google Sign-In**: Secure, non-intrusive client-side authentication that forwards cryptographically signed ID tokens to the backend.

---

## 🚀 Running Locally

```powershell
cd frontend

# 1. Install dependencies
npm install

# 2. Start Vite development server (proxies /api to http://localhost:8080)
npm run dev

# 3. Run automated tests
npm run test

# 4. Production build
npm run build
```

---

## 📂 Architecture

- `src/components/`: Modular UI components (`AnalysisReport`, `CognitiveRadarGraph`, `DecisionWorkspace`, `Navbar`, etc.).
- `src/services/api.ts`: Typed REST client calling Spring Boot endpoints (`/api/analyze`, `/api/challenge`, `/api/premortem`, `/api/decisions`).
- `src/services/firebase.ts`: Firebase App initialization and Google Sign-In authentication handlers.
- `src/context/`: Theme context supporting instant dark / light mode toggle.
- `src/types/`: TypeScript interfaces and contracts.
- `tests/`: 11 automated Vitest unit and integration test suites.
