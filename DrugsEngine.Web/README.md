# 💊 DrugsEngine.Web

> **Production-grade, modern Next.js 15 frontend web application for the DrugsEngine distributed pharmacy platform.**

---

## 🌟 Key Features

1. **🔍 Universal Smart Search:**
   - Real-time instant search with 300ms debounce.
   - Dual-mode: Exact catalog search & AI/Semantic natural language search.
   - Intelligent suggestions and active ingredient highlighting.

2. **🧪 Drug Details & Qdrant Vector Analogs:**
   - Full active substance, dosage, and medical instructions overview.
   - Real-time semantic analog matching via **Qdrant Vector Database** (% similarity score).
   - Dynamic price comparison against market alternatives.

3. **🗺️ Pharmacy Map & Real-time Stock:**
   - Interactive availability map for Tiraspol, Chisinau, and regional pharmacies.
   - Stock status indicators (In Stock, Low Stock, On Order).
   - Fast reservation and route navigation.

4. **📊 System Observability & Telemetry:**
   - Real-time health monitoring of .NET 8 Web API, Kafka, RabbitMQ, Qdrant, and PostgreSQL.
   - Vector indexing counters and message throughput stats.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling & UI:** Tailwind CSS, shadcn/ui design tokens (Slate + Emerald)
- **Theme:** Dark / Light mode with 
ext-themes
- **Icons:** Lucide React
- **API Architecture:** OpenAPI 3.1 Contract-First Architecture

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ / npm

### Installation & Run
`ash
# Install dependencies
npm install

# Start development server
npm run dev
`

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 📋 Development Workflow & Kanban

This project was engineered following an end-to-end multi-agent team lifecycle (Team Lead, UX/UI, Backend, Frontend, QA). See KANBAN.md for task breakdown and verification records.
