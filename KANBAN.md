# DrugsEngine — Project Kanban Board

> **Project**: DrugsEngine Web Frontend Platform  
> **Repository**: `feature/drugsengine-web-ui`  
> **Last Updated**: 2026-08-27T23:12:00Z  
> **Release Delivery Engineer**: Git & Release Delivery Engineer (`worker_m5_1`)

---

## 📊 Board Overview & WIP Limits

| Column | WIP Limit | Active Tasks | DoD Gate |
| :--- | :---: | :---: | :--- |
| **Backlog** | ∞ | 0 | User story formulated with SMART criteria and acceptance checklist |
| **Design & Specs** | 3 | 0 | UX/UI specs documented, tokenized, and reviewed |
| **API Ready** | 3 | 0 | OpenAPI 3.1 schema validated, TypeScript types exported in `contracts.ts` |
| **In Progress (FE)** | 4 | 0 | Code written against specs & contracts, unit tests passing |
| **QA & Testing** | 6 | 0 | Zero-error build (`npm run build`), all 5 UI states tested, responsive check |
| **Done** | ∞ | 13 | Code merged into `feature/drugsengine-web-ui`, signed off by Team Lead |

---

## 📋 Kanban Columns

### 🗄️ 1. Backlog
*(All user stories completed and delivered)*

---

### 🎨 2. Design & Specs (WIP: 0 / Limit: 3)
*(No active tasks — M1 Design Specs completed and signed off)*

---

### ⚡ 3. API Ready (WIP: 0 / Limit: 3)
*(All API contracts formulated, validated, and implemented in mock engine)*

---

### 💻 4. In Progress (FE) (WIP: 0 / Limit: 4)
*(All frontend components implemented across all modules)*

---

### 🧪 5. QA & Testing (WIP: 0 / Limit: 6)
*(All QA checks, contract audits, type checks, and production builds completed successfully)*

---

### ✅ 6. Done

#### [US-01] UX/UI Design Specifications & Theme System
- **ID**: `US-01`
- **Milestone**: `M1`
- **Priority**: `P0 (Critical)`
- **Assignee**: `Lead UI/UX Designer`
- **Completed**: `2026-08-27`
- **Description**: Comprehensive UX/UI design system (Slate + Emerald, Dark/Light modes), typography, layout tokens, and 4 core screen state machines documented in `design_specs.md`.
- **Signoff**: Approved by Team Lead in `design_approval.md`.

#### [US-02] OpenAPI 3.1 & TypeScript Contract Definition
- **ID**: `US-02`
- **Milestone**: `M1`
- **Priority**: `P0 (Critical)`
- **Assignee**: `API Engineer & Architect`
- **Completed**: `2026-08-27`
- **Description**: Formal OpenAPI 3.1 spec (`contracts/openapi.json`) and shared TypeScript interfaces (`contracts/contracts.ts`) for Search, Drugs, Analogs, Pharmacies, and Telemetry with strict RFC 7807 problem details.
- **Signoff**: Exported to both root `contracts/` and `DrugsEngine.Web/contracts/`.

#### [US-03] Kanban Board & Project Decomposition
- **ID**: `US-03`
- **Milestone**: `M1`
- **Priority**: `P0 (Critical)`
- **Assignee**: `Team Lead`
- **Completed**: `2026-08-27`
- **Description**: Initialized `KANBAN.md` with 6 standard columns, decomposed user stories across M1-M5, WIP limits, and DoD gates.

#### [US-04] Next.js 15 App Router Web Foundation & Shell
- **ID**: `US-04`
- **Milestone**: `M2`
- **Priority**: `P0 (Critical)`
- **Assignee**: `Frontend Architect`
- **Completed**: `2026-08-27`
- **Description**: Initialized Next.js 15 App Router project structure with TypeScript, Tailwind CSS, Lucide icons, responsive navigation header, theme toggle, and showcase home page.

#### [US-05] Tailwind Slate + Emerald Theme & UI Primitives Library
- **ID**: `US-05`
- **Milestone**: `M2`
- **Priority**: `P0 (Critical)`
- **Assignee**: `Frontend Architect`
- **Completed**: `2026-08-27`
- **Description**: Configured Tailwind CSS design tokens matching `design_specs.md` and implemented modular UI primitives (`Button`, `Card`, `Badge`, `Input`).

#### [US-06] Resilient Mock API Engine & SWR/Data Fetching Adapter
- **ID**: `US-06`
- **Milestone**: `M2`
- **Priority**: `P0 (Critical)`
- **Assignee**: `API & Frontend Engineer`
- **Completed**: `2026-08-27`
- **Description**: Implemented realistic pharmaceutical mock dataset (9 drugs, 6 Moscow pharmacies, system telemetry) and 11 Next.js App Router API Route Handlers in `app/api/v1/` with isomorphic fallback client in `lib/apiClient.ts`.

