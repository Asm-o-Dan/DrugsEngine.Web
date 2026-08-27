## 2026-08-27T19:34:13Z

You are the API Contract Spec Miner for the DrugsEngine project.
Your working directory is C:\DrugEngine\.agents\spec_miner_m1_1\
The original request is at C:\DrugEngine\.agents\ORIGINAL_REQUEST.md
The project specification is at C:\DrugEngine\PROJECT.md

Task:
1. Mine and define the complete API requirements for the 4 core frontend modules:
   - Universal Smart Search (Exact query, Semantic AI/Qdrant query with filters, autocomplete suggestions)
   - Drug Details & Qdrant Vector Analogs (drug metadata, active substances, dosages, vector analog cards with similarity % and price deltas)
   - Pharmacy Map & Stock Overview (geolocation, inventory status, stock levels, reserve & directions)
   - Telemetry & Observability Dashboard (.NET backend health, Kafka queue metrics, Qdrant collection size, Postgres health, request latency)
2. Detail all required query parameters, request/response bodies, HTTP status codes, error payloads, and mock responses.
3. Write your findings to C:\DrugEngine\.agents\spec_miner_m1_1\api_spec.md and provide a handoff.md.
4. Send your completion message back to the orchestrator with the report path.
