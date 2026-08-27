# UX/UI Design Specifications — DrugsEngine Web

> **Author**: Team Lead & UI/UX Designer  
> **Version**: 1.0.0  
> **Date**: 2026-08-27  
> **Status**: Approved for Frontend Implementation  
> **Target Framework**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS

---

## 1. Design System Foundations

### 1.1 Philosophy & Brand Identity
The DrugsEngine Web design language merges **clinical precision** with **cutting-edge AI search intelligence**. The interface communicates trust, pharmaceutical accuracy, and high-velocity vector search performance through clean typography, a calming **Slate + Emerald** palette, and responsive micro-interactions.

---

### 1.2 Color Palette & Tailwind Tokens

The theme provides full support for **Dark** and **Light** modes with seamless switching via `next-themes` and CSS custom properties.

#### Palette Tokens

| Role | Light Mode Hex | Light Tailwind Token | Dark Mode Hex | Dark Tailwind Token |
| :--- | :--- | :--- | :--- | :--- |
| **Canvas Background** | `#F8FAFC` | `bg-slate-50` | `#020617` | `bg-slate-950` |
| **Card / Surface** | `#FFFFFF` | `bg-white` | `#0F172A` | `bg-slate-900` |
| **Sub-Surface / Muted** | `#F1F5F9` | `bg-slate-100` | `#1E293B` | `bg-slate-800` |
| **Border (Default)** | `#E2E8F0` | `border-slate-200` | `#334155` | `border-slate-700` |
| **Border (Subtle)** | `#F1F5F9` | `border-slate-100` | `#1E293B` | `border-slate-800` |
| **Text (Primary)** | `#0F172A` | `text-slate-900` | `#F8FAFC` | `text-slate-50` |
| **Text (Muted)** | `#64748B` | `text-slate-500` | `#94A3B8` | `text-slate-400` |
| **Text (Subtle)** | `#94A3B8` | `text-slate-400` | `#64748B` | `text-slate-500` |
| **Primary Accent** | `#059669` | `bg-emerald-600` | `#10B981` | `bg-emerald-500` |
| **Primary Accent Hover**| `#047857` | `bg-emerald-700` | `#059669` | `bg-emerald-600` |
| **Primary Glow / Tint** | `#D1FAE5` | `bg-emerald-100` | `rgba(16,185,129,0.15)`| `bg-emerald-500/15` |
| **AI / Vector Highlight**| `#0284C7` | `text-sky-600` | `#38BDF8` | `text-sky-400` |
| **AI Vector Glow** | `#E0F2FE` | `bg-sky-100` | `rgba(56,189,248,0.15)`| `bg-sky-500/15` |
| **Status: Success / In Stock** | `#10B981` | `text-emerald-500` | `#34D399` | `text-emerald-400` |
| **Status: Warning / Low Stock** | `#F59E0B` | `text-amber-500` | `#FBBF24` | `text-amber-400` |
| **Status: Danger / Out of Stock**| `#EF4444` | `text-rose-500` | `#F87171` | `text-rose-400` |

---

### 1.3 Typography System

