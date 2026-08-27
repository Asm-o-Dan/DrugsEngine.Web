import os

content = """# 🌐 DrugsEngine API Contract Specification (v1.0.0)

**Document Version:** 1.0.0  
**Target Milestone:** M1 (Specs, Kanban & API Contracts)  
**Author:** API Contract Spec Miner (`spec_miner_m1_1`)  
**Specification Standard:** OpenAPI 3.1 & RESTful JSON / RFC 7807  
**Supported Architectures:** ASP.NET Core 8 Web API, Python 3.10 Fast/Flask & Qdrant Vector DB, Next.js 15 App Router

---

## 📑 Table of Contents
1. [Architectural Overview & Base URLs](#1-architectural-overview--base-urls)
2. [Universal Standards & Error Handling (RFC 7807)](#2-universal-standards--error-handling-rfc-7807)
3. [Domain 1: Universal Smart Search API](#3-domain-1-universal-smart-search-api)
   - 3.1 `GET /api/v1/search/drugs` (Exact, Semantic & Hybrid Search)
   - 3.2 `GET /api/v1/search/suggestions` (300ms Debounced Auto-Suggest)
4. [Domain 2: Drug Details & Qdrant Vector Analogs API](#4-domain-2-drug-details--qdrant-vector-analogs-api)
   - 4.1 `GET /api/v1/drugs/{id}` (Comprehensive Drug Metadata)
   - 4.2 `GET /api/v1/drugs/{id}/analogs` (Vector Analogs & Price Delta)
5. [Domain 3: Pharmacy Map & Stock Overview API](#5-domain-3-pharmacy-map--stock-overview-api)
   - 5.1 `GET /api/v1/pharmacies` (Geo-Spatial Pharmacy Locator & Stock)
   - 5.2 `GET /api/v1/pharmacies/{pharmacyId}` (Pharmacy Store Profile)
   - 5.3 `POST /api/v1/pharmacies/{pharmacyId}/reserve` (Drug Hold & Reservation)
   - 5.4 `GET /api/v1/pharmacies/{pharmacyId}/directions` (Route & Travel Time)
6. [Domain 4: Telemetry & Observability Dashboard API](#6-domain-4-telemetry--observability-dashboard-api)
   - 6.1 `GET /api/v1/telemetry/health` (Subsystem Health Diagnostics)
   - 6.2 `GET /api/v1/telemetry/metrics` (Unified Metrics Snapshot)
   - 6.3 `GET /api/v1/telemetry/metrics/history` (Timeseries for Graphs)
7. [TypeScript Type Definitions (contracts.ts)](#7-typescript-type-definitions-contractsts)
8. [Comprehensive Mock Responses](#8-comprehensive-mock-responses)
9. [Authoritative Spec Discovery & Traceability Matrix](#9-authoritative-spec-discovery--traceability-matrix)

---

## 1. Architectural Overview & Base URLs

The DrugsEngine web ecosystem is powered by a hybrid distributed architecture:
- **Core CRUD & Stock Storage:** .NET 8 Web API + Entity Framework Core + PostgreSQL
- **Semantic Vector Store & AI Enrichment:** Python 3.10 + Google Gemini + Qdrant Vector DB (768-dim LaBSE embeddings)
- **Message Bus:** Apache Kafka & RabbitMQ for event-driven synchronization between Ingestion and Vectorization
- **Web Client:** Next.js 15 (React 19, TypeScript, Tailwind CSS, shadcn/ui)

### Base URLs:
- **Production API Gateway:** `https://api.drugsengine.internal/api/v1`
- **Local Development (.NET Gateway):** `http://localhost:8080/api/v1`
- **Next.js Mock API Route Handlers:** `http://localhost:3000/api/v1`

---

## 2. Universal Standards & Error Handling (RFC 7807)

All API responses use standard JSON with UTF-8 encoding. All timestamps are in ISO 8601 (UTC) format (`YYYY-MM-DDTHH:mm:ss.sssZ`).

### 2.1 Standard Error Payload Schema (RFC 7807 Problem Details)

```json
{
  "type": "https://drugsengine.io/errors/RESOURCE_NOT_FOUND",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "Drug with ID 3fa85f64-5717-4562-b3fc-2c963f66afa6 was not found in catalog.",
  "instance": "/api/v1/drugs/3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "code": "DRUG_NOT_FOUND",
  "timestamp": "2026-08-27T19:30:00.000Z",
  "traceId": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
  "validationErrors": [
    {
      "field": "id",
      "message": "Must be a valid RFC 4122 UUID."
    }
  ]
}
```

### 2.2 Standard HTTP Status Codes

| Code | Meaning | Use Case |
|---|---|---|
| `200 OK` | Success | Successful GET, PUT, or query request. |
| `201 Created` | Created | Successful resource creation (e.g. Reservation). |
| `400 Bad Request` | Client Error | Malformed query parameter or invalid payload format. |
| `404 Not Found` | Not Found | Resource (drug, pharmacy, reservation) does not exist. |
| `422 Unprocessable` | Validation Error | Business rule violation (e.g., negative stock, invalid coordinates). |
| `500 Server Error` | Internal Failure | Unexpected internal exception or database crash. |
| `503 Service Unavailable` | Downstream Outage | Qdrant or Kafka cluster unreachable during strict mode queries. |

---

## 3. Domain 1: Universal Smart Search API

The search module provides sub-50ms lexical filtering and semantic vector matching across thousands of pharmaceutical products.

### 3.1 `GET /api/v1/search/drugs`

Performs an exact lexical search, a semantic vector search powered by Qdrant LaBSE embeddings, or a hybrid ranking query.

#### Query Parameters:

| Parameter | Type | Required | Default | Description | Example |
|---|---|---|---|---|---|
| `q` | `string` | **Yes** | — | Search query text (drug name, active ingredient, symptoms, or illness). | `ибупрофен от головной боли` |
| `mode` | `string` | No | `hybrid` | Search engine mode: `exact`, `semantic`, `hybrid`. | `hybrid` |
| `category` | `string` | No | — | Filter by medical category. | `Анальгетики` |
| `manufacturer` | `string` | No | — | Filter by pharmaceutical manufacturer. | `KRKA` |
| `countryCode` | `string` | No | — | ISO-3166 alpha-2 country code (e.g., `RU`, `DE`, `SI`, `FR`). | `SI` |
| `inStockOnly` | `boolean` | No | `false` | Return only items with active stock > 0 in at least one pharmacy. | `true` |
| `minPrice` | `number` | No | — | Minimum price filter (RUB). | `100.00` |
| `maxPrice` | `number` | No | — | Maximum price filter (RUB). | `1500.00` |
| `scoreThreshold`| `number` | No | `0.65` | Minimum cosine similarity threshold (0.0 – 1.0) for semantic hits. | `0.75` |
| `page` | `integer`| No | `1` | Page number (1-based index). | `1` |
| `limit` | `integer`| No | `10` | Number of items per page (1 to 50). | `10` |
| `sortBy` | `string` | No | `relevance` | Sort field: `relevance`, `price_asc`, `price_desc`, `name_asc`, `similarity_desc`. | `relevance` |

#### Success Response (`200 OK`):

```json
{
  "query": "ибупрофен от головной боли",
  "mode": "hybrid",
  "total": 24,
  "page": 1,
  "limit": 10,
  "totalPages": 3,
  "executionTimeMs": 42.8,
  "filtersApplied": {
    "category": null,
    "manufacturer": null,
    "countryCode": null,
    "inStockOnly": false,
    "priceRange": {
      "min": null,
      "max": null
    }
  },
  "items": [
    {
      "id": "e4b9d7a2-1a2c-49e3-85f0-61b6c7a10001",
      "name": "Нурофен Экспресс 200мг №24 капсулы",
      "manufacturer": "Reckitt Benckiser",
      "country": {
        "id": "7a305f56-42d4-4f4a-bc12-fef18f5091a1",
        "name": "Великобритания",
        "code": "GB"
      },
      "category": "Нестероидные противовоспалительные препараты (НПВП)",
      "activeIngredient": "Ибупрофен",
      "dosage": "200 мг",
      "releaseForm": "Капсулы мягкие желатиновые",
      "description": "Применение: анальгезирующее, противовоспалительное, жаропонижающее. Диагнозы: головная боль, мигрень, зубная боль, лихорадка.",
      "score": 0.945,
      "matchType": "HYBRID",
      "highlightedName": "<em>Нурофен</em> Экспресс 200мг №24 капсулы",
      "pricing": {
        "minPrice": 320.00,
        "maxPrice": 410.00,
        "currency": "RUB"
      },
      "stockSummary": {
        "inStock": true,
        "totalPharmacies": 48,
        "totalQuantity": 312
      }
    }
  ],
  "facets": {
    "manufacturers": [
      { "name": "Reckitt Benckiser", "count": 12 },
      { "name": "Фармстандарт", "count": 8 },
      { "name": "KRKA", "count": 4 }
    ],
    "countries": [
      { "code": "GB", "name": "Великобритания", "count": 12 },
      { "code": "RU", "name": "Россия", "count": 8 },
      { "code": "SI", "name": "Словения", "count": 4 }
    ],
    "categories": [
      { "name": "НПВП", "count": 18 },
      { "name": "Анальгетики", "count": 6 }
    ]
  }
}
```

---

### 3.2 `GET /api/v1/search/suggestions`

High-speed, lightweight endpoint optimized for 300ms client debouncing on input keystrokes.

#### Query Parameters:

| Parameter | Type | Required | Default | Description | Example |
|---|---|---|---|---|---|
| `q` | `string` | **Yes** | — | Search prefix (minimum 2 characters). | `ибу` |
| `limit` | `integer`| No | `6` | Maximum number of suggestions to return (1-10). | `6` |

#### Success Response (`200 OK`):

```json
{
  "query": "ибу",
  "suggestions": [
    {
      "id": "e4b9d7a2-1a2c-49e3-85f0-61b6c7a10001",
      "text": "Ибупрофен 400мг таблетки",
      "type": "DRUG",
      "category": "НПВП",
      "minPrice": 85.00,
      "currency": "RUB"
    },
    {
      "id": "e4b9d7a2-1a2c-49e3-85f0-61b6c7a10002",
      "text": "Ибупрофен суспензия для детей",
      "type": "DRUG",
      "category": "Жаропонижающие",
      "minPrice": 145.00,
      "currency": "RUB"
    },
    {
      "id": null,
      "text": "Ибупрофен от мигрени",
      "type": "SYMPTOM_QUERY",
      "category": "Семантический запрос",
      "minPrice": null,
      "currency": null
    }
  ]
}
```

---

## 4. Domain 2: Drug Details & Qdrant Vector Analogs API

Provides granular pharmacological details, active substance dossiers, and AI-driven vector analog cards featuring cosine similarity percentages and live price deltas.

### 4.1 `GET /api/v1/drugs/{id}`

Fetches full medical catalog metadata, chemical profile, indications, and aggregate availability.

#### Path Parameters:
- `id` (`string`, UUID) — Unique identifier of the drug.

#### Success Response (`200 OK`):

```json
{
  "id": "e4b9d7a2-1a2c-49e3-85f0-61b6c7a10001",
  "name": "Нурофен Экспресс 200мг №24 капсулы",
  "latinName": "Nurofen Express",
  "manufacturer": "Reckitt Benckiser",
  "country": {
    "id": "7a305f56-42d4-4f4a-bc12-fef18f5091a1",
    "name": "Великобритания",
    "code": "GB"
  },
  "category": "Нестероидные противовоспалительные препараты (НПВП)",
  "atcCode": "M01AE01",
  "activeIngredient": "Ибупрофен (Ibuprofen)",
  "dosage": "200 мг",
  "packageSize": "24 капсулы",
  "releaseForm": "Мягкие желатиновая капсулы овальной формы",
  "isPrescriptionRequired": false,
  "storageConditions": "Хранить при температуре не выше 25 °C в сухом, защищенном от света месте.",
  "shelfLifeMonths": 36,
  "indications": [
    "Головная боль и мигрень",
    "Зубная боль",
    "Боли в мышцах и суставах",
    "Лихорадочные состояния при ОРВИ и гриппе"
  ],
  "contraindications": [
    "Гиперчувствительность к ибупрофену",
    "Эрозивно-язвенные заболевания ЖКТ в фазе обострения",
    "Тяжелая почечная или печеночная недостаточность",
    "III триместр беременности"
  ],
  "sideEffects": [
    "Диспепсия, тошнота, боли в животе",
    "Головокружение",
    "Аллергические кожные реакции"
  ],
  "pharmacologicalAction": "Нестероидный противовоспалительный препарат, ингибирует циклооксигеназы 1 и 2 (ЦОГ-1 и ЦОГ-2), угнетает синтез простагландинов.",
  "fullDescription": "Применение: анальгезирующее, противовоспалительное, жаропонижающее. Диагнозы: головная боль, мигрень, зубная боль, лихорадка. Действующее вещество: Ибупрофен. Аналоги: МИГ 400, Фаспик, Ибупрофен.",
  "pricingSummary": {
    "minPrice": 320.00,
    "maxPrice": 410.00,
    "averagePrice": 365.50,
    "currency": "RUB"
  },
  "stockSummary": {
    "inStock": true,
    "pharmaciesWithStock": 48,
    "totalPharmacies": 52,
    "totalUnits": 312
  },
  "qdrantVectorStatus": {
    "isIndexed": true,
    "vectorDimension": 768,
    "collectionName": "drug_collection",
    "lastIndexedAt": "2026-08-27T18:45:00.000Z"
  }
}
```

---

### 4.2 `GET /api/v1/drugs/{id}/analogs`

Queries Qdrant vector database using the 768-dimensional LaBSE embedding of the source drug's description to discover therapeutic and direct chemical analogs.

#### Path Parameters:
- `id` (`string`, UUID) — Source drug identifier.

#### Query Parameters:

| Parameter | Type | Required | Default | Description | Example |
|---|---|---|---|---|---|
| `threshold` | `number` | No | `0.70` | Minimum cosine similarity score (0.0 to 1.0). | `0.75` |
| `limit` | `integer`| No | `6` | Maximum number of vector analog cards to return. | `6` |
| `sameActiveSubstanceOnly`| `boolean`| No | `false` | If true, filter to only matches sharing the exact same active substance. | `false` |
| `inStockOnly` | `boolean` | No | `false` | Only return analogs currently in stock in at least one pharmacy. | `true` |

#### Success Response (`200 OK`):

```json
{
  "sourceDrug": {
    "id": "e4b9d7a2-1a2c-49e3-85f0-61b6c7a10001",
    "name": "Нурофен Экспресс 200мг №24 капсулы",
    "activeIngredient": "Ибупрофен",
    "minPrice": 320.00,
    "currency": "RUB"
  },
  "thresholdApplied": 0.70,
  "totalAnalogsFound": 3,
  "analogs": [
    {
      "id": "f5c0e8b3-2b3d-50f4-9601-72c7d8b20002",
      "name": "МИГ 400 400мг №20 таблетки",
      "manufacturer": "Berlin-Chemie / Menarini",
      "country": {
        "id": "8b416067-53e5-505b-cd23-0f029061a2b2",
        "name": "Германия",
        "code": "DE"
      },
      "activeIngredient": "Ибупрофен",
      "dosage": "400 мг",
      "releaseForm": "Таблетки, покрытые пленочной оболочкой",
      "similarity": {
        "cosineScore": 0.962,
        "similarityPercentage": 96.2,
        "matchCategory": "DIRECT_GENERIC",
        "matchReason": "Идентичное действующее вещество (Ибупрофен) с ускоренным высвобождением"
      },
      "pricing": {
        "minPrice": 240.00,
        "currency": "RUB",
        "priceDelta": {
          "amountDifference": -80.00,
          "percentageDifference": -25.0,
          "isCheaper": true,
          "formattedLabel": "На 25% дешевле (экономия 80 ₽)"
        }
      },
      "stockSummary": {
        "inStock": true,
        "pharmacyCount": 42,
        "totalUnits": 198
      }
    },
    {
      "id": "d3a8c691-091b-38d2-74ef-50a5b6900003",
      "name": "Ибупрофен-АКОС 400мг №20 таблетки",
      "manufacturer": "Синтез АКОС",
      "country": {
        "id": "9c527178-64f6-616c-de34-1013a172b3c3",
        "name": "Россия",
        "code": "RU"
      },
      "activeIngredient": "Ибупрофен",
      "dosage": "400 мг",
      "releaseForm": "Таблетки",
      "similarity": {
        "cosineScore": 0.941,
        "similarityPercentage": 94.1,
        "matchCategory": "DIRECT_GENERIC",
        "matchReason": "Отечественный прямой дженерик ибупрофена"
      },
      "pricing": {
        "minPrice": 95.00,
        "currency": "RUB",
        "priceDelta": {
          "amountDifference": -225.00,
          "percentageDifference": -70.3,
          "isCheaper": true,
          "formattedLabel": "На 70% дешевле (экономия 225 ₽)"
        }
      },
      "stockSummary": {
        "inStock": true,
        "pharmacyCount": 50,
        "totalUnits": 540
      }
    },
    {
      "id": "c297b580-980a-27c1-63de-4f94a58ff004",
      "name": "Дексалгин 25мг №10 гранулы",
      "manufacturer": "Menarini",
      "country": {
        "id": "0d638289-7507-727d-ef45-2124b283c4d4",
        "name": "Италия",
        "code": "IT"
      },
      "activeIngredient": "Декскетопрофен",
      "dosage": "25 мг",
      "releaseForm": "Гранулы для приготовления раствора",
      "similarity": {
        "cosineScore": 0.815,
        "similarityPercentage": 81.5,
        "matchCategory": "THERAPEUTIC_ANALOG",
        "matchReason": "Аналогичный класс НПВП с мощным обезболивающим эффектом"
      },
      "pricing": {
        "minPrice": 490.00,
        "currency": "RUB",
        "priceDelta": {
          "amountDifference": 170.00,
          "percentageDifference": 53.1,
          "isCheaper": false,
          "formattedLabel": "На 53% дороже (+170 ₽)"
        }
      },
      "stockSummary": {
        "inStock": true,
        "pharmacyCount": 18,
        "totalUnits": 45
      }
    }
  ]
}
```

---

## 5. Domain 3: Pharmacy Map & Stock Overview API

The pharmacy module enables map visualization, stock level inspection (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`), driving directions, and item reservations.

### 5.1 `GET /api/v1/pharmacies`

Searches nearby pharmacies with stock levels for a selected drug.

#### Query Parameters:

| Parameter | Type | Required | Default | Description | Example |
|---|---|---|---|---|---|
| `drugId` | `string` | No | — | Drug ID to inspect stock availability for. | `e4b9d7a2-1a2c-49e3-85f0-61b6c7a10001` |
| `lat` | `number` | **Yes** | — | User latitude. | `55.7558` |
| `lng` | `number` | **Yes** | — | User longitude. | `37.6173` |
| `radiusKm` | `number` | No | `5.0` | Search radius in kilometers (0.5 to 50.0). | `10.0` |
| `network` | `string` | No | — | Filter by pharmacy brand name (e.g. `Ригла`, `Апрель`, `36.6`). | `Ригла` |
| `inStockOnly` | `boolean` | No | `false` | Only return pharmacies with stock > 0 for `drugId`. | `true` |
| `isOpenNow` | `boolean` | No | `false` | Only return pharmacies open right now. | `true` |

#### Success Response (`200 OK`):

```json
{
  "center": {
    "lat": 55.7558,
    "lng": 37.6173
  },
  "radiusKm": 10.0,
  "drugId": "e4b9d7a2-1a2c-49e3-85f0-61b6c7a10001",
  "totalPharmaciesFound": 2,
  "pharmacies": [
    {
      "id": "11111111-2222-3333-4444-555555555551",
      "network": "Ригла",
      "storeNumber": 142,
      "displayName": "Аптека «Ригла» №142",
      "address": {
        "city": "Москва",
        "street": "ул. Тверская",
        "house": "12 стр. 1",
        "postalCode": 125009,
        "formatted": "г. Москва, ул. Тверская, д. 12, стр. 1"
      },
      "location": {
        "lat": 55.7624,
        "lng": 37.6078,
        "distanceKm": 0.95
      },
      "phoneNumber": "+7 (495) 730-27-30",
      "workingHours": {
        "is24Hours": true,
        "schedule": "Круглосуточно (24/7)",
        "isOpenNow": true
      },
      "hasDelivery": true,
      "inventory": {
        "drugId": "e4b9d7a2-1a2c-49e3-85f0-61b6c7a10001",
        "drugName": "Нурофен Экспресс 200мг №24 капсулы",
        "stockLevel": "IN_STOCK",
        "quantity": 18,
        "price": 320.00,
        "currency": "RUB",
        "lastUpdated": "2026-08-27T19:15:00.000Z"
      }
    },
    {
      "id": "11111111-2222-3333-4444-555555555552",
      "network": "Апрель",
      "storeNumber": 88,
      "displayName": "Аптека «Апрель» №88",
      "address": {
        "city": "Москва",
        "street": "ул. Арбат",
        "house": "25",
        "postalCode": 119002,
        "formatted": "г. Москва, ул. Арбат, д. 25"
      },
      "location": {
        "lat": 55.7499,
        "lng": 37.5912,
        "distanceKm": 1.78
      },
      "phoneNumber": "+7 (800) 200-90-01",
      "workingHours": {
        "is24Hours": false,
        "schedule": "08:00 – 22:00",
        "isOpenNow": true
      },
      "hasDelivery": false,
      "inventory": {
        "drugId": "e4b9d7a2-1a2c-49e3-85f0-61b6c7a10001",
        "drugName": "Нурофен Экспресс 200мг №24 капсулы",
        "stockLevel": "LOW_STOCK",
        "quantity": 2,
        "price": 315.00,
        "currency": "RUB",
        "lastUpdated": "2026-08-27T18:50:00.000Z"
      }
    }
  ]
}
```

---

### 5.2 `GET /api/v1/pharmacies/{pharmacyId}`

Retrieves individual pharmacy store profile and complete in-stock catalog.

#### Path Parameters:
- `pharmacyId` (`string`, UUID) — Unique identifier of the pharmacy.

#### Success Response (`200 OK`):

```json
{
  "id": "11111111-2222-3333-4444-555555555551",
  "network": "Ригла",
  "storeNumber": 142,
  "displayName": "Аптека «Ригла» №142",
  "address": {
    "city": "Москва",
    "street": "ул. Тверская",
    "house": "12 стр. 1",
    "postalCode": 125009,
    "formatted": "г. Москва, ул. Тверская, д. 12, стр. 1"
  },
  "location": {
    "lat": 55.7624,
    "lng": 37.6078
  },
  "phoneNumber": "+7 (495) 730-27-30",
  "email": "store142@rigla.ru",
  "workingHours": {
    "is24Hours": true,
    "schedule": "Круглосуточно",
    "isOpenNow": true
  },
  "features": [
    "Круглосуточная работа",
    "Экспресс-бронирование за 15 минут",
    "Оплата картой / СБП / наличными",
    "Пандус для маломобильных граждан"
  ],
  "totalStockItems": 1420
}
```

---

### 5.3 `POST /api/v1/pharmacies/{pharmacyId}/reserve`

Creates a 24-hour drug hold reservation for local pickup at the target pharmacy.

#### Path Parameters:
- `pharmacyId` (`string`, UUID) — Pharmacy where the drug is reserved.

#### Request Body:

```json
{
  "drugId": "e4b9d7a2-1a2c-49e3-85f0-61b6c7a10001",
  "quantity": 2,
  "customerName": "Даниил",
  "customerPhone": "+7 (999) 123-45-67",
  "comment": "Заберу сегодня до 21:00"
}
```

#### Success Response (`201 Created`):

```json
{
  "reservationId": "res_8a92b3c4-9102-4f67-8899-aabbccddeeff",
  "pickupCode": "DG-8492",
  "status": "CONFIRMED",
  "pharmacy": {
    "id": "11111111-2222-3333-4444-555555555551",
    "displayName": "Аптека «Ригла» №142",
    "address": "г. Москва, ул. Тверская, д. 12, стр. 1"
  },
  "item": {
    "drugId": "e4b9d7a2-1a2c-49e3-85f0-61b6c7a10001",
    "drugName": "Нурофен Экспресс 200мг №24 капсулы",
    "quantity": 2,
    "unitPrice": 320.00,
    "totalPrice": 640.00,
    "currency": "RUB"
  },
  "reservedAt": "2026-08-27T19:35:00.000Z",
  "expiresAt": "2026-08-28T19:35:00.000Z",
  "instructions": "Покажите код брони DG-8492 фармацевту на кассе. Оплата при получении."
}
```

---

### 5.4 `GET /api/v1/pharmacies/{pharmacyId}/directions`

Calculates driving/walking travel time and route polyline from the user's current coordinates.

#### Query Parameters:
- `fromLat` (`number`, **Required**) — Origin latitude.
- `fromLng` (`number`, **Required**) — Origin longitude.
- `mode` (`string`, optional, default `driving`) — Travel mode: `driving`, `walking`, `transit`.

#### Success Response (`200 OK`):

```json
{
  "pharmacyId": "11111111-2222-3333-4444-555555555551",
  "travelMode": "driving",
  "distanceMeters": 1250,
  "distanceKm": 1.25,
  "durationMinutes": 4,
  "trafficLevel": "MODERATE",
  "routePolyline": "gfo}Efk|bG?e@`@i@t@e@x@o@...",
  "navigationSteps": [
    "Двигайтесь на север по ул. Моховая (400 м)",
    "Поверните направо на ул. Тверская (850 м)",
    "Аптека «Ригла» будет справа"
  ]
}
```

---

## 6. Domain 4: Telemetry & Observability Dashboard API

Real-time observability endpoint delivering live status, queue lags, vector counts, latency percentiles, and database metrics across all distributed microservices.

### 6.1 `GET /api/v1/telemetry/health`

Comprehensive system health check inspecting all backing services with individual latency checks.

#### Success Response (`200 OK` or `503 Service Unavailable`):

```json
{
  "status": "Healthy",
  "environment": "production",
  "timestamp": "2026-08-27T19:36:12.450Z",
  "uptimeSeconds": 864200,
  "version": "1.4.2",
  "services": {
    "dotnetApi": {
      "status": "UP",
      "latencyMs": 3.2,
      "details": ".NET 8.0.4 Kestrel runtime, MediatR CQRS pipeline active"
    },
    "postgresql": {
      "status": "UP",
      "latencyMs": 5.1,
      "details": "PostgreSQL 16.2 connected, active connections: 14/100"
    },
    "kafka": {
      "status": "UP",
      "latencyMs": 8.4,
      "details": "Confluent Kafka broker reachable, topic 'drug-ingestion-events' healthy"
    },
    "qdrant": {
      "status": "UP",
      "latencyMs": 4.6,
      "details": "Qdrant cluster v1.8.2 connected, collection 'drug_collection' ready"
    },
    "pythonEmbeddingService": {
      "status": "UP",
      "latencyMs": 12.8,
      "details": "LaBSE 768-dim model loaded on CUDA worker, Gemini LLM pool active"
    }
  }
}
```

---

### 6.2 `GET /api/v1/telemetry/metrics`

Structured JSON metrics snapshot aggregated for web visualization.

#### Success Response (`200 OK`):

```json
{
  "timestamp": "2026-08-27T19:36:12.450Z",
  "http": {
    "requestsPerSecond": 142.5,
    "errorRatePercentage": 0.04,
    "latency": {
      "p50Ms": 14.2,
      "p95Ms": 45.8,
      "p99Ms": 112.4
    },
    "totalRequests24h": 12450890
  },
  "kafka": {
    "consumerGroup": "drug-vectorization-group",
    "consumerLag": 3,
    "messagesInPerSecond": 24.8,
    "batchProcessingDurationSec": 0.84,
    "uncommittedOffsets": 0,
    "deadLetterQueueCount": 0
  },
  "qdrant": {
    "collectionName": "drug_collection",
    "totalVectors": 48250,
    "vectorDimension": 768,
    "indexedVectorsCount": 48250,
    "searchLatencyP95Ms": 18.5,
    "memoryUsageMb": 384.6
  },
  "database": {
    "activeConnections": 14,
    "idleConnections": 26,
    "maxConnections": 100,
    "databaseSizeBytes": 142850000,
    "databaseSizeFormatted": "136.2 MB",
    "cacheHitRatioPercentage": 99.4,
    "slowQueriesCount": 0
  },
  "runtime": {
    "cpuUsagePercentage": 8.5,
    "memoryUsedMb": 512.4,
    "memoryTotalMb": 2048.0,
    "gcPauseTimeMs": 1.2,
    "threadPoolWorkers": 24
  }
}
```

---

### 6.3 `GET /api/v1/telemetry/metrics/history`

Supplies time-series data points for charting latency spikes, Kafka lag drops, and request volumes in the frontend dashboard.

#### Query Parameters:
- `metric` (`string`, **Required**) — Metric key (`latency`, `requests_throughput`, `kafka_lag`, `qdrant_points`).
- `range` (`string`, optional, default `1h`) — Time range: `15m`, `1h`, `6h`, `24h`.
- `step` (`string`, optional, default `1m`) — Data resolution step: `10s`, `1m`, `5m`.

#### Success Response (`200 OK`):

```json
{
  "metric": "latency",
  "range": "1h",
  "step": "1m",
  "points": [
    { "timestamp": "2026-08-27T18:36:00Z", "value": 14.2 },
    { "timestamp": "2026-08-27T18:37:00Z", "value": 15.1 },
    { "timestamp": "2026-08-27T18:38:00Z", "value": 13.9 },
    { "timestamp": "2026-08-27T18:39:00Z", "value": 48.2 },
    { "timestamp": "2026-08-27T18:40:00Z", "value": 14.0 }
  ]
}
```

---

## 7. TypeScript Type Definitions (`contracts.ts`)

This TypeScript module represents the exact contracts for both frontend UI consumption and mock handler responses:

```typescript
/**
 * DrugsEngine Shared API Contracts (v1.0.0)
 * Location: DrugsEngine.Web/contracts/contracts.ts
 */

// ==========================================
// 1. Common Types & Error Handling
// ==========================================

export interface ApiErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  code: string;
  timestamp: string;
  traceId: string;
  validationErrors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface CountryDto {
  id: string;
  name: string;
  code: string;
}

export interface Money {
  minPrice: number;
  maxPrice?: number;
  averagePrice?: number;
  currency: "RUB" | "USD" | "EUR";
}

// ==========================================
// 2. Universal Search Contracts
// ==========================================

export type SearchMode = "exact" | "semantic" | "hybrid";
export type SortOption = "relevance" | "price_asc" | "price_desc" | "name_asc" | "similarity_desc";

export interface SearchDrugsQuery {
  q: string;
  mode?: SearchMode;
  category?: string;
  manufacturer?: string;
  countryCode?: string;
  inStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  scoreThreshold?: number;
  page?: number;
  limit?: number;
  sortBy?: SortOption;
}

export interface SearchDrugItem {
  id: string;
  name: string;
  manufacturer: string;
  country: CountryDto;
  category: string;
  activeIngredient: string;
  dosage: string;
  releaseForm: string;
  description: string;
  score: number;
  matchType: "EXACT" | "SEMANTIC" | "HYBRID";
  highlightedName?: string;
  pricing: Money;
  stockSummary: {
    inStock: boolean;
    totalPharmacies: number;
    totalQuantity: number;
  };
}

export interface SearchFacetItem {
  name?: string;
  code?: string;
  count: number;
}

export interface SearchDrugsResponse {
  query: string;
  mode: SearchMode;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  executionTimeMs: number;
  filtersApplied: Record<string, any>;
  items: SearchDrugItem[];
  facets: {
    manufacturers: SearchFacetItem[];
    countries: SearchFacetItem[];
    categories: SearchFacetItem[];
  };
}

export interface SearchSuggestionItem {
  id: string | null;
  text: string;
  type: "DRUG" | "ACTIVE_INGREDIENT" | "SYMPTOM_QUERY" | "BRAND";
  category?: string;
  minPrice?: number | null;
  currency?: string | null;
}

export interface SearchSuggestionsResponse {
  query: string;
  suggestions: SearchSuggestionItem[];
}

// ==========================================
// 3. Drug Details & Vector Analogs Contracts
// ==========================================

export interface DrugDetailsDto {
  id: string;
  name: string;
  latinName?: string;
  manufacturer: string;
  country: CountryDto;
  category: string;
  atcCode?: string;
  activeIngredient: string;
  dosage: string;
  packageSize: string;
  releaseForm: string;
  isPrescriptionRequired: boolean;
  storageConditions: string;
  shelfLifeMonths: number;
  indications: string[];
  contraindications: string[];
  sideEffects: string[];
  pharmacologicalAction: string;
  fullDescription: string;
  pricingSummary: Money;
  stockSummary: {
    inStock: boolean;
    pharmaciesWithStock: number;
    totalPharmacies: number;
    totalUnits: number;
  };
  qdrantVectorStatus: {
    isIndexed: boolean;
    vectorDimension: number;
    collectionName: string;
    lastIndexedAt: string;
  };
}

export type AnalogMatchCategory = "DIRECT_GENERIC" | "THERAPEUTIC_ANALOG" | "ACTIVE_SUBSTANCE_MATCH";

export interface VectorAnalogCard {
  id: string;
  name: string;
  manufacturer: string;
  country: CountryDto;
  activeIngredient: string;
  dosage: string;
  releaseForm: string;
  similarity: {
    cosineScore: number;
    similarityPercentage: number;
    matchCategory: AnalogMatchCategory;
    matchReason: string;
  };
  pricing: {
    minPrice: number;
    currency: string;
    priceDelta: {
      amountDifference: number;
      percentageDifference: number;
      isCheaper: boolean;
      formattedLabel: string;
    };
  };
  stockSummary: {
    inStock: boolean;
    pharmacyCount: number;
    totalUnits: number;
  };
}

export interface DrugAnalogsResponse {
  sourceDrug: {
    id: string;
    name: string;
    activeIngredient: string;
    minPrice: number;
    currency: string;
  };
  thresholdApplied: number;
  totalAnalogsFound: number;
  analogs: VectorAnalogCard[];
}

// ==========================================
// 4. Pharmacy Map & Stock Overview Contracts
// ==========================================

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface AddressDto {
  city: string;
  street: string;
  house: string;
  postalCode: number;
  formatted: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  distanceKm?: number;
}

export interface PharmacyInventoryItem {
  drugId: string;
  drugName: string;
  stockLevel: StockStatus;
  quantity: number;
  price: number;
  currency: string;
  lastUpdated: string;
}

export interface PharmacyDto {
  id: string;
  network: string;
  storeNumber: number;
  displayName: string;
  address: AddressDto;
  location: GeoLocation;
  phoneNumber: string;
  workingHours: {
    is24Hours: boolean;
    schedule: string;
    isOpenNow: boolean;
  };
  hasDelivery: boolean;
  inventory?: PharmacyInventoryItem;
}

export interface PharmacyListResponse {
  center: {
    lat: number;
    lng: number;
  };
  radiusKm: number;
  drugId?: string;
  totalPharmaciesFound: number;
  pharmacies: PharmacyDto[];
}

export interface CreateReservationRequest {
  drugId: string;
  quantity: number;
  customerName: string;
  customerPhone: string;
  comment?: string;
}

export interface ReservationResponse {
  reservationId: string;
  pickupCode: string;
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  pharmacy: {
    id: string;
    displayName: string;
    address: string;
  };
  item: {
    drugId: string;
    drugName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    currency: string;
  };
  reservedAt: string;
  expiresAt: string;
  instructions: string;
}

export interface DirectionsResponse {
  pharmacyId: string;
  travelMode: "driving" | "walking" | "transit";
  distanceMeters: number;
  distanceKm: number;
  durationMinutes: number;
  trafficLevel: "LOW" | "MODERATE" | "HEAVY";
  routePolyline: string;
  navigationSteps: string[];
}

// ==========================================
// 5. Telemetry & Observability Contracts
// ==========================================

export type ServiceHealthStatus = "UP" | "DOWN" | "DEGRADED";
export type OverallHealthStatus = "Healthy" | "Degraded" | "Unhealthy";

export interface ComponentHealth {
  status: ServiceHealthStatus;
  latencyMs: number;
  details: string;
}

export interface SystemHealthResponse {
  status: OverallHealthStatus;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
  version: string;
  services: {
    dotnetApi: ComponentHealth;
    postgresql: ComponentHealth;
    kafka: ComponentHealth;
    qdrant: ComponentHealth;
    pythonEmbeddingService: ComponentHealth;
  };
}

export interface SystemMetricsResponse {
  timestamp: string;
  http: {
    requestsPerSecond: number;
    errorRatePercentage: number;
    latency: {
      p50Ms: number;
      p95Ms: number;
      p99Ms: number;
    };
    totalRequests24h: number;
  };
  kafka: {
    consumerGroup: string;
    consumerLag: number;
    messagesInPerSecond: number;
    batchProcessingDurationSec: number;
    uncommittedOffsets: number;
    deadLetterQueueCount: number;
  };
  qdrant: {
    collectionName: string;
    totalVectors: number;
    vectorDimension: number;
    indexedVectorsCount: number;
    searchLatencyP95Ms: number;
    memoryUsageMb: number;
  };
  database: {
    activeConnections: number;
    idleConnections: number;
    maxConnections: number;
    databaseSizeBytes: number;
    databaseSizeFormatted: string;
    cacheHitRatioPercentage: number;
    slowQueriesCount: number;
  };
  runtime: {
    cpuUsagePercentage: number;
    memoryUsedMb: number;
    memoryTotalMb: number;
    gcPauseTimeMs: number;
    threadPoolWorkers: number;
  };
}

export interface MetricDataPoint {
  timestamp: string;
  value: number;
}

export interface MetricsHistoryResponse {
  metric: string;
  range: "15m" | "1h" | "6h" | "24h";
  step: string;
  points: MetricDataPoint[];
}
```

---

## 8. Comprehensive Mock Responses

The following mock catalog items are pre-validated against domain rules and ready to seed the standalone Next.js 15 frontend handlers:

### 8.1 Mock Catalog Seed Data (Top 5 Meds)
1. **Нурофен Экспресс (Ибупрофен)** — ID: `e4b9d7a2-1a2c-49e3-85f0-61b6c7a10001`
2. **МИГ 400 (Ибупрофен)** — ID: `f5c0e8b3-2b3d-50f4-9601-72c7d8b20002`
3. **Ибупрофен-АКОС (Ибупрофен)** — ID: `d3a8c691-091b-38d2-74ef-50a5b6900003`
4. **Дексалгин (Декскетопрофен)** — ID: `c297b580-980a-27c1-63de-4f94a58ff004`
5. **Парацетамол Экстра (Парацетамол)** — ID: `a186b470-8799-16b0-52cd-3e83a47ee005`

### 8.2 Mock Pharmacy Networks
- **Аптечная сеть «Ригла»** (Премиум аптеки, круглосуточно, высокий остаток)
- **Аптечная сеть «Апрель»** (Клубные цены, дискаунтер)
- **Аптечная сеть «Планета Здоровья»** (Удобное расположение, рецептурный отпуск)
- **Аптечная сеть «36.6»** (Центральные локации, экспресс-доставка)

---

## 9. Authoritative Spec Discovery & Traceability Matrix

### Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | Search | Exact Lexical Search | Case-insensitive substring match across drug names & manufacturers | `q: string, mode=exact, limit=10` | JSON Array of `SearchDrugItem` | 400 on empty `q` | `ORIGINAL_REQUEST.md`, `DrugController.cs` |
| 2 | Search | Semantic AI Search | Qdrant vector search via 768-dim LaBSE cosine embeddings | `q: string, mode=semantic, scoreThreshold=0.65` | JSON Array with similarity score & reasons | 503 if Qdrant down | `pythonProject2/app/services/qdrant_service.py` |
| 3 | Search | Hybrid Ranking | Combined BM25 lexical rank + Vector cosine score fusion | `q: string, mode=hybrid` | Ranked JSON search results | Fallback to exact if vector service timeout | `README.md`, `pythonProject2/app/mq/rabbit_consumer.py` |
| 4 | Search | Auto-complete Suggest | 300ms debounced prefix suggestion endpoint | `q: string (min 2 chars), limit: 6` | Array of `SearchSuggestionItem` | 200 with empty array if `< 2` chars | `ORIGINAL_REQUEST.md § 2` |
| 5 | Catalog | Drug Detail View | Pharmacological profile, ATC code, indications & price range | `id: UUID` | `DrugDetailsDto` JSON | 404 with RFC 7807 problem details | `Drug.cs`, `DrugMappingProfile.cs` |
| 6 | Analogs | Qdrant Vector Analogs | Direct generic and therapeutic analogs with cosine score % | `id: UUID, threshold: float` | `DrugAnalogsResponse` with price deltas | 404 if source drug missing | `pythonProject2/app/services/gpt_service.py` |
| 7 | Analogs | Price Delta Calculation | Computes savings amount and percentage vs source drug | `sourceDrug.price, analog.price` | `amountDifference, percentageDifference, isCheaper` | Returns 0 if prices unlisted | `ORIGINAL_REQUEST.md § 2` |
| 8 | Pharmacy | Geo-Spatial Map Search | Nearest pharmacy lookup within radius with stock levels | `lat, lng, radiusKm, drugId` | `PharmacyListResponse` | 422 if coordinates invalid | `DrugStore.cs`, `Address.cs`, `DrugItem.cs` |
| 9 | Pharmacy | Stock Level Categorization | Categorizes inventory into IN_STOCK, LOW_STOCK, OUT_OF_STOCK | `DrugItem.Count` | `StockStatus` badge enum | Stock = 0 maps to `OUT_OF_STOCK` | `DrugItem.cs`, `DrugItemValidator.cs` |
| 10| Pharmacy | 24-Hour Drug Reservation | Hold creation with unique pickup code and expiration | `POST /pharmacies/{id}/reserve` | `ReservationResponse` with pickup code | 400 if item out of stock | `ORIGINAL_REQUEST.md § 2` |
| 11| Pharmacy | Directions & Route Info | ETA and step-by-step route to pharmacy | `fromLat, fromLng, travelMode` | `DirectionsResponse` | 400 on invalid coordinates | `ORIGINAL_REQUEST.md § 2` |
| 12| Telemetry| Subsystem Health Check | Real-time UP/DOWN status for .NET, Postgres, Kafka, Qdrant | `GET /telemetry/health` | `SystemHealthResponse` (200/503) | 503 if any critical service DOWN | `pythonProject2/app/health_server.py` |
| 13| Telemetry| Live Metrics Snapshot | HTTP latency percentiles, Kafka lag, Qdrant vectors, DB pool | `GET /telemetry/metrics` | `SystemMetricsResponse` | 500 on telemetry collector crash | `pythonProject2/app/telemetry.py`, `monitoring/prometheus.yml` |
| 14| Telemetry| Timeseries Metrics History | Historical points for rendering dashboard trend charts | `metric, range, step` | `MetricsHistoryResponse` | 400 if metric name unknown | `monitoring/grafana` dashboards |

---

### Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---|---|---|
| 1 | Search | Empty query string `q=""` | Returns HTTP `400 Bad Request` with `VALIDATION_FAILED` detail. |
| 2 | Search | Special characters / SQL injection in `q` (`"'; DROP TABLE Drugs; --"`) | Safely sanitized by parameter binding; returns empty result set or semantic fallback without error. |
| 3 | Search | Extreme unicode characters (`Ёлка`, `𝔇𝔯𝔲𝔤𝔰`, emojis) | Normalized via Unicode NFC invariant culture parser (per Post P1 standard). |
| 4 | Analogs | Drug with zero vector analogs above threshold | Returns `totalAnalogsFound: 0` and empty `analogs: []` array with HTTP `200 OK`. |
| 5 | Analogs | Negative price delta (analog is more expensive) | `isCheaper` set to `false`, `amountDifference` is positive, formatted as `"На X% дороже (+Y ₽)"`. |
| 6 | Pharmacy Map | Coordinates in middle of ocean / no pharmacies nearby | Returns HTTP `200 OK` with empty `pharmacies: []` array and `totalPharmaciesFound: 0`. |
| 7 | Pharmacy Reservation | Quantity requested exceeds available stock (`Count < requested`) | Returns HTTP `422 Unprocessable Entity` with `INSUFFICIENT_STOCK` error code. |
| 8 | Telemetry | Qdrant or Kafka container offline | `/telemetry/health` marks component as `DOWN`, overall status as `Degraded` or `Unhealthy`, status code `503`. |
| 9 | Auto-suggest | Single letter input (`q="a"`) | Returns HTTP `200 OK` with empty suggestions list without stressing the database. |

"""

with open(r"C:\DrugEngine\.agents\spec_miner_m1_1\api_spec.md", "w", encoding="utf-8") as f:
    f.write(content)
print("api_spec.md successfully written. Length:", len(content))
