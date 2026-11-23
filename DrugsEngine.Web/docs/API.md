# Контракт API для веб-клиента

Веб-клиент ходит в бэкенд **только с сервера** (Server Components и `/api/suggest`), поэтому CORS не нужен.
Каждый ответ валидируется схемами из [`lib/contracts.ts`](../lib/contracts.ts): если ответ не совпадает со схемой,
страница показывает ошибку, а в лог сервера пишется, какие поля не сошлись.

Базовый адрес задаётся переменной `DRUGSENGINE_API_URL`. Все ответы — JSON, цены — числа в валюте аптеки,
даты — ISO 8601 (UTC). Для «не найдено» возвращайте 404, для прочих ошибок — `application/problem+json` (RFC 7807).

| Метод | Путь | Ответ (схема) | Используется |
|---|---|---|---|
| GET | `/api/v1/drugs/search?q&mode&sort&manufacturer&country&page&pageSize` | `SearchResponse` | `/search` |
| GET | `/api/v1/drugs/suggest?q&limit` | `{ items: Suggestion[] }` | подсказки в поиске |
| GET | `/api/v1/drugs/popular?limit` | `{ items: DrugSummary[] }` | главная |
| GET | `/api/v1/drugs/{id}` | `DrugDetails` или 404 | карточка препарата |
| GET | `/api/v1/drugs/{id}/analogs?limit` | `{ items: Analog[] }` | «Похожие препараты» |
| GET | `/api/v1/pharmacies?network&city&q` | `PharmacyList` | `/pharmacies` |
| GET | `/api/v1/pharmacies/{id}` | `PharmacyDetails` или 404 | страница аптеки |
| GET | `/api/v1/stats` | `CatalogStats` | главная, `/status` |
| GET | `/health` | любой 2xx | `/status` |

## Параметры поиска

- `mode`: `exact` — по названию, действующему веществу и производителю (Postgres, например `pg_trgm`);
  `semantic` — по смыслу описаний (Qdrant через Python-сервис).
- `sort`: `relevance` | `price_asc` | `price_desc` | `name`.
- `manufacturer` — точное значение из `facets.manufacturers[].value`; `country` — ISO-код из `facets.countries[].value`.
- Фасеты считаются по всей выдаче запроса **до** применения фильтров `manufacturer`/`country`.

## Соответствие доменной модели бэкенда

| Поле контракта | Откуда в DrugsEngine |
|---|---|
| `DrugSummary.id/name/manufacturer` | `Drug.Id/Name/Manufacturer` |
| `DrugSummary.country` | `Country.Code/Name` |
| `minPrice/maxPrice/pharmacyCount/updatedAt` | агрегаты по `DrugItem` (`Cost`, количество аптек, время последнего парсинга) |
| `form`, `activeIngredient` | **нет в модели** — пока отдавать `null` |
| `Offer.pharmacy` | `DrugStore` (`DrugNetwork`, `Number`, `Address`, `PhoneNumber`) |
| `Offer.updatedAt` | **нет в модели** — нужно поле времени обновления у `DrugItem` |
| `DrugDetails.description/descriptionSource` | payload Qdrant (`description`); `generated`, если текст получен от LLM |
| `Analog.similarity` | score поиска в Qdrant по вектору препарата |
| `Pharmacy.hours`, `location` | **нет в модели** — `null` |
