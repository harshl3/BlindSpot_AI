# BlindSpot AI — Strategic Decision & Risk Intelligence Platform

> **AI-powered cognitive decision partner** that uncovers unstated assumptions, flags overlooked risks, stress-tests ideas, and simulates failure modes — **in clear, simple language without ever deciding for you.**

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.2-brightgreen.svg?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-blindspot__db-47A248.svg?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![Google Gemini AI](https://img.shields.io/badge/Google%20Gemini-3.5%20Flash%20Lite-4285F4.svg?style=flat-square&logo=google)](https://ai.google.dev/)
[![React 19](https://img.shields.io/badge/React-19.x-61DAFB.svg?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase Auth](https://img.shields.io/badge/Firebase%20Auth-Google%20Sign--In-FFCA28.svg?style=flat-square&logo=firebase)](https://firebase.google.com/)

---

## 📌 Table of Contents
1. [What is BlindSpot?](#-what-is-blindspot)
2. [Why BlindSpot is Different](#-why-blindspot-is-different)
3. [Architecture & System Flow](#-architecture--system-flow)
4. [Core Features & User Workflows](#-core-features--user-workflows)
5. [Tech Stack Breakdown](#-tech-stack-breakdown)
6. [Project Structure](#-project-structure)
7. [Getting Started (Step-by-Step)](#-getting-started-step-by-step)
8. [API Endpoints Reference](#-api-endpoints-reference)
9. [Security & Isolation Model](#-security--isolation-model)
10. [Automated Testing & Build Verification](#-automated-testing--build-verification)
11. [Roadmap & Future Enhancements](#-roadmap--future-enhancements)

---

## 💡 What is BlindSpot?

When leaders, engineers, and founders make high-stakes choices, they naturally focus on what is salient first: expected upsides, immediate convenience, and best-case timelines. In doing so, critical failure points are overlooked:
- **Hidden assumptions** treated as absolute facts without proof.
- **Second-order consequences** that surface 6–18 months down the road.
- **Evidence gaps** that would reverse the choice if investigated early.

**BlindSpot** acts as your objective thinking partner. It breaks down any strategic dilemma into an actionable, 8-part risk analysis, stress-tests your reasoning with constructive counter-arguments, and simulates what could go wrong before you commit time, money, and reputation.

---

## 🎯 Why BlindSpot is Different

| Traditional AI Tools | BlindSpot Philosophy |
| :--- | :--- |
| **Makes the choice for you:** Tells you *"You should choose Option B"*. | **Preserves your agency:** Refuses to decide. Lays out trade-offs so **you** make the best informed call. |
| **Fake Precision Numbers:** Gives pseudo-scientific "87% Success Probability". | **Real Qualitative Insights:** Pinpoints specific assumptions, risks, and early warning tripwires. |
| **Dense Academic Jargon:** Uses confusing words like *"epistemic heuristic fragility"*. | **Simple, Clear English:** Written in plain, punchy language anyone can understand in 2 minutes. |
| **Echo Chamber:** Agreeably validates whatever you already wanted to believe. | **Constructive Tough Critic:** Actively stress-tests ideas and simulates failure modes. |

---

## 🏛 Architecture & System Flow

BlindSpot uses a modern, decoupled production architecture combining a reactive React frontend with a secure Java 21 / Spring Boot REST backend:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React 19 + TypeScript Frontend                  │
│               (Vite 8, Tailwind v4, Lucide Icons, Canvas Confetti)     │
└───────────────┬────────────────────────────┬───────────────────────────┘
                │                            │
      Google Sign-In / ID Tokens             │ REST API Calls (/api/*)
                ▼                            ▼
┌──────────────────────────────┐ ┌───────────────────────────────────────┐
│     Firebase Authentication  │ │      Spring Boot 3.4 (Java 21)        │
│    (Google Sign-In / Auth)   │ │       REST Security & Controllers     │
└──────────────────────────────┘ └───────┬───────────────────────┬───────┘
                                         │                       │
                       Multi-Model Fallback & Prompts    Spring Data MongoDB
                                         ▼                       ▼
                         ┌───────────────────────┐ ┌─────────────────────┐
                         │   Google Gemini API   │ │    MongoDB Atlas    │
                         │ (gemini-3.5-flash-lite│ │   (blindspot_db     │
                         │  / flash-lite-latest) │ │    decisions col)   │
                         └───────────────────────┘ └─────────────────────┘
```

---

## ✨ Core Features & User Workflows

### 1. Multi-Stage Decision Framing
- **Decision Statement**: Plain-English dilemma ($\ge 5$ characters).
- **Context & Constraints**: Background facts, deadlines, budget, and team bandwidth.
- **Options Under Consideration**: At least 2 distinct paths to evaluate.
- **What Matters Most**: Your core priorities (e.g., velocity, runway, team morale).
- **Preliminary Leaning**: What you currently think you might choose.

### 2. 8-Section BlindSpot Analysis Report
Submitting the decision generates a structured, plain-English breakdown:
1. **Decision Snapshot**: Clear 2–3 sentence overview of the dilemma and stated priorities.
2. **Hidden Assumptions**: Unverified guesses you might be taking for granted.
3. **Overlooked Blind Spots**: Subtle dependencies or surprises that could derail execution.
4. **Risks & Failure Modes**: Concrete drawbacks, early warning signs, and practical mitigations.
5. **Alternative Perspectives**: How cautious teammates, future stakeholders, or end-users view this choice.
6. **Questions Worth Asking**: High-leverage questions that force honest trade-offs.
7. **Evidence Checklist**: Crucial missing information to check before signing off.
8. **Reflection Prompt**: An open question to help reframe your perspective.

### 3. Decision Balance & Risk Map (Interactive Radar Graph)
- Smooth, jitter-free SVG radar visualizer evaluating:
  - **Untested Assumptions** (%)
  - **Potential Downside** (%)
  - **Difficulty to Reverse** (%)
  - **Solid Evidence** (%)
  - **Diverse Viewpoints** (%)
- Accompanied by the **Thinking Pitfalls Index** (Over-Optimism, Rushing to Act, Confirmation Bias) and actionable takeaways.

### 4. Stress-Test Assumptions (Constructive Tough Critic)
- Pokes holes in your favorite option constructively.
- Identifies the single weakest link in your plan and explores what happens if you choose the opposite path.

### 5. Future Failure Simulation (What If It Fails?)
- Fast-forwards 3, 6, 12 months or 3 years into the future.
- Tells a realistic story of how the plan hit obstacles and lists specific early warning signs to watch for in Month 1–2.

### 6. Cloud Decision History & Reflections
- Record personal reflections and final takeaways.
- Automatically synced to **MongoDB Atlas** (`blindspot_db`) under user-scoped security, with instant local offline fallback.

---

## 🛠 Tech Stack Breakdown

### Frontend (`/frontend`)
- **React 19** & **TypeScript 5.x**: Declarative, strictly-typed UI.
- **Vite 8**: Sub-second Hot Module Replacement (HMR) and optimized build bundling.
- **Tailwind CSS v4**: Modern utility-first styling with native dark mode support.
- **Lucide React**: Clean, modern iconography.
- **Canvas Confetti**: Engaging micro-animations upon saving reflections.
- **Vitest**: Blazing-fast unit and component test runner.

### Backend (`/backend`)
- **Java 21 LTS**: Modern Java features (records, virtual threads readiness, pattern matching).
- **Spring Boot 3.4.2**: Production-grade REST backend framework.
- **Spring Data MongoDB**: Resilient MongoDB Atlas connectivity, auditing, and indexing.
- **Jakarta Validation**: Robust validation rules on incoming payloads.
- **Spring Web RestClient**: Non-blocking, timeout-protected HTTP client for Gemini API.
- **Auth0 JWKS-RSA & Java JWT**: Cryptographic verification of Firebase ID tokens against Google JWKS.
- **Apache Maven 3.9 & Maven Wrapper**: Reproducible, platform-independent build automation.

### Cloud & AI Infrastructure
- **Google Gemini API**: Fast cognitive processing using `gemini-3.5-flash-lite` and `gemini-flash-lite-latest`.
- **MongoDB Atlas**: Managed multi-cloud database (`blindspot_db`, collection `decisions`).
- **Firebase Authentication**: Seamless Google Sign-In and anonymous guest tokens.

---

## 📂 Project Structure

```
BlindSpot AI SpringB/
├── backend/                                # Spring Boot 3.4 (Java 21) Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/blindspot/
│   │   │   │   ├── config/                 # MongoConfig, WebConfig (CORS)
│   │   │   │   ├── controller/             # AnalysisController, DecisionHistoryController, HealthController
│   │   │   │   ├── dto/                    # Request & Response Records (Analysis, Challenge, Premortem)
│   │   │   │   ├── model/                  # MongoDB DecisionDocument entity
│   │   │   │   ├── repository/             # DecisionRepository (Spring Data MongoDB)
│   │   │   │   └── service/                # GeminiService, DecisionHistoryService, FirebaseAuthService
│   │   │   └── resources/
│   │   │       ├── application.yml         # MongoDB Atlas, Gemini models, Firebase configs
│   │   └── test/java/com/blindspot/        # 14 comprehensive unit & WebMvc integration tests
│   ├── pom.xml                             # Maven build configuration & dependencies
│   ├── mvnw & mvnw.cmd                     # Official Apache Maven Wrapper
│   ├── .env.example                        # Example backend configuration template
│   └── .env                                # Backend environment secrets (gitignored)
│
├── frontend/                               # React 19 + TypeScript Frontend
│   ├── src/
│   │   ├── components/                     # AnalysisReport, CognitiveRadarGraph, DecisionWorkspace, etc.
│   │   ├── context/                        # ThemeContext (Dark / Light mode)
│   │   ├── services/                       # api.ts (Spring Boot REST client), firebase.ts (Auth)
│   │   ├── types/                          # Decision & Report TypeScript contracts
│   │   └── tests/                          # 11 Vitest automated test suites
│   ├── package.json                        # Frontend dependencies & scripts
│   ├── vite.config.ts                      # Vite dev server & backend reverse proxy
│   ├── .env.example                        # Example frontend public config template
│   └── .env                                # Frontend public client configs (gitignored)
│
├── .gitignore                              # Comprehensive root repository gitignore
├── DEVELOPER_GUIDE.md                      # Comprehensive developer & architectural guide
└── README.md                               # Project documentation (this file)
```

---

## 🚀 Getting Started (Step-by-Step)

### Prerequisites
- **Java 21+** (`java -version`)
- **Node.js 18+** (`node -v`)
- **npm** or **pnpm**

---

### Step 1: Configure & Start the Spring Boot Backend

Open a terminal in the `backend` folder:

```powershell
cd backend

# Create your local environment file from the example
cp .env.example .env

# Edit .env with your Gemini API key and MongoDB Atlas connection string
# Then run the backend application (Maven Wrapper will automatically use Java 21+):
.\mvnw.cmd spring-boot:run
```

The backend boots at `http://localhost:8080`.  
You will see:
```
[BlindspotApplication] Loaded environment properties from .../backend/.env
🔑 Gemini AI initialized with candidate models. Primary: gemini-3.5-flash-lite
MongoDB: Connected to blindspot_db
Tomcat started on port 8080 (http)
```

---

### Step 2: Start the React Frontend

Open a second terminal in the frontend directory:

```powershell
cd frontend

# 1. Install dependencies (if first time)
npm install

# 2. Start the Vite development server (proxies /api to http://localhost:8080)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Service health, Gemini readiness, and timestamp | No |
| `POST` | `/api/analyze` | Generates 8-section BlindSpot analysis report | No |
| `POST` | `/api/challenge` | Generates stress-test counter-arguments | No |
| `POST` | `/api/premortem` | Simulates a future failure scenario | No |
| `GET` | `/api/decisions` | Retrieves user-scoped decision history | Token or Session |
| `POST` | `/api/decisions` | Saves decision and reflection to MongoDB Atlas | Token or Session |
| `DELETE` | `/api/decisions/{id}`| Deletes decision owned by current user | Token or Session |
| `GET` | `/api/decisions/db-health` | Diagnostic ping verifying MongoDB connection | No |

---

## 🔒 Security & Isolation Model

1. **Zero Gemini Key Leakage**:
   - `GEMINI_API_KEY` is loaded strictly on the Spring Boot server. Browser bundles contain zero AI keys.
2. **Cryptographic Firebase Token Verification**:
   - Every protected persistence request forwards `Authorization: Bearer <idToken>`. Spring Boot cryptographically validates the token against Google's public JWKS keys.
3. **User-Scoped Database Isolation**:
   - Decision records are tagged with `userId` and indexed in MongoDB Atlas. Users cannot read or delete records belonging to another user.
4. **Input Validation & Guardrails**:
   - Jakarta Bean Validation enforces minimum length bounds ($\ge 5$ characters, min 2 options) to protect against malformed payloads and prompt injection.

---

## 🧪 Automated Testing & Build Verification

### Backend Tests (Spring Boot + JUnit 5 + MockMvc)
```powershell
cd backend
.\mvnw.cmd test
```
- Tests cover `AnalysisControllerTest`, `DecisionHistoryControllerTest`, `GeminiServiceTest`, and `HealthControllerTest`.

### Frontend Tests (Vitest)
```powershell
cd frontend
npm run test
```
- Tests cover decision validation, AI response parsing, and local/cloud persistence.

### Production Build Verification
```powershell
# Frontend production bundle
cd frontend
npm run build

# Backend production executable JAR
cd ../backend
.\mvnw.cmd package -DskipTests
```

---

## 🌟 Roadmap & Future Enhancements

Here are high-impact enhancements planned for upcoming releases:

1. **Team Decision Rooms (Collaborative BlindSpot)**:
   - Invite co-founders or team members via a shareable link to vote on assumptions anonymously before meetings.
2. **Outcome Tracking ("What Actually Happened?")**:
   - Automated 3-month or 6-month check-in prompt to see if early warning signs occurred, creating a personal learning feedback loop.
3. **One-Click Executive Memo Export**:
   - Export analysis reports to beautifully formatted PDF or Notion-ready Markdown for leadership meetings.
4. **Side-by-Side Scenario Comparison Matrix**:
   - Compare Option A vs. Option B across specific trade-off dimensions (reversibility, upfront investment, risk level).
5. **Voice-to-Decision Input**:
   - Dictate decisions naturally; AI automatically structures speech into Decision, Context, Options, and Priorities.
6. **Slack & Microsoft Teams Integration**:
   - Type `/blindspot [dilemma]` in team chat for an instant 60-second blind spot summary before finalizing decisions.

---

## 📄 License
This project is licensed under the MIT License — see the LICENSE file for details.