#### [US-07] Universal Smart Search Screen (Exact + Semantic Qdrant AI)
- **ID**: `US-07`
- **Milestone**: `M3`
- **Priority**: `P0 (Critical)`
- **Assignee**: `Senior Frontend Developer`
- **Estimate**: `5 SP`
- **Completed**: `2026-08-27`
- **Description**: Implement main search interface with 300ms debounced input, Exact vs Semantic AI toggle, category filter badges, auto-suggest, and result cards.
- **Acceptance Criteria**:
  - [x] 300ms debounce on input changes to prevent search spam (`components/search/SearchBar.tsx`)
  - [x] Toggle switch between "Exact Match" (Trigram BM25) and "Semantic AI" (Qdrant) with visual icon indicators
  - [x] Filter pills for dosage form, prescription (Rx/OTC), manufacturer, and price sorting (`components/search/FilterPanel.tsx`)
  - [x] Full 5-state hierarchy: Idle (tags & recommendations), Loading (pulsing skeletons), Error (retry button), Empty (smart suggestions + semantic toggle), Success (result grid with pagination)
  - [x] Drug cards with title, active substance, price range, match score badge (e.g. 98% Match), and direct links to details and pharmacy locator (`components/search/SearchResults.tsx`, `app/search/page.tsx`)

#### [US-08] Drug Details & Qdrant Vector Analogs Card
- **ID**: `US-08`
- **Milestone**: `M3`
- **Priority**: `P0 (Critical)`
- **Assignee**: `Senior Frontend Developer`
- **Estimate**: `5 SP`
- **Completed**: `2026-08-27`
- **Description**: Build dynamic drug details page (`/drug/[id]`) showing chemical information, ATC hierarchy, indications, and interactive vector analogs matching card with similarity %.
- **Acceptance Criteria**:
  - [x] Comprehensive drug overview with trade name, generic name, active substance, ATC code, manufacturer, country, and dosage (`components/drugs/DrugHeader.tsx`)
  - [x] Interactive tabbed details: Overview, Pharmacology & Mechanism, Indications & Contraindications, Dosage & Administration, Side Effects (`components/drugs/PharmacologyTabs.tsx`)
  - [x] Vector Analogs section with similarity threshold filter (>70%, >80%, >90%, >95%) and in-stock toggle
  - [x] Analog cards displaying Qdrant Cosine Similarity Badge (e.g. `98.5% Match`), Price Comparison Delta (`-25% Cheaper (80 ₽)`), and direct action to view pharmacies (`components/drugs/VectorAnalogsCard.tsx`)
  - [x] Side-by-side comparison table comparing active substance, manufacturer, similarity %, price delta, and stock (`components/drugs/AnalogsComparisonTable.tsx`, `app/drug/[id]/page.tsx`)
  - [x] Full 5-state handling: Idle, Loading skeleton, Error 404 with retry, Empty (threshold adjustment prompt), Success

#### [US-09] Pharmacy Map & Real-time Stock Overview
- **ID**: `US-09`
- **Milestone**: `M3`
- **Priority**: `P0 (Critical)`
- **Assignee**: `Senior Frontend Developer`
- **Estimate**: `5 SP`
- **Completed**: `2026-08-27`
- **Description**: Build interactive pharmacy locator page (`/pharmacies`) with responsive split view (interactive map canvas + stock list), stock status badges, and reservation modal.
- **Acceptance Criteria**:
  - [x] Interactive map visualization with customized SVG Moscow pharmacy markers and stock color coding (Green: In Stock, Amber: Low Stock, Red: Out of Stock, Sky: On Demand) (`components/pharmacies/PharmacyMap.tsx`)
  - [x] Pharmacy list with real-time distance sorting, address, phone, working hours, and stock count (`components/pharmacies/PharmacyCard.tsx`)
  - [x] Interactive stock reservation dialog with customer details and instant confirmation pickup code generator (`components/pharmacies/ReservationModal.tsx`)
  - [x] "Get Directions" modal with car, transit, and walking route steps (`components/pharmacies/DirectionsModal.tsx`)
  - [x] Radius filter slider/pills (1km, 2km, 5km, 10km, 25km) and drug selector (`components/pharmacies/StockFilter.tsx`, `app/pharmacies/page.tsx`)
  - [x] Full 5-state handling: Idle, Loading, Error, Empty (radius expansion prompt), Success

