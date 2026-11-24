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

## Реализация в бэкенде

Эндпоинты реализованы в DrugsEngine (`Infrastructure/API/Controllers/V1`, запросы — `Infrastructure/Dal/Queries/CatalogQueries.cs`).

- `exact`: подстрока в названии/производителе (ILIKE) + триграммное сходство слов (pg_trgm) — находит запросы с опечатками.
- `semantic`, `analogs`, описание препарата — через HTTP API DrugsEnginePythonService. Если он не настроен или недоступен,
  `search?mode=semantic` и `analogs` отвечают **503** (problem+json); веб-клиент показывает понятное сообщение.
- `semantic` — гибрид: кандидаты из векторного поиска (multilingual-e5-small), остаются содержащие слово запроса
  или почти равные лучшему (`SemanticSearch:MinScore`, `RelativeWindow`).
- `analogs` — сначала препараты с тем же действующим веществом (`similarity = 1`), затем векторные соседи
  выше `SemanticSearch:MinSimilarity`. Аналоги по веществу отдаются и при недоступном векторном поиске.
- `popular`: данных о популярности запросов пока нет — отдаются лекарства (с известным действующим веществом), которые продаются в наибольшем числе аптек. На главной блок называется «Есть в большинстве аптек».

## Откуда берутся данные (сеть «Доктор», aptekadoktor.com)

| Поле контракта | Источник |
|---|---|
| `name`, `manufacturer`, `country` | прайс сайта; фасовка («№30») — часть названия. Страна без кода ISO (например, «ПМР») или не указанная сайтом — `null` |
| `form` | определяется по сокращениям в названии («таб», «капс», «р-р» с дозировкой…) |
| `activeIngredient` | МНН из скобок в конце названия, если сайт его указал («Нольпаза таб 40 мг №30(Пантопразол)»); иначе `null` |
| `offers[].price`, `offers[].updatedAt` | цена и дата обновления из прайса сайта |
| `pharmacy.number` | внутренний номер, назначается один раз; у сайта номеров нет, аптека определяется по телефону |
| `pharmacy.hours` | страница контактов сайта |
| `pharmacy.location` | координаты из ссылки на карту в прайсе; если их нет — геокодер (Nominatim, по флагу) |
| `description`, `descriptionSource` | векторный индекс Python-сервиса (текст от LLM, `generated`) |

Предложения, которые парсер не видел дольше `Catalog:OfferMaxAge` (3 дня), не отдаются.

## Координаты аптек (карта и «ближайшая аптека»)

Карта, расстояния и маршруты работают только для аптек с `location: { lat, lng }` (WGS 84).
Аптеки без координат остаются в списках, но не попадают на карту.

Предлагаемая схема для бэкенда:

Реализовано: координаты берутся с сайта сети, для аптек без них — геокодирование Nominatim
(`Geocoding__Enabled`, `Geocoding__UserAgent`). У двух аптек Днестровска сайт отдаёт одинаковые координаты
(центр города) — они показываются приблизительно.

Местоположение пользователя на сервер не отправляется: расстояния считаются в браузере.
