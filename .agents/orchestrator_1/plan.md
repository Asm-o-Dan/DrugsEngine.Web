# Project Plan: DrugsEngine Frontend Website

## Overview
Build a modern, production-grade Next.js 15 frontend web application for the DrugsEngine platform adhering to the full cross-functional development workflow.

## Phase Breakdown

### Phase 1: Team Lead, Kanban, UX/UI Design & API Contracts (R1, R2, R3)
1. Explorer & Spec Miner survey of existing DrugsEngine backend APIs (C#, Python, Qdrant, Kafka, PostgreSQL endpoints) and architecture.
2. Team Lead initializes `KANBAN.md` with stories, acceptance criteria, assignees, and columns [Backlog, Design & Specs, API Ready, In Progress (FE), QA & Testing, Done].
3. UX/UI Designer creates design specifications:
   - Slate + Emerald design system (light/dark mode)
   - Component hierarchy, state machines, and UX flow for 4 core modules:
     * Universal Smart Search (Exact + Semantic Qdrant with 300ms debounce)
     * Drug Details & Qdrant Vector Analogs Card (similarity %, price comparison)
     * Pharmacy Map & Stock Overview (interactive availability)
     * System Observability & Telemetry Dashboard (.NET, Kafka, Qdrant, Postgres)
4. API Designer creates OpenAPI 3.1 contract (`openapi.json`) and TypeScript interfaces (`contracts.ts`).
5. Team Lead conducts design & contract review and signs off.

### Phase 2: Frontend Architecture & Foundation Setup (R4)
1. Initialize Next.js 15 App Router project in `C:\DrugEngine\DrugsEngine.Web`.
2. Configure Tailwind CSS, shadcn/ui components, Lucide icons, theme provider (dark/light Slate + Emerald).
3. Set up mock API service / client integration adhering to `contracts.ts`.

### Phase 3: Core UI Modules Implementation (R4)
1. Universal Smart Search Screen & Component with 300ms debounce, query type toggling, and fast autocomplete.
2. Drug Details & Qdrant Vector Analogs Card with similarity percentages, pricing delta, and active substance breakdown.
3. Pharmacy Map & Stock Overview with interactive filtering, stock status badges, and store location cards.
4. System Observability & Telemetry Dashboard with live latency charts, Kafka topic metrics, Qdrant vector count, and health status indicators.
5. Navigation header, responsive mobile drawer, footer, and error boundaries.

### Phase 4: QA Validation & E2E Verification (R5)
1. Component unit & integration verification.
2. Contract validation & error boundary testing (network error, empty states, 404, fallback data).
3. Production build verification (`npm run build`).

### Phase 5: Git Delivery & Release Signoff (R6)
1. Git branch creation: `feature/drugsengine-web-ui`.
2. Stage and commit all files with conventional commit messages.
3. Update `KANBAN.md` with all tasks moved to Done.
4. Final completion summary and reporting.