#### [US-10] System Observability & Telemetry Live Dashboard
- **ID**: `US-10`
- **Milestone**: `M3`
- **Priority**: `P1 (High)`
- **Assignee**: `Senior Frontend Developer`
- **Estimate**: `4 SP`
- **Completed**: `2026-08-27`
- **Description**: Build real-time telemetry dashboard (`/telemetry`) tracking health and latency metrics for .NET API Gateway, Kafka Message Bus, Qdrant Vector Engine, PostgreSQL, and Python AI service.
- **Acceptance Criteria**:
  - [x] 6 live health cards for all microservices (.NET 8, Python AI, Qdrant, Kafka, PostgreSQL, RabbitMQ) with animated status indicators (`components/telemetry/ServiceHealthGrid.tsx`)
  - [x] Real-time KPI gauges: P95 Latency (18.5ms), P99 Latency (112.4ms), RPS (142.5), Kafka consumer lag (0), Qdrant vector count (128,450), error rate (0.02%) (`components/telemetry/MetricsGauges.tsx`)
  - [x] Historical latency timeline chart with SVG visualizer and time range selectors (15m, 1h, 6h, 24h) (`components/telemetry/LatencyChart.tsx`)
  - [x] Live system events stream with severity filter tabs (All, Info, Warning, Error) (`components/telemetry/EventsStream.tsx`)
  - [x] Auto-refresh polling toggle (5s, 10s, 30s, Off) and manual "Refresh Now" trigger (`components/telemetry/RefreshControl.tsx`, `app/telemetry/page.tsx`)
  - [x] Full 5-state handling: Idle, Loading, Error, Empty, Success

#### [US-11] Component State Coverage & Responsive QA Verification
- **ID**: `US-11`
- **Milestone**: `M4`
- **Priority**: `P0 (Critical)`
- **Assignee**: `QA Engineer`
- **Estimate**: `3 SP`
- **Completed**: `2026-08-27`
- **Description**: Validate all 4 core screens across Mobile (375px), Tablet (768px), and Desktop (1440px), testing all 5 states (Idle, Loading, Error, Empty, Success).
- **Acceptance Criteria**:
  - [x] Mobile responsive layout passes without horizontal scroll or broken cards
  - [x] Dark / Light mode visual contrast passes WCAG AA standards
  - [x] All error and empty states have meaningful user guidance and retry actions

#### [US-12] Production Build & TypeScript Strictness Verification
- **ID**: `US-12`
- **Milestone**: `M4`
- **Priority**: `P0 (Critical)`
- **Assignee**: `QA Engineer`
- **Estimate**: `2 SP`
- **Completed**: `2026-08-27`
- **Description**: Verify `npm run build` and `npm run typecheck` execute with zero errors, zero warnings, and 100% type safety.
- **Acceptance Criteria**:
  - [x] `npm run build` generates optimized static/SSR bundles with 0 compilation errors
  - [x] TypeScript strict mode compiler passes with 0 type errors (`npx tsc --noEmit`)
  - [x] Next.js route handlers respond with 200 OK across all 11 endpoints

#### [US-13] Dedicated Git Feature Branch Delivery & Conventional Commits
- **ID**: `US-13`
- **Milestone**: `M5`
- **Priority**: `P0 (Critical)`
- **Assignee**: `Git & Release Delivery Engineer`
- **Estimate**: `2 SP`
- **Completed**: `2026-08-27`
- **Description**: Stage and commit all completed code, contracts, UI components, documentation, and agent reports into a dedicated git branch named `feature/drugsengine-web-ui` with clean conventional commits.
- **Acceptance Criteria**:
  - [x] Branch `feature/drugsengine-web-ui` created and checked out
  - [x] All relevant files (`DrugsEngine.Web/`, `contracts/`, `KANBAN.md`, `PROJECT.md`, `.agents/`) staged and committed
  - [x] Commit messages follow Conventional Commits 1.0.0 specification
  - [x] Verification checks (`git status`, `git log`) confirm a clean repository state

---

## 📈 Metrics Summary

- **Total User Stories**: 13
- **Completed User Stories**: 13
- **In Progress**: 0
- **QA & Testing**: 0
- **Backlog**: 0
- **Completion Rate**: 100%

```
[M1] Specs, Kanban & API Contracts    [████████████████████] 100% (Done)
[M2] Web App Foundation & Setup       [████████████████████] 100% (Done)
[M3] Core Modules Implementation      [████████████████████] 100% (Done)
[M4] QA Verification & Build          [████████████████████] 100% (Done)
[M5] Git Delivery & Signoff           [████████████████████] 100% (Done)
```