- **Primary Font**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`
- **Monospace Font**: `JetBrains Mono`, `Geist Mono`, `ui-monospace`, `monospace` (Used for ATC codes, chemical formulas, vector cosine similarity scores, latency in ms, QPS, and telemetry logs).

#### Typography Scale

| Hierarchy | Size / Line Height | Weight | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Hero / Display** | 36px / 44px (2.25rem) | Bold (700) | `text-3xl sm:text-4xl font-bold tracking-tight` | Main Hero titles |
| **Heading 1** | 30px / 36px (1.875rem) | Bold (700) | `text-2xl sm:text-3xl font-bold` | Screen headers |
| **Heading 2** | 24px / 32px (1.5rem) | Semibold (600) | `text-xl sm:text-2xl font-semibold` | Section titles |
| **Heading 3** | 18px / 28px (1.125rem) | Semibold (600) | `text-lg font-semibold` | Card headers |
| **Body (Large)** | 16px / 24px (1rem) | Regular (400) | `text-base` | Lead paragraphs |
| **Body (Base)** | 14px / 20px (0.875rem) | Regular (400) | `text-sm leading-relaxed` | Default text, descriptions |
| **Caption / Small**| 12px / 16px (0.75rem) | Medium (500) | `text-xs text-muted-foreground` | Metadata, timestamps, labels |
| **Code / Metric** | 13px / 18px (0.8125rem) | Medium (500) | `font-mono text-xs sm:text-sm` | Scores, IDs, Latency values |

---

### 1.4 Spacing, Grid & Layout

- **Base Unit**: 4px grid system (`p-1` = 4px, `p-2` = 8px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px).
- **Container Max Width**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- **Border Radius**:
  - `rounded-lg` (8px): Inputs, buttons, filter pills.
  - `rounded-xl` (12px): Standard cards, dialog modals.
  - `rounded-2xl` (16px): Hero panels, map frame containers.
  - `rounded-full`: Status dots, badges, avatar pills.

---

### 1.5 Component Primitives & Styling Guidelines

1. **Button**:
   - `primary`: `bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all rounded-lg px-4 py-2`
   - `secondary`: `bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2`
   - `outline`: `border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg px-4 py-2`
   - `ghost`: `hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg px-3 py-2`
2. **Badge / Pill**:
   - `emerald`: `bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs px-2.5 py-0.5 rounded-full font-medium`
   - `sky (AI/Vector)`: `bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 text-xs px-2.5 py-0.5 rounded-full font-medium`
   - `amber`: `bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs px-2.5 py-0.5 rounded-full font-medium`
   - `rose`: `bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-xs px-2.5 py-0.5 rounded-full font-medium`
3. **Card**:
   - `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow`
4. **Input**:
   - `bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2.5`
5. **Theme Switcher**:
   - Smooth icon rotation (Sun / Moon) with system preference detection.

---

## 2. Component Hierarchy & State Machines (4 Core Screens)

Every screen strictly implements 5 standard user experience states:
1. **Idle / Initial**: Default state when no query is performed or baseline screen view.
2. **Loading**: Skeleton placeholders and pulse animations matching exact visual structure.
3. **Error**: User-friendly diagnostic error card with retry button and status code indicator.
4. **Empty**: Engaging illustration, explanation, and proactive suggestions to recover.
5. **Success**: Fully rendered, responsive, interactive UI with live data bindings.

---

### Screen 1: Universal Smart Search Bar & Catalog (`/`)

#### 1. Component Hierarchy
```
MainSearchPage (app/page.tsx)
 ├── HeaderNav (components/layout/Header.tsx)
 │    ├── Logo & AppTitle ("DrugsEngine")
 │    ├── NavLinks (Search, Pharmacies, Telemetry)
 │    └── ThemeToggle (Dark/Light mode switch)
 ├── HeroSection
 │    ├── HeroTitle ("Intelligent Pharmaceutical Discovery")
 │    └── HeroSubtitle ("Search with exact chemical matching or semantic Qdrant vector AI")
 ├── SearchBarContainer (components/search/SearchBar.tsx)
 │    ├── SearchModeToggle (Switch: [Exact Match | Qdrant Semantic AI])
 │    ├── SearchInputGroup
 │    │    ├── SearchIcon (Lucide `Search` / `Sparkles`)
 │    │    ├── DebouncedTextInput (300ms debounce, placeholder="Search by name, symptom, active ingredient...")
 │    │    └── ClearButton (Lucide `X`)
 │    └── FilterBadgeBar (components/search/FilterBadges.tsx)
 │         ├── PrescriptionFilter ([All, OTC Only, Rx Required])
 │         ├── DosageFormFilter ([All, Tablet, Capsule, Liquid, Injection])
 │         └── PriceSortDropdown ([Relevance, Price: Low to High, Price: High to Low])
 ├── ActiveFiltersSummary
 └── SearchResultsContainer (components/search/SearchResults.tsx)
      ├── ResultsHeader (Count, active mode badge, latency metric e.g. "Found 12 results in 18ms")
      └── ResultsGrid (Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop)
           └── DrugCard (components/drugs/DrugCard.tsx)
                ├── DrugHeader (Name, Brand, Rx/OTC Badge, Category)
                ├── ActiveIngredient & Dosage Info
                ├── MatchScoreBadge (e.g. "Exact Match 100%" or "Semantic Score 94.2%")
                ├── PriceTag & StockSummaryBadge
                └── ActionLinks ("View Details & Analogs" -> `/drug/[id]`, "Find in Pharmacy" -> `/pharmacies?drugId=[id]`)
