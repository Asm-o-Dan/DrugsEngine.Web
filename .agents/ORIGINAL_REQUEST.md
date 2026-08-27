# Original User Request

## Initial Request — 2026-08-27T19:33:36Z

You are the Project Orchestrator for the DrugsEngine frontend development project.
Your working directory is C:\DrugEngine\.agents\orchestrator_1\
The original request is located at C:\DrugEngine\.agents\ORIGINAL_REQUEST.md

Task:
Build a modern, production-grade frontend website for the DrugsEngine platform with a full cross-functional development cycle: UX/UI design approval, API contract alignment, Kanban task tracking, responsive implementation, QA validation, and delivery into a dedicated GitHub feature branch.

Working directory for Web App: C:\DrugEngine\DrugsEngine.Web
Integrity mode: development

Team roles & operational workflow to orchestrate:
1. Team Lead: Creates and manages the project Kanban board (KANBAN.md) across columns [Backlog, Design & Specs, API Ready, In Progress (FE), QA & Testing, Done]. Decomposes requirements into concrete user stories, conducts design review, approves deliverables, and merges/commits to git branch 'feature/drugsengine-web-ui'.
2. UX Designer & UI Designer: Design adaptive user flows, dark/light theme design system (Slate + Emerald), and complete UI specifications for:
   - Universal Smart Search Bar (Exact search + Semantic AI/Qdrant search with 300ms debounce)
   - Drug Details & Qdrant Vector Analogs Card (similarity score %, price comparison)
   - Pharmacy Map & Stock Overview (interactive pharmacy availability)
   - System Observability & Telemetry Dashboard (.NET API, Kafka, Qdrant, PostgreSQL live health)
   Submit all design specs to Team Lead for review and approval.
3. Backend & Frontend Developers: Negotiate and finalize the OpenAPI 3.1 API contract and TypeScript interface definitions (contracts.ts / openapi.json) covering all search, drug catalog, pharmacy, and telemetry endpoints before frontend coding begins.
4. Frontend Developer: Implement the approved UI in C:\DrugEngine\DrugsEngine.Web using Next.js 15, React 19, TypeScript, Tailwind CSS, and shadcn/ui components, integrating with the agreed API contract and mock handlers for standalone development.
5. QA Engineer: Verify component rendering, API contract compliance, error handling (empty states, network timeouts), responsive layout, and run automated build/test checks (npm run build).
6. Git Delivery: Stage and commit all completed code into a dedicated git branch named 'feature/drugsengine-web-ui' with conventional commit messages.

Requirements:
R1. API Contract & Data Schema: Valid OpenAPI 3.1 spec and TypeScript interfaces for all 4 core modules.
R2. UX/UI Design Specifications: Documented component hierarchy, state machines, and styling approved by Team Lead.
R3. Kanban Board: Up-to-date KANBAN.md tracking all tasks, DoD, and assignees.
R4. Frontend Web Implementation: Functional, responsive Next.js 15 application in C:\DrugEngine\DrugsEngine.Web.
R5. QA Verification: End-to-end component verification and zero-error build.
R6. Git Version Control: Feature branch feature/drugsengine-web-ui committed with clean history.

Acceptance Criteria:
- API contract file created and validated.
- Design specs approved by Team Lead.
- Next.js web application built without compilation errors.
- All 4 core screens (Search, Analogs, Map, Telemetry) implemented and functional.
- KANBAN.md reflecting all tasks in 'Done'.
- Git branch 'feature/drugsengine-web-ui' successfully created and committed.

Maintain your plan.md, progress.md, and context.md in your working directory C:\DrugEngine\.agents\orchestrator_1\.
Coordinate the team rigorously, ensure all phases and gates are respected, verify builds and tests, and report back your completion with all artifacts when done.
