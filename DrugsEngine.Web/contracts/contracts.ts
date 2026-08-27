/**
 * DrugsEngine Shared API & Domain Contracts (v1.0.0)
 * Locations:
 *  - contracts/contracts.ts
 *  - DrugsEngine.Web/contracts/contracts.ts
 * Standard: OpenAPI 3.1.0 Compatible & TypeScript Strict Mode
 */

// ============================================================================
// 1. Universal Error Schema (RFC 7807 Problem Details)
// ============================================================================

export interface ValidationErrorItem {
  field: string;
  message: string;
}

export type ProblemDetails = ApiErrorResponse;

export interface ApiErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  code: string;
  timestamp: string;
  traceId: string;
  validationErrors?: ValidationErrorItem[];
}

export interface CountryDto {
  id: string;
  name: string;
  code: string; // ISO 3166-1 alpha-2 (e.g. RU, DE, GB, SI, IT)
}

export interface Money {
  minPrice: number;
  maxPrice?: number;
  averagePrice?: number;
  currency: 'RUB' | 'USD' | 'EUR';
}

export interface PriceRangeFilter {
  min?: number | null;
  max?: number | null;
}

// ============================================================================
// 2. Universal Search Domain Contracts
// ============================================================================

export type SearchMode = 'exact' | 'semantic' | 'hybrid';
export type MatchType = 'EXACT' | 'SEMANTIC' | 'HYBRID';
export type SortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'similarity_desc';

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
  score: number; // 0.0 to 1.0 (relevance or cosine similarity)
  matchType: MatchType;
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
  filtersApplied: {
    category?: string | null;
    manufacturer?: string | null;
    countryCode?: string | null;
    inStockOnly?: boolean;
    priceRange?: PriceRangeFilter;
    scoreThreshold?: number | null;
  };
  items: SearchDrugItem[];
  facets: {
    manufacturers: SearchFacetItem[];
    countries: SearchFacetItem[];
    categories: SearchFacetItem[];
  };
}

export type SuggestionType =
  | 'DRUG'
  | 'ACTIVE_INGREDIENT'
  | 'SYMPTOM_QUERY'
  | 'BRAND';

export interface SearchSuggestionItem {
  id: string | null;
  text: string;
  type: SuggestionType;
  category?: string;
  minPrice?: number | null;
  currency?: string | null;
}

export interface SearchSuggestionsResponse {
  query: string;
  suggestions: SearchSuggestionItem[];
}

// ============================================================================
// 3. Drug Details & Vector Analogs Contracts
// ============================================================================

export interface QdrantVectorStatus {
  isIndexed: boolean;
  vectorDimension: number;
  collectionName: string;
  lastIndexedAt: string;
}

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
  qdrantVectorStatus: QdrantVectorStatus;
}

export type AnalogMatchCategory =
  | 'DIRECT_GENERIC'
  | 'THERAPEUTIC_ANALOG'
  | 'ACTIVE_SUBSTANCE_MATCH';

export interface AnalogPriceDelta {
  amountDifference: number; // e.g. -80.00 (negative means cheaper)
  percentageDifference: number; // e.g. -25.0
  isCheaper: boolean;
  formattedLabel: string; // e.g. 'На 25% дешевле (экономия 80 ₽)'
}

export interface VectorAnalogCard {
  id: string;
  name: string;
  manufacturer: string;
  country: CountryDto;
  activeIngredient: string;
  dosage: string;
  releaseForm: string;
  similarity: {
    cosineScore: number; // e.g. 0.962
    similarityPercentage: number; // e.g. 96.2
    matchCategory: AnalogMatchCategory;
    matchReason: string;
  };
  pricing: {
    minPrice: number;
    currency: string;
    priceDelta: AnalogPriceDelta;
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

// ============================================================================
// 4. Pharmacy Locator & Stock Overview Contracts
// ============================================================================

export type StockStatus =
  | 'IN_STOCK'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'ON_DEMAND';

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

export interface WorkingHoursDto {
  is24Hours: boolean;
  schedule: string;
  isOpenNow: boolean;
}

export interface PharmacyDto {
  id: string;
  network: string;
  storeNumber: number;
  displayName: string;
  address: AddressDto;
  location: GeoLocation;
  phoneNumber: string;
  email?: string;
  workingHours: WorkingHoursDto;
  hasDelivery: boolean;
  features?: string[];
  totalStockItems?: number;
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
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
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
  travelMode: 'driving' | 'walking' | 'transit';
  distanceMeters: number;
  distanceKm: number;
  durationMinutes: number;
  trafficLevel: 'LOW' | 'MODERATE' | 'HEAVY';
  routePolyline: string;
  navigationSteps: string[];
}

// ============================================================================
// 5. Telemetry & Observability Contracts
// ============================================================================

export type ServiceHealthStatus = 'UP' | 'DOWN' | 'DEGRADED';
export type OverallHealthStatus = 'Healthy' | 'Degraded' | 'Unhealthy';

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

export interface HttpMetrics {
  requestsPerSecond: number;
  errorRatePercentage: number;
  latency: {
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
  };
  totalRequests24h: number;
}

export interface KafkaMetrics {
  consumerGroup: string;
  consumerLag: number;
  messagesInPerSecond: number;
  batchProcessingDurationSec: number;
  uncommittedOffsets: number;
  deadLetterQueueCount: number;
}

export interface QdrantMetrics {
  collectionName: string;
  totalVectors: number;
  vectorDimension: number;
  indexedVectorsCount: number;
  searchLatencyP95Ms: number;
  memoryUsageMb: number;
}

export interface DatabaseMetrics {
  activeConnections: number;
  idleConnections: number;
  maxConnections: number;
  databaseSizeBytes: number;
  databaseSizeFormatted: string;
  cacheHitRatioPercentage: number;
  slowQueriesCount: number;
}

export interface RuntimeMetrics {
  cpuUsagePercentage: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  gcPauseTimeMs: number;
  threadPoolWorkers: number;
}

export interface SystemMetricsResponse {
  timestamp: string;
  http: HttpMetrics;
  kafka: KafkaMetrics;
  qdrant: QdrantMetrics;
  database: DatabaseMetrics;
  runtime: RuntimeMetrics;
}

export interface MetricDataPoint {
  timestamp: string;
  value: number;
}

export interface MetricsHistoryResponse {
  metric: string;
  range: '15m' | '1h' | '6h' | '24h';
  step: string;
  points: MetricDataPoint[];
}
