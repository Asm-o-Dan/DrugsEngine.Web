# Context: DrugsEngine Web Frontend

## Mission Context
The DrugsEngine platform provides advanced drug search, semantic Qdrant vector analogs discovery, pharmacy stock lookup, and microservice telemetry.
We are building the complete, production-grade Next.js 15 Web interface for DrugsEngine in `C:\DrugEngine\DrugsEngine.Web`.

## Requirements Reference
- Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide icons, shadcn/ui style components.
- Theme: Slate + Emerald (Dark and Light mode).
- 4 Core Modules:
  1. Universal Smart Search (Exact + Semantic Qdrant with 300ms debounce)
  2. Drug Details & Qdrant Vector Analogs Card (similarity %, price comparison)
  3. Pharmacy Map & Stock Overview (interactive availability, filters)
  4. System Observability & Telemetry Dashboard (.NET API, Kafka, Qdrant, PostgreSQL live health)
- Contracts: OpenAPI 3.1 (`openapi.json`) and TypeScript interfaces (`contracts.ts`).
- Kanban tracking in `KANBAN.md`.
- Git branch: `feature/drugsengine-web-ui`.
