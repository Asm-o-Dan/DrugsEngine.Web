# 🤝 Handoff Report: DrugsEngine Codebase Architecture Exploration

**Agent**: `explorer_m1_1` (Codebase Architecture Explorer)  
**Milestone**: M1 (Specs, Kanban & API Contracts)  
**Target Recipient**: Orchestrator (`orchestrator_1` / Parent Agent)  
**Deliverable Document**: `C:\DrugEngine\.agents\explorer_m1_1\analysis.md`  

---

## 1. Observation

### 1.1 Backend .NET 8 Infrastructure & Data Layer
- **Entry point and configuration**: In `C:\DrugEngine\DrugsEngine\Infrastructure\Program.cs`:
  - Lines 55–62: OData EDM model registered for `Drug` entity set at route prefix `"api"` (`/api/Drug`).
  - Lines 69–108: Dependency injection for read/write repositories (`IDrugReadRepository`, `IDrugStoreReadRepository`, `IDrugItemReadRepository`, `ICountryReadRepository`, `IUserProfileReadRepository`, `IFavoriteDrugReadRepository`), `IUnitOfWork`, `DoctorParser`, `ParsingManager`, and `IKafkaProducer`.
  - Lines 117–120: OData query capabilities enabled (`.Select().Filter().OrderBy().Expand().Count().SetMaxTop(100)`).
  - Lines 161–164: Health checks registered for PostgreSQL (`AddNpgSql`) and Kafka (`AddKafka`) tagged with `"ready"`.
  - Lines 171–187: OpenTelemetry Tracing (`DrugsEngine`, `DrugsEngine.Parsing`, `DrugsEngine.Kafka`) with OTLP exporter on port `4317` and Prometheus exporter via `.AddPrometheusExporter()` on `/metrics`.
  - Lines 279–297: Health check endpoints mapped at `/health`, `/health/live`, `/health/ready`, and `/metrics`.
- **Controllers**: In `C:\DrugEngine\DrugsEngine\Infrastructure\API\Controllers\DrugController.cs`:
  - `[Route("api/Drug")]`: Exposes `[HttpGet]` with `[EnableQuery]`, `[HttpGet("{id}")]`, `[HttpPost]` (`CreateDrugRequest`), `[HttpPut("{id}")]` (`UpdateDrugRequest`), and `[HttpDelete("{id}")]`.
- **Domain Entities & Value Objects**:
  - `Drug.cs` (`Domain/Entities/Drug.cs`): Properties `Name` (max 150), `Manufacturer` (max 100), `CountryCodeId` (FK to Country ISO Code), `Country`, `DrugItems`.
  - `DrugItem.cs` (`Domain/Entities/DrugItem.cs`): Properties `DrugId` (FK), `DrugStoreId` (FK), `Count` (double), `Cost` (decimal), `Drug`, `DrugStore`.
  - `DrugStore.cs` (`Domain/Entities/DrugStore.cs`): Properties `Number` (int), `PhoneNumber` (string), `DrugNetwork` (string, max 100), owned `Address` Value Object (`City`, `Street`, `House`, `PostalCode`), navigation `DrugItems`.
  - `Country.cs` (`Domain/Entities/Country.cs`): `Name` (max 100), `Code` (max 2, ISO-3166-1 alpha-2).
  - `UserProfile.cs` & `FavoriteDrug.cs` (`Domain/Entities/`): User bookmarking system with `ExternalId`, `Email`, and favorite drug/store associations.
- **Relational Mappings & Constraints**:
  - `DrugConfiguration.cs`: FK `CountryCodeId` -> `Country.Code` with `OnDelete(DeleteBehavior.Restrict)`.
  - `DrugItemConfiguration.cs`: Composite unique index on `{ di.DrugId, di.DrugStoreId }`.
  - `DrugStoreConfiguration.cs`: Composite unique index on `{ ds.DrugNetwork, ds.Number }`.