```

#### 2. State Machine

| State | Trigger | Visual UI Representation |
| :--- | :--- | :--- |
| **1. Idle** | Component mount / input empty | Hero banner, Search bar with prompt, "Popular Searches" quick-clickable tags (e.g. `Ibuprofen`, `Amoxicillin`, `Migraine Relief`, `Atorvastatin`, `Omeprazole`), and curated featured drug catalog cards. |
| **2. Loading** | User types in search bar (>300ms debounce fires API request) | Search icon changes to spinning loader; Results area renders 6 animated skeleton drug cards (`SkeletonCard` with pulsing title, badges, and text blocks). Filter badges disabled during fetch. |
| **3. Error** | Network failure / API 500 | Clean alert card with `AlertTriangle` icon, red border (`border-rose-200 dark:border-rose-800`), error message (`"Unable to fetch drug catalog: [Reason]"`), and a primary `"Retry Search"` button. |
| **4. Empty** | Query returns 0 items (`results.length === 0`) | `SearchX` icon, bold header (`"No drugs found for '[query]'"`), subtext suggesting toggling into **Semantic AI (Qdrant)** mode if Exact was selected, or checking active ingredient spellings. Quick button: `"Switch to Semantic AI Search"`. |
| **5. Success** | Results returned (`results.length > 0`) | Results count banner with latency timer (`"14 drugs found in 24ms via Qdrant Semantic Search"`), responsive grid of `DrugCard` components with hover lift animation and direct CTAs. |

---

### Screen 2: Drug Details & Qdrant Vector Analogs Card (`/drug/[id]`)

#### 1. Component Hierarchy
```
DrugDetailsPage (app/drug/[id]/page.tsx)
 ├── BreadcrumbNavigation (`Home / Drugs / [Drug Name]`)
 ├── DrugHeroCard (components/drugs/DrugHero.tsx)
 │    ├── Title & Manufacturer (Brand name, Generic name, Manufacturer, Country)
 │    ├── StatusBadges (Rx/OTC, ATC Code e.g. `M01AE01`, FDA Approved)
 │    ├── ChemicalFormulaBlock (Formula `C13H18O2`, Molecular Weight `206.28 g/mol`, CAS #)
 │    └── PriceStockSummaryBox (Average Price `$8.49 - $14.99`, Overall Availability Badge)
 ├── DrugInfoTabs (components/drugs/DrugTabs.tsx)
 │    ├── TabList ([Overview, Indications & Dosage, Pharmacokinetics, Safety & Interactions])
 │    └── TabPanels:
 │         ├── OverviewPanel (Description, active mechanism, standard release forms)
 │         ├── IndicationsPanel (Approved conditions, dosage guidelines, administration)
 │         ├── PharmacokineticsPanel (Bioavailability, half-life, protein binding, excretion)
 │         └── SafetyPanel (Contraindications, side effects, drug-drug interaction warnings)
 └── VectorAnalogsSection (components/drugs/VectorAnalogs.tsx)
      ├── SectionHeader
      │    ├── Title ("AI Vector Analogs & Bio-Equivalents")
      │    ├── Explanation ("Generated using Qdrant high-dimensional chemical embedding cosine similarity")
      │    └── SimilarityFilterSlider (Threshold: `70%`, `80%`, `90%`, `95%`)
      └── AnalogsGrid
           └── AnalogCard (components/drugs/AnalogCard.tsx)
                ├── SimilarityScoreBadge (e.g. `96.4% Match` with green radial/pill glow)
                ├── AnalogDrugName & ActiveSubstance
                ├── PriceDeltaBadge (e.g. `-$4.20 (32% Cheaper)` in Emerald or `+$1.50` in Slate)
                ├── ChemicalSimilarityDetails (ATC equivalence level, Bioequivalence status)
                ├── LocalStockSummary (e.g. "Available in 8 nearby pharmacies")
                └── Actions ("Compare Specs", "Find in Pharmacies" -> `/pharmacies?drugId=[analogId]`)
```

#### 2. State Machine

| State | Trigger | Visual UI Representation |
| :--- | :--- | :--- |
| **1. Idle** | Page loading / initial SSR | Initial page shell with breadcrumbs and layout placeholder. |
| **2. Loading** | Drug ID fetch or similarity threshold slider adjustment | Shimmering hero card skeleton, tab skeleton, and 3 analog card skeletons with pulsating vector score rings. |
| **3. Error** | Drug ID not found (404) or API error | 404/500 diagnostic banner: `"Drug not found in Qdrant registry"`, with suggestions to return to Search or view alternative catalog categories. |
| **4. Empty** | Similarity threshold set too high (e.g., >98% has 0 matches) | `"No vector analogs found at >98% similarity threshold"`. Slider prompt: `"Try lowering the similarity threshold to 80% to find broader therapeutic alternatives."` |
| **5. Success** | Data loaded | Full rich chemical breakdown, active ingredient comparison table, and interactive vector analogs cards with color-coded similarity badges and price savings badges. |

---

### Screen 3: Pharmacy Map & Stock Overview (`/pharmacies`)

#### 1. Component Hierarchy
```
PharmaciesPage (app/pharmacies/page.tsx)
 ├── PageHeader
 │    ├── Title ("Pharmacy Locator & Real-Time Stock")
 │    ├── DrugFilterContext (Select or display currently queried drug, e.g. "Checking stock for: Ibuprofen 400mg")
 │    └── RadiusSelector (Pill buttons: `[2 km, 5 km, 10 km, 25 km]`)
 ├── ResponsiveSplitLayout (Mobile: Tabs [Map / List], Desktop: Side-by-Side 50/50 split)
 │    ├── MapViewPanel (components/pharmacies/PharmacyMap.tsx)
 │    │    ├── InteractiveMapCanvas (Custom stylized SVG map with streets, zones, and GPS user pin)
 │    │    ├── MapControls (Zoom in/out, Recenter on user, Legend toggle)
 │    │    ├── PharmacyPins (Custom SVG pins color-coded by stock level: Emerald=In Stock, Amber=Low, Red=Out)
 │    │    └── PinHoverTooltip (Pharmacy name, stock units, distance)
 │    └── PharmacyListPanel (components/pharmacies/PharmacyList.tsx)
 │         ├── ListHeader (Found X pharmacies sorted by distance)
 │         ├── SearchWithinListInput ("Filter pharmacies by name, street...")
 │         └── PharmacyCardsScrollArea
 │              └── PharmacyCard (components/pharmacies/PharmacyCard.tsx)
 │                   ├── Header (Pharmacy chain name, chain logo/badge, distance in km e.g. "0.8 km")
 │                   ├── Address & WorkingHours (Address line, Open Now indicator with closing time)
 │                   ├── StockBadge (e.g. `In Stock: 42 packs` / `Low Stock: 3 packs` / `Out of Stock`)
 │                   ├── PriceAtPharmacy (e.g. `$9.99`)
 │                   └── ActionButtons:
 │                        ├── "Reserve Now" (Opens `ReserveModal`)
 │                        └── "Get Directions" (External map trigger or highlighted pin on map)
 └── ReserveModal (components/pharmacies/ReserveModal.tsx)
      ├── DialogHeader ("Reserve Medication")
      ├── OrderSummary (Drug name, Pharmacy name, quantity selector 1-5, unit price, total price)
      ├── UserInputFields (Patient Name, Phone number, Email)
      ├── PickupNotice ("Held for 24 hours at pickup counter. No prepayment required.")
      └── ConfirmReservationButton (Triggers reservation confirmation state)
```

#### 2. State Machine

| State | Trigger | Visual UI Representation |
| :--- | :--- | :--- |
| **1. Idle** | First load / User selects city or allows geolocation | Default map centered at user location with all nearby partner pharmacies displayed. |
| **2. Loading** | Radius change or Drug selection change | Map canvas shows subtle blur with centered loading spinner; List panel shows 4 skeleton pharmacy cards. |
| **3. Error** | Location services blocked or inventory API offline | Friendly fallback notice: `"Location access unavailable. Showing default downtown region"` or `"Inventory service temporarily unavailable with retry button."` |
| **4. Empty** | Radius too small or drug unavailable anywhere in region | Map shows area without pins; List panel shows empty state card: `"No pharmacies currently carry this medication within 5 km. Would you like to expand radius to 25 km or check online delivery?"` |
| **5. Success** | Pharmacies loaded | Interactive SVG map with clickable pins that sync with the pharmacy list on the right. Selecting a pin highlights and scrolls to the pharmacy card; clicking "Reserve" launches the reservation workflow. |

---

### Screen 4: System Observability & Telemetry Dashboard (`/telemetry`)

#### 1. Component Hierarchy
```
TelemetryPage (app/telemetry/page.tsx)
 ├── DashboardHeader (components/telemetry/TelemetryHeader.tsx)
 │    ├── Title ("System Observability & Engine Telemetry")
 │    ├── ClusterStatusBadge (e.g. `Cluster: Healthy (4/4 Nodes Operational)` with green pulse ring)
 │    ├── RefreshControl (Auto-refresh dropdown: `[Off, 5s, 10s, 30s]`, Manual "Refresh Now" button)
 │    └── LastHeartbeatTimestamp (e.g. `Last sync: 2026-08-27 19:35:42 UTC`)
 ├── ServicesHealthGrid (components/telemetry/ServicesGrid.tsx)
 │    ├── ServiceHealthGauge: `.NET 8 Core API Gateway` (Status: Healthy, Uptime: 99.98%, Avg Latency: 12ms)
 │    ├── ServiceHealthGauge: `Qdrant Vector Engine` (Status: Healthy, Total Vectors: 1,248,500, Indexing: Idle)
 │    ├── ServiceHealthGauge: `Kafka Event Bus` (Status: Healthy, Topics: 6, Consumer Lag: 0 msgs)
 │    └── ServiceHealthGauge: `PostgreSQL Cluster` (Status: Healthy, Connections: 24/100, Read Replica Lag: 2ms)
 ├── PerformanceMetricsSection (components/telemetry/MetricsCharts.tsx)
 │    ├── SearchLatencyChart (Interactive SVG/Canvas time-series line chart: Exact Search vs Qdrant Semantic Search)
 │    ├── VectorThroughputGauge (QPS meter: Current 142 req/s, Peak 420 req/s)
 │    ├── KafkaMessageThroughput (Ingestion rate: 3,450 events/min)
 │    └── DBQueryLatencyHistogram (P50: 2.1ms, P95: 8.4ms, P99: 18.2ms)
 └── EngineEventStreamAuditLog (components/telemetry/AuditLog.tsx)
      ├── LogHeader ("Recent Engine Events & Vector Sync Stream", Filter: [All, Info, Warn, Error])
      └── LogTable / Stream
           └── LogRow (Timestamp, Service tag [.NET/Qdrant/Kafka/PG], Event message, Status code badge, Duration)
```

#### 2. State Machine

| State | Trigger | Visual UI Representation |
| :--- | :--- | :--- |
| **1. Idle** | Dashboard mounted with live polling enabled | Real-time telemetry updating at selected interval with subtle green status pulse on live indicators. |
| **2. Loading** | Initial telemetry fetch or forced manual refresh | 4 gauge skeletons with pulsing circular meters and chart skeleton loading shimmer. |
| **3. Error** | Telemetry endpoint unreachable / backend offline | System degradation banner (`"CRITICAL: Telemetry heartbeat failed. Unable to poll cluster metrics"`), showing red status tags and reconnecting countdown. |
| **4. Empty** | Audit log empty or filtered out | Clean log view: `"No event logs recorded for selected filter in the last 60 minutes."` |
| **5. Success** | Real-time data flowing | 4 vibrant service cards with live uptime %, latency sparklines, throughput counters, and auto-scrolling engine audit log. |

---

## 3. Responsive Breakpoints & Layout Adaptations

| Viewport | Screen Width | Search Screen Layout | Drug Details Layout | Pharmacy Screen Layout | Telemetry Screen Layout |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mobile** | `< 640px` | 1-column cards, full-width search input, stacked filter pills | Stacked hero info, horizontal scrolling tabs, 1-col analog cards | Tab switcher between `[Map View]` and `[List View]`, full-screen reserve modal | 1-column service health cards, stacked latency metrics, compact event log |
| **Tablet** | `640px - 1023px` | 2-column result cards, wrapped filter bar | 2-column overview, 2-col analog cards | Split view (Top: Map 300px height, Bottom: Pharmacy list) | 2x2 grid for service health cards, full-width latency chart |
| **Desktop**| `>= 1024px` | 3-column result cards, inline sticky search header | Full rich 3-column layout with sticky right analog rail | Side-by-side 50/50 split (Left: sticky interactive map, Right: scrollable pharmacy list) | 4-column service health row, side-by-side performance charts + audit stream |

---

## 4. Accessibility & Micro-Interactions

1. **WCAG 2.1 AA Compliance**:
   - Contrast ratio $\ge 4.5:1$ for all body text in both dark and light modes.
   - Contrast ratio $\ge 3:1$ for large text, badges, and interactive controls.
2. **Keyboard Navigation**:
   - Full tab order across all interactive elements (`tabIndex={0}`).
   - Search bar supports keyboard shortcuts: `/` to focus search input, `Esc` to clear/close dropdowns, `ArrowDown`/`ArrowUp` to navigate search suggestions.
3. **Debounced Interactions**:
   - Search input strictly throttled with a **300ms debounce** to avoid flooding vector and database endpoints.
4. **Motion & Transitions**:
   - Standard transitions: `transition-all duration-200 ease-in-out` on hover, focus, and theme switches.
   - Respects `prefers-reduced-motion` for animated status rings and pulsing indicators.
