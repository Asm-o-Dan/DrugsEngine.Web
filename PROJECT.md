# Project: DrugsEngine Web Frontend

## Architecture
- **Framework**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Design System**: Slate + Emerald (Support for Dark / Light mode toggle), Radix / shadcn-inspired modular UI components, Lucide icons
- **State & Data Fetching**: SWR / TanStack Query pattern, debounced inputs, resilient mock data & live API adapter
- **API Contracts**: OpenAPI 3.1 (`contracts/openapi.json`), TypeScript interface library (`contracts/contracts.ts`)
- **Git Branch**: `feature/drugsengine-web-ui`

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Kanban Project Management | KANBAN.md tracking Backlog, Design & Specs, API Ready, In Progress (FE), QA & Testing, Done | M1 | ORIGINAL_REQUEST |
| 2 | UX/UI Design System & Specs | Design specifications for Slate+Emerald theme, layouts, responsive design, state transitions | M1 | ORIGINAL_REQUEST |
| 3 | OpenAPI 3.1 & TypeScript Contracts | Formal OpenAPI 3.1 specification & TypeScript interfaces for 4 core domains | M1 | ORIGINAL_REQUEST |
| 4 | Web App Foundation & Architecture | Next.js 15 setup, Tailwind config, ThemeProvider, layout, navigation, mock API engine | M2 | ORIGINAL_REQUEST |
| 5 | Universal Smart Search Screen | Exact + Semantic AI (Qdrant) search with 300ms debounce, filter badges, auto-suggest | M3 | ORIGINAL_REQUEST |
| 6 | Drug Details & Vector Analogs | Interactive drug details, chemical properties, vector analog cards with similarity % and price delta | M3 | ORIGINAL_REQUEST |
| 7 | Pharmacy Map & Stock Overview | Interactive pharmacy locator, stock levels (In Stock, Low, Out), reserve & directions actions | M3 | ORIGINAL_REQUEST |
| 8 | Telemetry & Observability Dashboard | Live system health metrics (.NET API, Kafka topics, Qdrant vectors, PostgreSQL status), latency charts | M3 | ORIGINAL_REQUEST |
| 9 | QA Validation & Build Verification | Complete error state handling, responsive design check, zero-error `npm run build` | M4 | ORIGINAL_REQUEST |
| 10 | Git Delivery & Branching | Branch `feature/drugsengine-web-ui` creation, conventional commits, final acceptance check | M5 | ORIGINAL_REQUEST |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Specs, Kanban & API Contracts | KANBAN.md, UI/UX specs, OpenAPI 3.1, TypeScript contracts.ts | none | DONE |
| M2 | Web App Foundation & Setup | Next.js 15, Tailwind, ThemeProvider, App shell, API client & mocks | M1 | DONE |
| M3 | Core Modules Implementation | 4 Core Screens (Search, Analogs, Map, Telemetry) | M2 | DONE |
| M4 | QA Verification & Build | Rigorous validation, responsive testing, production build passes | M3 | DONE |
| M5 | Git Delivery & Signoff | Git branch feature/drugsengine-web-ui, commits, KANBAN Done | M4 | DONE |

## Interface Contracts
### API Endpoints
- `GET /api/v1/search/drugs?q={query}&mode={exact|semantic}&limit={limit}`
- `GET /api/v1/drugs/{id}`
- `GET /api/v1/drugs/{id}/analogs?threshold={similarity}`
- `GET /api/v1/pharmacies?drugId={id}&lat={lat}&lng={lng}&radius={km}`
- `GET /api/v1/telemetry/health`
- `GET /api/v1/telemetry/metrics`

## Code Layout
```
C:\DrugEngine\
├── .agents/                    # Agent metadata (orchestrator_1, explorer_1, etc.)
├── KANBAN.md                   # Project Kanban Tracking
├── PROJECT.md                  # Global Architecture & Milestones
├── DrugsEngine.Web/            # Next.js 15 Web Application
│   ├── app/                    # Next.js App Router (pages & layouts)
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Main Search & Catalog
│   │   ├── drug/[id]/page.tsx  # Drug Details & Vector Analogs
│   │   ├── pharmacies/page.tsx # Pharmacy Map & Stock Locator
│   │   ├── telemetry/page.tsx  # System Observability Dashboard
│   │   └── api/                # Next.js route handlers for mock/live APIs
│   ├── components/             # Reusable UI & Domain Components
│   │   ├── ui/                 # UI primitives (Buttons, Cards, Badges, Tabs, etc.)
│   │   ├── search/             # Smart Search Bar, Filters, Search Results
│   │   ├── drugs/              # Drug Details, Vector Analogs Card
│   │   ├── pharmacies/         # Pharmacy Map view, Stock List
│   │   ├── telemetry/          # Metrics charts, Service health badges
│   │   └── layout/             # Header, Navigation, Footer, ThemeToggle
│   ├── contracts/              # Shared Contracts
│   │   ├── openapi.json        # OpenAPI 3.1 schema
│   │   └── contracts.ts        # TypeScript interfaces & types
│   ├── lib/                    # Utilities, API client, mock data generator
│   └── package.json
```