- **Kafka Producer**: In `C:\DrugEngine\DrugsEngine\Infrastructure\Kafka\KafkaProducer.cs`:
  - Produces serialized JSON of `Drug` to topic `"drugs"` with W3C `traceparent` headers, singleton producer lifecycle, and idempotence enabled.

### 1.2 Python AI, Embedding & Vector Layer
- **Microservice Structure**: Located in `C:\DrugEngine\pythonProject2\app\`:
  - `main.py`: Initializes `VectorizationService` and `QdrantService`, ensures Qdrant collection `"drug_collection"`, starts threaded HTTP health/metrics server on port `8000`, and supervises parallel `KafkaDrugConsumer` and `RabbitMQConsumer` threads.
  - `services/vectorization_service.py`: Uses `sentence-transformers/LaBSE` with 768-dimensional embeddings, immutable tuple caching with `@lru_cache(maxsize=5000)` and batch encoding (`batch_size=32`).
  - `services/qdrant_service.py`: Connects to Qdrant on port `6333`, initializes collection `"drug_collection"` with `Distance.COSINE`, upserts points with payload `{ name, id, description, category }`, and searches with cosine distance scoring.
  - `services/gpt_service.py`: Multi-model Gemini pool (`gemini-3.5-flash-lite`, `gemini-3.6-flash`, `gemini-3.7-flash`) for batch enrichment of 25–50 drug items with structured pharmaceutical JSON schema (verifying `is_drug`, extracting normalized МНН `active_ingredient`, 3 `indications`, 3 `analogs`, formatted `description`, and `status`).
  - `mq/kafka_consumer.py`: Micro-batches 25 items or 3.0s timeout from Kafka topic `"drugs"`, triggers Gemini validation, generates bulk LaBSE embeddings, and stores vectors into Qdrant.
  - `mq/rabbit_consumer.py`: Consumes `SearchQueryMessage` from `rpc_queue`, executes Qdrant vector search, and replies to `reply_to` queue with matched drugs, cosine scores, and payloads.
  - `health_server.py` & `telemetry.py`: Threaded HTTP server on port `8000` exposing `/health` (Qdrant connection health) and `/metrics` (Prometheus exposition format).

### 1.3 Shared Services, Monitoring & Observability
- **Docker Compose Stacks**:
  - `SharedServices/docker-compose.yml`: Kafka (`9092`), Zookeeper (`2181`), RabbitMQ (`5672`/`15672`).
  - `pythonProject2/docker-compose.yaml`: Python Embedding Service (`8000`), Qdrant (`6333`/`6334`).
  - `DrugsEngine/docker-compose.yml`: PostgreSQL (`5432`), .NET App (`8080`), EF Core migrations.
  - `monitoring/docker-compose.yml`: Prometheus (`9090`), Grafana (`3000`), Loki (`3100`), Promtail, Seq (`5341`/`8081`), Jaeger (`16686`/`4317`).
- **Telemetry Metrics**:
  - .NET: `drugsengine_parsing_drugs_discovered_total`, `drugsengine_parsing_duration_seconds`, `drugsengine_parsing_errors_total`, `drugsengine_kafka_messages_produced_total`, `drugsengine_kafka_produce_errors_total`, `process_cpu_usage`, `process_working_set_bytes`, `dotnet_gc_heap_size_bytes`.
  - Python: `drugsengine_python_drugs_processed_total`, `drugsengine_python_drug_errors_total{reason=...}`, `drugsengine_python_drug_processing_seconds`.

---

## 2. Logic Chain

1. **Dual Search Paradigm**:
   - .NET backend implements exact text filtering via PostgreSQL/OData (`/api/Drug?$filter=contains(...)`).
   - Python microservice implements semantic vector search via LaBSE embeddings (768 dimensions) and Qdrant cosine similarity.
   - *Inference*: The frontend Universal Smart Search requires a unified API abstraction (`/api/v1/search/drugs`) that switches between or combines exact and semantic search modes based on user selection or query semantics.
2. **Vector Analog Generation**:
   - The Qdrant payload stores the standardized description, category, and drug name, and vectors are indexed by `Drug.Id`.
   - *Inference*: Querying vector analogs for a drug (`GET /api/v1/drugs/{id}/analogs`) involves querying Qdrant using the target drug's pre-computed vector or finding the nearest neighbor points with cosine similarity $\ge \text{threshold}$ (default 75%), combined with retail price comparison from `DrugItem.Cost`.
3. **Pharmacy Stock & Geolocation**:
   - `DrugStore` stores physical address (`City`, `Street`, `House`, `PostalCode`, `PhoneNumber`, `DrugNetwork`).
   - `DrugItem` connects `Drug` and `DrugStore` with `Count` and `Cost`.
   - *Inference*: Stock levels can be mapped into 3 standard UX states: `In Stock` (`Count > 5.0`), `Low Stock` (`0 < Count <= 5.0`), and `Out of Stock` (`Count == 0.0`), with pharmacy distance calculated from geolocation coordinates.
4. **Live System Observability**:
   - All components expose standard telemetry: .NET API at `/health` & `/metrics` (port 8080), Python service at `/health` & `/metrics` (port 8000), Prometheus at port 9090.
   - *Inference*: The Telemetry Dashboard screen in the frontend can display live subsystem status indicators (.NET, Python, Kafka, RabbitMQ, PostgreSQL, Qdrant) alongside throughput and latency gauges sourced from Prometheus metrics.

---

## 3. Caveats

- **No Caveats** regarding backend code exploration; all controllers, entities, configurations, Python services, Kafka pipelines, and Docker compose files were directly read and analyzed from disk.
- **Frontend Independence**: The frontend web application (`DrugsEngine.Web`) must include mock data generators and client adapters that conform to the OpenAPI 3.1 schema so that frontend UI development and testing can proceed autonomously without requiring all backend Docker services to be running simultaneously.

---

## 4. Conclusion

The backend ecosystem is fully structured and operational. The technical contracts, data models, and metrics catalog documented in `C:\DrugEngine\.agents\explorer_m1_1\analysis.md` provide the complete foundation for:
1. Writing the OpenAPI 3.1 specification (`contracts/openapi.json`).
2. Creating the TypeScript domain models (`contracts/contracts.ts`).
3. Designing the UI/UX specifications for the 4 core screens (Universal Smart Search, Drug Details & Vector Analogs, Pharmacy Map & Stock Overview, and System Observability Dashboard).

---

## 5. Verification Method

To independently verify the observations and data structures:
1. **Inspect C# Models**:
   - `view_file` on `C:\DrugEngine\DrugsEngine\Domain\Entities\Drug.cs`
   - `view_file` on `C:\DrugEngine\DrugsEngine\Domain\Entities\DrugItem.cs`
   - `view_file` on `C:\DrugEngine\DrugsEngine\Domain\Entities\DrugStore.cs`
   - `view_file` on `C:\DrugEngine\DrugsEngine\Infrastructure\Program.cs`
2. **Inspect Python AI & Vector Services**:
   - `view_file` on `C:\DrugEngine\pythonProject2\app\services\vectorization_service.py`
   - `view_file` on `C:\DrugEngine\pythonProject2\app\services\qdrant_service.py`
   - `view_file` on `C:\DrugEngine\pythonProject2\app\services\gpt_service.py`
   - `view_file` on `C:\DrugEngine\pythonProject2\app\mq\kafka_consumer.py`
3. **Inspect Observability Dashboard & Metrics**:
   - `view_file` on `C:\DrugEngine\monitoring\grafana\dashboards\drugsengine-overview.json`
   - `view_file` on `C:\DrugEngine\DrugsEngine\Infrastructure\Telemetry\DrugsEngineTelemetry.cs`
   - `view_file` on `C:\DrugEngine\pythonProject2\app\telemetry.py`
