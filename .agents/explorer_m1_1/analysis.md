# 🔬 DrugsEngine Ecosystem: Comprehensive Codebase Architecture Analysis

**Date**: 2026-08-27  
**Author**: Codebase Architecture Explorer (`explorer_m1_1`)  
**Scope**: Ingestion & Storage (.NET 8 Backend), AI & Vectorization (Python Microservice), Messaging (Kafka & RabbitMQ), Vector Database (Qdrant), Relational Storage (PostgreSQL), and Observability (OpenTelemetry, Prometheus, Grafana, Loki).

---

## 📑 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Ecosystem Topology & Architecture Diagram](#2-ecosystem-topology--architecture-diagram)
3. [.NET 8 Core Backend (`DrugsEngine`) Deep-Dive](#3-net-8-core-backend-drugsengine-deep-dive)
4. [Python AI & Vector Microservice (`DrugsEnginePythonService`) Deep-Dive](#4-python-ai--vector-microservice-drugsenginepythonservice-deep-dive)
5. [PostgreSQL Relational Data Models & Schema](#5-postgresql-relational-data-models--schema)
6. [Qdrant Vector Database Schema & Embedding Pipeline](#6-qdrant-vector-database-schema--embedding-pipeline)
7. [Kafka & RabbitMQ Event-Driven Architecture](#7-kafka--rabbitmq-event-driven-architecture)
8. [Telemetry, Observability & Health Checks Inventory](#8-telemetry-observability--health-checks-inventory)
9. [Frontend Contract & API Gateway Alignment Matrix](#9-frontend-contract--api-gateway-alignment-matrix)

---

## 1. Executive Summary

The **DrugsEngine Ecosystem** is an event-driven pharmaceutical aggregation and semantic search platform. It gathers drug items and inventory stock from pharmacy web scrapers, persists transactional data in PostgreSQL using .NET 8 Clean Architecture / CQRS, streams ingestion events via Apache Kafka to a Python AI microservice, enriches drug metadata with Google Gemini LLM, generates 768-dimensional multilingual embeddings using Hugging Face's `LaBSE` model, and indexes them in Qdrant Vector DB for hybrid (exact + semantic) search.

Key operational characteristics:
- **High-Throughput Ingestion**: Resilient scraping of pharmacy networks (`DoctorParser`, `VivaFarmParser`) with micro-batching and transactional deduplication.
- **AI-Enriched Vector Pipeline**: 3-stage validation (pharmaceutical verification, МНН extraction, indication/analog synthesis) with Gemini model pooling (`3.5-flash-lite`, `3.6-flash`, `3.7-flash`).
- **Resilient Storage**: PostgreSQL 16 with EF Core 8 execution strategies and unique composite indexing.
- **Enterprise Observability**: End-to-end W3C distributed tracing (`traceparent` propagated across HTTP, Kafka, and background workers), Prometheus metrics scraping, Loki log aggregation, and pre-built Grafana dashboards.

---

## 2. Ecosystem Topology & Architecture Diagram

```mermaid
flowchart TD
    subgraph Ingestion_and_Persistence [C# .NET 8 Backend — DrugsEngine (Port 8080)]
        Scrapers[Web Scrapers: DoctorParser / VivaFarmParser] -->|Scraped DrugItems| PM[ParsingManager]
        PM -->|MediatR Commands| AppLayer[Application Layer: CQRS & Unit of Work]
        AppLayer -->|EF Core 8 / Npgsql| PG[(PostgreSQL 16: myappdb)]
        AppLayer -->|Produce Event / Topic: drugs| KP[KafkaProducer: Confluent.Kafka]
        API_OData[ASP.NET Core OData Controller: /api/Drug] -->|Query IQueryable| PG
    end

    subgraph Messaging_and_Infrastructure [Shared Services (Docker Compose)]
        KP -->|W3C Traceparent Header| KafkaBroker[Apache Kafka Broker: 9092]
        RabbitMQBroker[RabbitMQ Broker: 5672 / RPC Queue: rpc_queue]
    end

    subgraph AI_and_Semantic_Search [Python 3.10 Microservice — DrugsEnginePythonService (Port 8000)]
        KafkaBroker -->|Micro-batch 25 items / 3s| KafkaConsumer[KafkaDrugConsumer]
        KafkaConsumer -->|Prompt Batch 25-50 items| Gemini[Google Gemini Triple Pool: 3.5 Lite / 3.6 Flash / 3.7 Flash]
        Gemini -->|VERIFIED + Description| LaBSE[Sentence-Transformers: LaBSE 768-dim Embeddings]
        LaBSE -->|Upsert PointStruct| Qdrant[(Qdrant Vector DB: 6333 / drug_collection)]
        RabbitMQBroker <-->|RPC Search Query / Cosine Match| RabbitConsumer[RabbitMQConsumer]
        RabbitConsumer <-->|Search Vector| Qdrant
        HealthServer[Threaded HTTP Server: /health, /metrics]
    end

    subgraph Observability_Stack [Monitoring Stack]
        Prometheus[Prometheus: 9090] -->|Scrape /metrics| API_OData
        Prometheus -->|Scrape /metrics| HealthServer
        Grafana[Grafana: 3000] -->|Visualize Metrics| Prometheus
        Promtail -->|Tail Logs| Loki[Grafana Loki: 3100]
        Loki -->|Log Streams| Grafana
        Jaeger[Jaeger OTLP: 16686 / 4317] <-->|Trace Spans| AppLayer
    end

    subgraph Frontend_Target [Next.js 15 Web Application — DrugsEngine.Web]
        FE[Universal Search / Drug Details / Pharmacy Map / Telemetry Dashboard]
    end

    FE -.->|HTTP / OData & Semantic APIs| API_OData
    FE -.->|Health & Telemetry Polling| Prometheus
```

### Component Port Mapping
| Service | Technology | Ports (Host:Container) | Protocols / Endpoints |
|---|---|---|---|
| **DrugsEngine API** | .NET 8, ASP.NET Core | `8080:8080` | HTTP / OData (`/api/Drug`), Health (`/health`, `/health/ready`, `/health/live`), Metrics (`/metrics`) |
| **Python Embedding Service** | Python 3.10, PyTorch, LaBSE | `8000:8000` | HTTP Health (`/health`, `/health/ready`, `/health/live`), Prometheus (`/metrics`) |
| **Qdrant Vector DB** | Qdrant Rust Engine | `6333:6333`, `6334:6334` | HTTP REST API (`/collections/drug_collection`), gRPC |
| **PostgreSQL Database** | PostgreSQL 16 | `5432:5432` | PostgreSQL Native Wire Protocol (`myappdb`) |
| **Apache Kafka** | Confluent Kafka 7.5.0 | `9092:9092`, `9093:9093` | Kafka TCP Wire Protocol (Topic: `drugs`) |
| **RabbitMQ** | RabbitMQ 3.12 (Management) | `5672:5672`, `15672:15672` | AMQP 0-9-1 (`rpc_queue`), HTTP Management Dashboard |
| **Prometheus** | Prometheus TSDB | `9090:9090` | HTTP API & Query Engine (`/api/v1/query`, `/api/v1/query_range`) |
| **Grafana** | Grafana 10.0 | `3000:3000` | Web UI & Visualization Dashboard (`drugsengine-overview`) |
| **Loki / Promtail** | Grafana Loki | `3100:3100` | HTTP Log Push / Query API |
| **Jaeger Tracing** | Jaeger All-in-One | `16686:16686`, `4317:4317` | HTTP Web UI, OTLP gRPC Collector (4317), OTLP HTTP (4318) |
| **Seq Logs** | Datalust Seq | `5341:5341`, `8081:80` | Ingestion API (5341), Web UI (8081) |

---

## 3. .NET 8 Core Backend (`DrugsEngine`) Deep-Dive

The backend is structured according to **Clean Architecture** and **CQRS** principles with strict dependency boundaries:

```
DrugsEngine/
├── Domain/                   # Pure business domain, Entities, Value Objects, FluentValidation
│   ├── Entities/             # Drug, DrugStore, DrugItem, Country, UserProfile, FavoriteDrug
│   ├── ValueObjects/         # Address (City, Street, House, PostalCode), Email
│   ├── Validators/           # FluentValidation rules and ISO Country code validation
│   └── DomainEvents/         # DrugItemUpdatedEvent
├── Application/              # Use Cases, CQRS Commands/Queries, MediatR Handlers, DTOs, Mappings
│   ├── UseCases/Commands/    # Create/Update/Delete handlers for all entities
│   ├── UseCases/Queries/     # GetById, GetQueryable, GetByName, GetByNumberAndNetwork
│   ├── Interfaces/           # IKafkaProducer, IPharmacyParser, IUnitOfWork, Repository interfaces
│   ├── DTOs/                 # BaseDrugDto, CreateDrugRequest, UpdateDrugRequest
│   └── Mapping/              # AutoMapper profiles
└── Infrastructure/           # External adapters, persistence, API, messaging, parsers
    ├── Dal/                  # DrugsBotDbContext, Entity Configurations, EF Migrations, Repositories
    ├── API/Controllers/      # DrugController (ASP.NET Core OData 8.x)
    ├── Kafka/                # KafkaProducer (Confluent.Kafka singleton producer with W3C tracing)
    ├── Parsing/              # ParsingManager, DoctorParser, VivaFarmParser
    ├── Telemetry/            # DrugsEngineTelemetry (ActivitySource, Meters, Counters)
    └── Middleware/           # CorrelationIdMiddleware, Global Exception ProblemDetails handler
```

### 3.1 Domain Model & Invariants
- **`Drug`**: Represents a pharmacological medication. Contains `Name` (max 150), `Manufacturer` (max 100), `CountryCodeId` (2-letter ISO 3166-1 alpha-2 foreign key), and navigation collections `Country` and `DrugItems`.
- **`DrugStore`**: Represents a physical pharmacy location. Contains `Number` (int), `PhoneNumber` (string), `DrugNetwork` (string, max 100 e.g. "Доктор", "Вивафарм"), and owned value object `Address`. Enforces composite uniqueness on `{ DrugNetwork, Number }`.
- **`Address` (Value Object)**: Encapsulates `City` (max 50), `Street` (max 100), `House` (max 50), `PostalCode` (int). Implements value equality over its 4 scalar components.
- **`DrugItem`**: Associative junction entity between `Drug` and `DrugStore`. Stores stock quantity `Count` (double) and retail price `Cost` (decimal). Has composite unique index `{ DrugId, DrugStoreId }`.
- **`Country`**: Lookup reference table with ISO-3166-1 alpha-2 `Code` (PK / alternate key, 2 chars) and `Name` (max 100).
- **`UserProfile` & `FavoriteDrug`**: User profile management with `ExternalId` (e.g. Telegram user ID or Auth ID), `Email` (Value Object), and collection of user-bookmarked drugs and pharmacies.

### 3.2 ASP.NET Core API & OData Endpoints
The backend exposes OData 8.x query endpoints over the entity model:
- **`GET /api/Drug`**:
  - Supports OData query options: `$select`, `$filter`, `$orderby`, `$expand`, `$count`, `$top` (max 100), `$skip`.
  - Example: `GET /api/Drug?$filter=contains(Name,'Аспирин')&$expand=Country&$orderby=Name asc&$top=20`.
- **`GET /api/Drug/{id}`**: Returns single drug entity with HTTP 200 or 404 ProblemDetails.
- **`POST /api/Drug`**: Creates a drug; payload: `CreateDrugRequest { Name, Manufacturer, CountryCode, CountryName }`.
- **`PUT /api/Drug/{id}`**: Updates drug details.
- **`DELETE /api/Drug/{id}`**: Deletes drug and cascades to associated `DrugItems`.

---

## 4. Python AI & Vector Microservice (`DrugsEnginePythonService`) Deep-Dive

The Python microservice is responsible for AI pharmaceutical enrichment, vectorization, and vector search in Qdrant:

### 4.1 AI Enrichment Pipeline (`gpt_service.py`)
- **Multi-Model Dynamic Pool**: Google Gemini AI Studio client managing a rotating fallback pool (`gemini-3.5-flash-lite`, `gemini-3.6-flash`, `gemini-3.7-flash`).
- **Batch Processing**: Enriches 25–50 scraped titles in a single prompt call with exponential backoff on HTTP 429 quota exhaustion.
- **Structured JSON Output Schema**:
  ```json
  [
    {
      "is_drug": true,
      "drug_name": "Аспирин Кардио",
      "active_ingredient": "Ацетилсалициловая кислота",
      "indications": ["Профилактика инфаркта миокарда", "Нестабильная стенокардия", "Профилактика тромбоэмболий"],
      "analogs": ["Кардиомагнил", "Тромбо АСС", "Ацекардол"],
      "description": "Применение: Аспирин Кардио, Диагнозы: Профилактика инфаркта миокарда, Нестабильная стенокардия, Профилактика тромбоэмболий, Действующее вещество: Ацетилсалициловая кислота, Аналоги: Кардиомагнил, Тромбо АСС, Ацекардол",
      "status": "VERIFIED"
    }
  ]
  ```

### 4.2 Vectorization Pipeline (`vectorization_service.py`)
- **Embedding Model**: `sentence-transformers/LaBSE` (Language-Agnostic BERT Sentence Embedding).
- **Dimension**: **768 float32** vector size.
- **Memory Safety & LRU Caching**: `@lru_cache(maxsize=5000)` caching immutable tuples `tuple[float, ...]` converted to isolated `list[float]` to prevent in-place mutation and memory leaks.
- **Batch Vectorization**: `vectorize_bulk(texts: List[str])` utilizing PyTorch GPU/CPU batched inference (`batch_size=32`).

### 4.3 Qdrant Vector Client (`qdrant_service.py`)
- **Collection Name**: `drug_collection`.
- **Distance Metric**: `Distance.COSINE`.
- **Payload Schema**:
  - `id`: UUID (matching .NET PostgreSQL `Drug.Id`).
  - `name`: string (Drug trade name).
  - `description`: string (Standardized pharmaceutical summary containing application, indications, active ingredient МНН, and analogs).
  - `category`: string (Therapeutic classification).

---

## 5. PostgreSQL Relational Data Models & Schema

The relational database (`myappdb`) is managed via EF Core 8 migrations:

```sql
-- Table: Country
CREATE TABLE "Country" (
    "Id" uuid NOT NULL,
    "Name" character varying(100) NOT NULL,
    "Code" character varying(2) NOT NULL,
    CONSTRAINT "PK_Country" PRIMARY KEY ("Id"),
    CONSTRAINT "AK_Country_Code" UNIQUE ("Code")
);

-- Table: Drug
CREATE TABLE "Drug" (
    "Id" uuid NOT NULL,
    "Name" character varying(150) NOT NULL,
    "Manufacturer" character varying(100) NOT NULL,
    "CountryCodeId" character varying(2) NOT NULL,
    CONSTRAINT "PK_Drug" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Drug_Country_CountryCodeId" FOREIGN KEY ("CountryCodeId") 
        REFERENCES "Country" ("Code") ON DELETE RESTRICT
);
CREATE INDEX "IX_Drug_Name" ON "Drug" ("Name");
CREATE INDEX "IX_Drug_CountryCodeId" ON "Drug" ("CountryCodeId");

-- Table: DrugStore
CREATE TABLE "DrugStore" (
    "Id" uuid NOT NULL,
    "Number" integer NOT NULL,
    "PhoneNumber" text NOT NULL,
    "DrugNetwork" character varying(100) NOT NULL,
    "Address_City" character varying(50) NOT NULL,
    "Address_Street" character varying(100) NOT NULL,
    "Address_House" character varying(50) NOT NULL,
    "Address_PostalCode" integer NOT NULL,
    CONSTRAINT "PK_DrugStore" PRIMARY KEY ("Id"),
    CONSTRAINT "IX_DrugStore_DrugNetwork_Number" UNIQUE ("DrugNetwork", "Number")
);

-- Table: DrugItem
CREATE TABLE "DrugItem" (
    "Id" uuid NOT NULL,
    "DrugId" uuid NOT NULL,
    "DrugStoreId" uuid NOT NULL,
    "Count" double precision NOT NULL,
    "Cost" numeric NOT NULL,
    CONSTRAINT "PK_DrugItem" PRIMARY KEY ("Id"),
    CONSTRAINT "IX_DrugItem_DrugId_DrugStoreId" UNIQUE ("DrugId", "DrugStoreId"),
    CONSTRAINT "FK_DrugItem_Drug_DrugId" FOREIGN KEY ("DrugId") 
        REFERENCES "Drug" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_DrugItem_DrugStore_DrugStoreId" FOREIGN KEY ("DrugStoreId") 
        REFERENCES "DrugStore" ("Id") ON DELETE CASCADE
);

-- Table: UserProfile
CREATE TABLE "UserProfile" (
    "Id" uuid NOT NULL,
    "ExternalId" character varying(100) NOT NULL,
    "Email" character varying(100) NULL,
    CONSTRAINT "PK_UserProfile" PRIMARY KEY ("Id"),
    CONSTRAINT "IX_UserProfile_ExternalId" UNIQUE ("ExternalId")
);

-- Table: FavoriteDrug
CREATE TABLE "FavoriteDrug" (
    "Id" uuid NOT NULL,
    "ProfileId" uuid NOT NULL,
    "ExternalUserId" character varying(100) NOT NULL,
    "DrugId" uuid NOT NULL,
    "DrugStoreId" uuid NULL,
    CONSTRAINT "PK_FavoriteDrug" PRIMARY KEY ("Id"),
    CONSTRAINT "IX_FavoriteDrug_ProfileId_DrugId_DrugStoreId" UNIQUE ("ProfileId", "DrugId", "DrugStoreId"),
    CONSTRAINT "FK_FavoriteDrug_UserProfile_ProfileId" FOREIGN KEY ("ProfileId") 
        REFERENCES "UserProfile" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_FavoriteDrug_Drug_DrugId" FOREIGN KEY ("DrugId") 
        REFERENCES "Drug" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_FavoriteDrug_DrugStore_DrugStoreId" FOREIGN KEY ("DrugStoreId") 
        REFERENCES "DrugStore" ("Id") ON DELETE CASCADE
);
```

---

## 6. Qdrant Vector Database Schema & Embedding Pipeline

### 6.1 Collection Configuration
- **Collection**: `drug_collection`
- **Vectors Config**:
  - `size`: `768`
  - `distance`: `Cosine`
  - `on_disk`: `false` (in-memory HNSW vector index for low-latency sub-10ms search)

### 6.2 Point Payload Structure
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "vector": [0.0245, -0.0118, 0.0891, "... (768 dimensions)"],
  "payload": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Аспирин Кардио 100мг №28",
    "description": "Применение: Аспирин Кардио, Диагнозы: Профилактика инфаркта миокарда, Нестабильная стенокардия, Профилактика тромбоэмболий, Действующее вещество: Ацетилсалициловая кислота, Аналоги: Кардиомагнил, Тромбо АСС, Ацекардол",
    "category": "Антиагрегантное средство"
  }
}
```

### 6.3 Semantic Search & Analog Computation
- **Cosine Score ($\cos \theta$)**: Ranging from `-1.0` to `1.0` (practically `0.5` to `1.0` for semantic similarity).
- **Similarity Percentage Formulation**: $\text{Similarity } \% = \max(0, \min(100, \text{Score} \times 100\%))$.
- **Analog Threshold**: Default $\ge 75\%$ similarity score match across active substance (МНН) and therapeutic profile.

---

## 7. Kafka & RabbitMQ Event-Driven Architecture

### 7.1 Kafka Ingestion Pipeline
- **Topic**: `drugs`
- **Producer**: .NET `KafkaProducer` (Singleton, `linger.ms=5`, `acks=all`, `enable.idempotence=true`).
- **Consumer Group**: `drug-vectorization-group` (Python `KafkaDrugConsumer`).
- **Message Payload**: JSON representation of `Drug` entity with W3C `traceparent` binary header.
- **Consumer Processing**:
  1. Micro-batch poll (`BATCH_SIZE = 25`, `BATCH_MAX_WAIT_SECONDS = 3.0s`).
  2. Batch Gemini validation (`get_batch_drug_info`).
  3. Filter non-drug products.
  4. Batch LaBSE vectorization (`vectorize_bulk`).
  5. Bulk upsert to Qdrant.
  6. Commit highest processed Kafka partition offset.

### 7.2 RabbitMQ RPC Query Pipeline
- **Queue**: `rpc_queue` (Durable, `x-max-priority: 10`).
- **Consumer**: Python `RabbitMQConsumer`.
- **Search Query Contract**:
  ```json
  {
    "query": "лекарство от головной боли с парацетамолом",
    "limit": 10,
    "score_threshold": 0.65,
    "filters": {
      "category": "Анальгетики"
    }
  }
  ```
- **Response Payload**:
  ```json
  {
    "status": "success",
    "query": "лекарство от головной боли с парацетамолом",
    "vector_dim": 768,
    "results": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "score": 0.8842,
        "name": "Цитрамон-П",
        "description": "Применение: Цитрамон-П, Диагнозы: Головная боль, Мигрень, Зубная боль, Действующее вещество: Ацетилсалициловая кислота + Парацетамол + Кофеин"
      }
    ]
  }
  ```

---

## 8. Telemetry, Observability & Health Checks Inventory

### 8.1 Prometheus Metrics Catalog
| Metric Name | Type | Subsystem / Source | Description & Labels |
|---|---|---|---|
| `drugsengine_parsing_drugs_discovered_total` | Counter | .NET (`ParsingManager`) | Total number of drug items discovered during pharmacy scraping |
| `drugsengine_parsing_duration_seconds` | Histogram | .NET (`ParsingManager`) | Execution latency of pharmacy parser runs in seconds |
| `drugsengine_parsing_errors_total` | Counter | .NET (`ParsingManager`) | Count of scraping errors and HTML parsing failures |
| `drugsengine_kafka_messages_produced_total` | Counter | .NET (`KafkaProducer`) | Total messages published to Kafka topic `drugs` |
| `drugsengine_kafka_produce_errors_total` | Counter | .NET (`KafkaProducer`) | Count of Kafka producer publishing errors |
| `drugsengine_python_drugs_processed_total` | Counter | Python (`KafkaConsumer`) | Total drugs successfully enriched and vectorized |
| `drugsengine_python_drug_errors_total` | Counter | Python (`KafkaConsumer`) | AI / Qdrant processing errors; labels: `{reason="llm_failed"\|"qdrant_failed"\|...}` |
| `drugsengine_python_drug_processing_seconds` | Summary | Python (`KafkaConsumer`) | Average batch processing latency in Python service |
| `process_cpu_usage` | Gauge | .NET Runtime | Process CPU utilization percentage [0.0 - 1.0] |
| `process_working_set_bytes` | Gauge | .NET Runtime | Resident working set memory allocation in bytes |
| `dotnet_gc_heap_size_bytes` | Gauge | .NET Runtime | Garbage Collector heap size in bytes |

### 8.2 Health Check Endpoints
1. **.NET API (`http://localhost:8080`)**:
   - `GET /health`: Comprehensive health status (evaluates PostgreSQL and Kafka connections). Returns JSON UI response.
   - `GET /health/live`: Liveness probe (HTTP 200 if process is up).
   - `GET /health/ready`: Readiness probe (evaluates `ready` tagged dependencies: PostgreSQL + Kafka).
2. **Python Microservice (`http://localhost:8000`)**:
   - `GET /health`: JSON response `{ "status": "Healthy", "services": { "qdrant": "UP", "python_embedding_service": "UP" } }`.
   - `GET /metrics`: Prometheus plain-text exposition format (`version=0.0.4`).

---

## 9. Frontend Contract & API Gateway Alignment Matrix

To fulfill the requirements of **PROJECT.md** and **ORIGINAL_REQUEST.md**, the frontend application (`DrugsEngine.Web`) requires four core functional domains. Here is the direct mapping from backend realities to the target REST / TypeScript contracts:

| Target Frontend Route / Screen | Required API Contract Endpoint | Backend Source / Resolution Mechanism | Contract Models |
|---|---|---|---|
| **1. Universal Smart Search** | `GET /api/v1/search/drugs?q={q}&mode={exact\|semantic}&limit={limit}` | **Exact**: ASP.NET OData `GET /api/Drug?$filter=contains(Name, '{q}')`<br>**Semantic**: Python Qdrant Cosine search via `rpc_queue` / REST | `DrugSearchResult`, `SearchMode`, `FilterBadge` |
| **2. Drug Details & Vector Analogs** | `GET /api/v1/drugs/{id}`<br>`GET /api/v1/drugs/{id}/analogs?threshold={threshold}` | **Details**: .NET `GET /api/Drug/{id}` + Python Gemini metadata<br>**Analogs**: Qdrant search with Drug's embedding + similarity score % + price delta | `DrugDetail`, `VectorAnalogItem`, `ChemicalProperty` |
| **3. Pharmacy Map & Stock Overview** | `GET /api/v1/pharmacies?drugId={id}&lat={lat}&lng={lng}&radius={km}` | .NET `DrugItem` + `DrugStore` join with `Address` coordinates and stock status (`In Stock`, `Low`, `Out of Stock`) | `PharmacyStockItem`, `PharmacyLocation`, `StockLevel` |
| **4. Telemetry & Observability** | `GET /api/v1/telemetry/health`<br>`GET /api/v1/telemetry/metrics` | Composite aggregator over .NET `/health`, Python `/health`, and Prometheus `/api/v1/query` | `SystemHealthOverview`, `ServiceHealthItem`, `MetricTimeSeries` |

### Stock Level Derivation Logic
- **`In Stock` (InStock)**: `DrugItem.Count > 5.0` (Emerald badge / Green indicator).
- **`Low Stock` (LowStock)**: `0.0 < DrugItem.Count <= 5.0` (Amber badge / Warning indicator).
- **`Out of Stock` (OutOfStock)**: `DrugItem.Count == 0.0` or no record for pharmacy (Rose/Red badge).

---
*Analysis generated and validated against DrugsEngine codebase.*
