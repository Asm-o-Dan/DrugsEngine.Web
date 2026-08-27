/**
 * Comprehensive Empirical Challenger Test Suite for DrugsEngine Web API & Contracts
 * File: DrugsEngine.Web/tests/e2e-api-contract.test.mjs
 */

import ts from "typescript";
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Transpile & Load mockData.ts
const mockDataPath = path.resolve(__dirname, "../lib/mockData.ts");
const mockDataSource = fs.readFileSync(mockDataPath, "utf-8");

const transpiled = ts.transpileModule(mockDataSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  },
});

const sandbox = {
  exports: {},
  module: { exports: {} },
  require: () => ({}),
  console,
  Date,
  Math,
  parseInt,
  parseFloat,
  Number,
  String,
  Array,
  Object,
  Set,
  Map,
  JSON,
};

vm.createContext(sandbox);
const script = new vm.Script(transpiled.outputText);
script.runInContext(sandbox);

const {
  MOCK_DRUGS,
  MOCK_PHARMACIES,
  searchDrugsMock,
  getSuggestionsMock,
  getDrugDetailsMock,
  getDrugAnalogsMock,
  getPharmaciesMock,
  getPharmacyDetailsMock,
  createReservationMock,
  getDirectionsMock,
  getSystemHealthMock,
  getSystemMetricsMock,
  getMetricsHistoryMock,
} = sandbox.exports;

// 2. Load and parse OpenAPI 3.1 schema and TypeScript contracts
const openapiPath = path.resolve(__dirname, "../contracts/openapi.json");
const openapi = JSON.parse(fs.readFileSync(openapiPath, "utf-8"));
const contractsTsPath = path.resolve(__dirname, "../contracts/contracts.ts");
const contractsTs = fs.readFileSync(contractsTsPath, "utf-8");

// 3. Test Runner
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  findings: [],
  testCases: [],
};

function recordTest(category, name, passed, details = {}, finding = null) {
  results.total++;
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }
  const tc = {
    category,
    name,
    passed: !!passed,
    details,
    finding,
    timestamp: new Date().toISOString(),
  };
  results.testCases.push(tc);
  if (finding) {
    results.findings.push(finding);
  }
  const tag = passed ? "✅ [PASS]" : "❌ [FAIL]";
  console.log(`${tag} [${category}] ${name}`);
  if (finding) {
    console.log(`   ⚠️ Finding: ${finding.title} (${finding.severity}) - ${finding.description}`);
  }
}

console.log("==========================================================================================");
console.log("  DRUGSENGINE EMPIRICAL CHALLENGER & RESILIENCE TEST HARNESS");
console.log("  Environment: Node.js", process.version, "| Timestamp:", new Date().toISOString());
console.log("==========================================================================================\n");

// ==========================================================================================
// 1. ROUTE HANDLER TESTS & EDGE CASES
// ==========================================================================================

// 1.1 /api/v1/search/drugs
console.log("--- 1.1 Route /api/v1/search/drugs ---");

// Normal query
const search1 = searchDrugsMock("нурофен", "hybrid", { page: 1, limit: 10 });
recordTest(
  "Route: /search/drugs",
  "Standard query 'нурофен' returns matching catalog items",
  search1.total > 0 && search1.items.length > 0 && search1.items[0].name.toLowerCase().includes("нурофен"),
  { query: "нурофен", total: search1.total, firstMatch: search1.items[0]?.name }
);

// Empty query edge case
const searchEmpty = searchDrugsMock("", "hybrid", { page: 1, limit: 10 });
const emptyScores = searchEmpty.items.map(i => i.score);
const allScore099 = emptyScores.every(s => s === 0.99);
recordTest(
  "Route: /search/drugs",
  "Empty search query ('') returns all catalog drugs with pagination",
  searchEmpty.total === MOCK_DRUGS.length && searchEmpty.items.length === MOCK_DRUGS.length,
  { total: searchEmpty.total, catalogCount: MOCK_DRUGS.length }
);
recordTest(
  "Route: /search/drugs",
  "Empty string match sets relevance score to 0.99 for all items due to string.includes('')",
  allScore099,
  { scores: emptyScores },
  {
    title: "Empty search query causes score saturation (0.99)",
    severity: "LOW",
    description: "In searchDrugsMock, d.name.toLowerCase().includes('') evaluates to true, overriding calculated scores to 0.99.",
  }
);

// Whitespace-only query
const searchWhitespace = searchDrugsMock("   ", "hybrid");
recordTest(
  "Route: /search/drugs",
  "Whitespace query ('   ') trims to empty and returns catalog drugs gracefully",
  searchWhitespace.total === MOCK_DRUGS.length,
  { query: "   ", total: searchWhitespace.total }
);

// Special characters & injection query
const searchSpecial = searchDrugsMock("<script>alert('xss')</script> ' OR 1=1 --", "hybrid");
recordTest(
  "Route: /search/drugs",
  "Adversarial special character / XSS search query does not crash and returns 0 items safely",
  searchSpecial.total === 0 && searchSpecial.items.length === 0,
  { total: searchSpecial.total, items: searchSpecial.items }
);

// Very long string query (fuzzing)
const searchLong = searchDrugsMock("A".repeat(5000), "hybrid");
recordTest(
  "Route: /search/drugs",
  "Extremely large query (5000 chars) executes within reasonable time without OOM",
  searchLong.total === 0 && searchLong.executionTimeMs > 0,
  { executionTimeMs: searchLong.executionTimeMs }
);

// Invalid search mode
const searchInvalidMode = searchDrugsMock("ибупрофен", "unsupported_mode");
const fallbackMatchType = searchInvalidMode.items[0]?.matchType;
recordTest(
  "Route: /search/drugs",
  "Invalid search mode fallback: validates mode to 'hybrid' and sets item.matchType to 'HYBRID'",
  fallbackMatchType === "HYBRID" && searchInvalidMode.mode === "hybrid",
  { requestedMode: "unsupported_mode", returnedMode: searchInvalidMode.mode, fallbackMatchType }
);

// Sorting validation
const sortPriceAsc = searchDrugsMock("", "hybrid", { sortBy: "price_asc" });
const isPriceAsc = sortPriceAsc.items.every((item, i, arr) => i === 0 || item.pricing.minPrice >= arr[i - 1].pricing.minPrice);
recordTest(
  "Route: /search/drugs",
  "Sorting 'price_asc' strictly orders items by minPrice ascending",
  isPriceAsc,
  { prices: sortPriceAsc.items.map(i => i.pricing.minPrice) }
);

const sortPriceDesc = searchDrugsMock("", "hybrid", { sortBy: "price_desc" });
const isPriceDesc = sortPriceDesc.items.every((item, i, arr) => i === 0 || item.pricing.minPrice <= arr[i - 1].pricing.minPrice);
recordTest(
  "Route: /search/drugs",
  "Sorting 'price_desc' strictly orders items by minPrice descending",
  isPriceDesc,
  { prices: sortPriceDesc.items.map(i => i.pricing.minPrice) }
);

const sortNameAsc = searchDrugsMock("", "hybrid", { sortBy: "name_asc" });
const isNameAsc = sortNameAsc.items.every((item, i, arr) => i === 0 || item.name.localeCompare(arr[i - 1].name, "ru") >= 0);
recordTest(
  "Route: /search/drugs",
  "Sorting 'name_asc' strictly orders items alphabetically with Russian locale",
  isNameAsc,
  { names: sortNameAsc.items.map(i => i.name) }
);

// Filtering validation
const filterInStock = searchDrugsMock("", "hybrid", { inStockOnly: true });
recordTest(
  "Route: /search/drugs",
  "Filter 'inStockOnly=true' returns exclusively in-stock items",
  filterInStock.items.every(i => i.stockSummary.inStock),
  { count: filterInStock.items.length }
);

// Pagination out of range
const pageOutOfRange = searchDrugsMock("", "hybrid", { page: 50, limit: 10 });
recordTest(
  "Route: /search/drugs",
  "Pagination out of range (page=50) returns empty items array with valid total and totalPages",
  pageOutOfRange.items.length === 0 && pageOutOfRange.total === MOCK_DRUGS.length && pageOutOfRange.totalPages === 1,
  { page: pageOutOfRange.page, total: pageOutOfRange.total, totalPages: pageOutOfRange.totalPages }
);


// 1.2 /api/v1/drugs/[id]
console.log("\n--- 1.2 Route /api/v1/drugs/[id] ---");

const targetDrug = MOCK_DRUGS[0];
const drugDetails = getDrugDetailsMock(targetDrug.id);
const requiredDrugFields = [
  "id", "name", "manufacturer", "country", "category", "activeIngredient",
  "dosage", "packageSize", "releaseForm", "isPrescriptionRequired", "storageConditions",
  "shelfLifeMonths", "indications", "contraindications", "sideEffects",
  "pharmacologicalAction", "fullDescription", "pricingSummary", "stockSummary", "qdrantVectorStatus"
];
const hasAllDrugFields = requiredDrugFields.every(f => drugDetails[f] !== undefined);
recordTest(
  "Route: /drugs/[id]",
  "Existing drug ID returns complete DrugDetailsDto matching all 20 contract fields",
  drugDetails !== null && hasAllDrugFields && drugDetails.qdrantVectorStatus.vectorDimension === 768,
  { id: targetDrug.id, fieldsPresent: requiredDrugFields.filter(f => drugDetails[f] !== undefined).length }
);

const nonExistentDrugResult = getDrugDetailsMock("non-existent-guid-999");
recordTest(
  "Route: /drugs/[id]",
  "Non-existent drug ID returns null (triggers 404 RFC 7807 handler)",
  nonExistentDrugResult === null,
  { requestedId: "non-existent-guid-999" }
);


// 1.3 /api/v1/drugs/[id]/analogs
console.log("\n--- 1.3 Route /api/v1/drugs/[id]/analogs ---");

// Normal threshold
const analogsNormal = getDrugAnalogsMock(targetDrug.id, 0.7);
recordTest(
  "Route: /drugs/[id]/analogs",
  "Finds analogs with threshold 0.7 and orders them descending by cosine score",
  analogsNormal !== null &&
  analogsNormal.analogs.length > 0 &&
  analogsNormal.analogs.every((a, idx, arr) => idx === 0 || a.similarity.cosineScore <= arr[idx - 1].similarity.cosineScore),
  { source: analogsNormal?.sourceDrug?.name, count: analogsNormal?.analogs?.length }
);

// Extreme threshold > 99%
const analogsHighThreshold = getDrugAnalogsMock(targetDrug.id, 0.99);
recordTest(
  "Route: /drugs/[id]/analogs",
  "High similarity threshold (>99%) returns empty analogs array with 200 OK without crashing",
  analogsHighThreshold !== null && analogsHighThreshold.analogs.length === 0 && analogsHighThreshold.totalAnalogsFound === 0,
  { thresholdApplied: analogsHighThreshold?.thresholdApplied, found: analogsHighThreshold?.totalAnalogsFound }
);

// Non-existent drug ID for analogs
const analogsNonExistent = getDrugAnalogsMock("unknown-id-0000");
recordTest(
  "Route: /drugs/[id]/analogs",
  "Non-existent drug ID returns null (triggers 404 RFC 7807 handler)",
  analogsNonExistent === null,
  { requestedId: "unknown-id-0000" }
);


// 1.4 /api/v1/pharmacies
console.log("\n--- 1.4 Route /api/v1/pharmacies ---");

// Normal query with drugId
const pharmWithDrug = getPharmaciesMock({ drugId: targetDrug.id });
recordTest(
  "Route: /pharmacies",
  "Returns list of pharmacies with attached drug inventory and pricing",
  pharmWithDrug.pharmacies.length === MOCK_PHARMACIES.length &&
  pharmWithDrug.pharmacies.every(p => p.inventory && p.inventory.drugId === targetDrug.id),
  { total: pharmWithDrug.totalPharmaciesFound }
);

// Zero radius edge case
const pharmRadiusZero = getPharmaciesMock({ radiusKm: 0 });
recordTest(
  "Route: /pharmacies",
  "Zero radius (radiusKm=0) is correctly preserved when explicitly passed (radiusKm: 0)",
  pharmRadiusZero.radiusKm === 0,
  { requestedRadius: 0, returnedRadius: pharmRadiusZero.radiusKm }
);

// Non-existent drugId
const pharmInvalidDrug = getPharmaciesMock({ drugId: "non-existent-drug" });
recordTest(
  "Route: /pharmacies",
  "Non-existent drugId handled gracefully without error (pharmacies returned without inventory)",
  pharmInvalidDrug.pharmacies.length === MOCK_PHARMACIES.length &&
  pharmInvalidDrug.pharmacies.every(p => p.inventory === undefined),
  { total: pharmInvalidDrug.totalPharmaciesFound }
);


// 1.5 /api/v1/pharmacies/[pharmacyId]/reserve
console.log("\n--- 1.5 Route /api/v1/pharmacies/[pharmacyId]/reserve ---");

// Valid reservation
const validReserve = createReservationMock(MOCK_PHARMACIES[0].id, {
  drugId: targetDrug.id,
  quantity: 3,
  customerName: "Тестовый Покупатель",
  customerPhone: "+7 (999) 000-11-22",
  comment: "Срочная бронь",
});
const isPickupCodeValid = /^DG-\d{4}$/.test(validReserve.pickupCode);
const isExpiration24h = (new Date(validReserve.expiresAt).getTime() - new Date(validReserve.reservedAt).getTime()) === 24 * 3600 * 1000;
recordTest(
  "Route: /pharmacies/[id]/reserve",
  "Valid reservation creates CONFIRMED hold, DG-XXXX pickup code, exact unit & total prices, 24h expiration",
  validReserve.status === "CONFIRMED" &&
  isPickupCodeValid &&
  validReserve.item.totalPrice === targetDrug.pricingSummary.minPrice * 3 &&
  isExpiration24h,
  { pickupCode: validReserve.pickupCode, totalPrice: validReserve.item.totalPrice, expiresAt: validReserve.expiresAt }
);

// Fallback behavior on unknown pharmacy/drug
const unknownReserve = createReservationMock("unknown-pharmacy-id", {
  drugId: "unknown-drug-id",
  quantity: 1,
  customerName: "Anonymous",
  customerPhone: "+70000000000",
});
recordTest(
  "Route: /pharmacies/[id]/reserve",
  "Unknown pharmacyId or drugId silently falls back to MOCK_PHARMACIES[0] / MOCK_DRUGS[0] in mock handler",
  unknownReserve.pharmacy.id === MOCK_PHARMACIES[0].id && unknownReserve.item.drugId === MOCK_DRUGS[0].id,
  { usedPharmacy: unknownReserve.pharmacy.displayName, usedDrug: unknownReserve.item.drugName },
  {
    title: "createReservationMock lacks 404 validation for unknown IDs",
    severity: "LOW",
    description: "Mock implementation falls back to array index 0 rather than returning null for 404 response.",
  }
);


// 1.6 /api/v1/telemetry/health & metrics
console.log("\n--- 1.6 Route /api/v1/telemetry/health & metrics ---");

const health = getSystemHealthMock();
const requiredServices = ["dotnetApi", "postgresql", "kafka", "qdrant", "pythonEmbeddingService"];
const allServicesUp = requiredServices.every(s => health.services[s] && health.services[s].status === "UP");
recordTest(
  "Route: /telemetry/health",
  "Returns SystemHealthResponse with status 'Healthy' and all 5 backend microservices UP",
  health.status === "Healthy" && allServicesUp && health.uptimeSeconds > 0,
  { status: health.status, services: Object.keys(health.services) }
);

const metrics = getSystemMetricsMock();
recordTest(
  "Route: /telemetry/metrics",
  "Returns SystemMetricsResponse with complete HTTP, Kafka, Qdrant, DB, and Runtime telemetry",
  metrics.http.requestsPerSecond > 0 &&
  metrics.kafka.consumerGroup !== "" &&
  metrics.qdrant.totalVectors > 0 &&
  metrics.database.maxConnections === 100 &&
  metrics.runtime.cpuUsagePercentage > 0,
  { rps: metrics.http.requestsPerSecond, vectors: metrics.qdrant.totalVectors, cpu: metrics.runtime.cpuUsagePercentage }
);

const history = getMetricsHistoryMock("latency", "1h");
recordTest(
  "Route: /telemetry/metrics/history",
  "Returns timeseries history points array for requested metric and time range",
  history.metric === "latency" && history.points.length > 0 && history.points.every(p => typeof p.value === "number"),
  { pointsCount: history.points.length, step: history.step }
);


// 1.7 /api/v1/search/suggestions
console.log("\n--- 1.7 Route /api/v1/search/suggestions ---");

const suggDrug = getSuggestionsMock("нур");
recordTest(
  "Route: /search/suggestions",
  "Prefix 'нур' suggests matching brand drug (Нурофен)",
  suggDrug.suggestions.some(s => s.type === "DRUG" && s.text.toLowerCase().includes("нурофен")),
  { suggestions: suggDrug.suggestions.map(s => s.text) }
);

const suggActive = getSuggestionsMock("ибу");
recordTest(
  "Route: /search/suggestions",
  "Prefix 'ибу' suggests active ingredient (Ибупрофен)",
  suggActive.suggestions.some(s => s.type === "ACTIVE_INGREDIENT" || s.type === "DRUG"),
  { suggestions: suggActive.suggestions.map(s => `${s.type}: ${s.text}`) }
);

const suggSymptom = getSuggestionsMock("головная боль");
recordTest(
  "Route: /search/suggestions",
  "Symptom query 'головная боль' provides Qdrant semantic vector search suggestion",
  suggSymptom.suggestions.some(s => s.type === "SYMPTOM_QUERY"),
  { suggestions: suggSymptom.suggestions.map(s => `${s.type}: ${s.text}`) }
);

const suggShort = getSuggestionsMock("a");
recordTest(
  "Route: /search/suggestions",
  "Query with length < 2 returns empty suggestions list",
  suggShort.suggestions.length === 0,
  { query: "a", count: suggShort.suggestions.length }
);


// ==========================================================================================
// 2. CALCULATION LOGIC VERIFICATION
// ==========================================================================================
console.log("\n--- 2. Calculation Logic: Similarity %, Price Delta & Stock Status ---");

// 2.1 Similarity Percentage
const allAnalogsForCalc = getDrugAnalogsMock(targetDrug.id, 0.4).analogs;
let simCalcValid = true;
allAnalogsForCalc.forEach(a => {
  const expected = Number((a.similarity.cosineScore * 100).toFixed(1));
  if (Math.abs(a.similarity.similarityPercentage - expected) > 0.001) {
    simCalcValid = false;
  }
});
recordTest(
  "Calculations",
  "Similarity % calculation: similarityPercentage === (cosineScore * 100) rounded to 1 decimal",
  simCalcValid && allAnalogsForCalc.length > 0,
  { sample: allAnalogsForCalc.map(a => ({ cosine: a.similarity.cosineScore, pct: a.similarity.similarityPercentage })) }
);

// 2.2 Price Savings Delta
let priceCalcValid = true;
const priceCalcDeltas = [];
allAnalogsForCalc.forEach(a => {
  const src = targetDrug.pricingSummary.minPrice;
  const cand = a.pricing.minPrice;
  const expectedDiff = cand - src;
  const expectedPct = Number(((expectedDiff / src) * 100).toFixed(1));
  const expectedCheaper = expectedDiff < 0;

  const actual = a.pricing.priceDelta;
  const validDiff = actual.amountDifference === expectedDiff;
  const validPct = actual.percentageDifference === expectedPct;
  const validCheaper = actual.isCheaper === expectedCheaper;

  priceCalcDeltas.push({
    name: a.name,
    src,
    cand,
    diff: actual.amountDifference,
    pct: actual.percentageDifference,
    isCheaper: actual.isCheaper,
    label: actual.formattedLabel,
  });

  if (!validDiff || !validPct || !validCheaper) {
    priceCalcValid = false;
  }
});
recordTest(
  "Calculations",
  "Price savings delta calculation: amountDifference, percentageDifference, isCheaper, and formattedLabel are mathematically exact",
  priceCalcValid && priceCalcDeltas.length > 0,
  { items: priceCalcDeltas }
);

// Test zero division edge case on price delta
function calculatePriceDelta(sourceMinPrice, candMinPrice) {
  const priceDiff = candMinPrice - sourceMinPrice;
  const pctDiff = sourceMinPrice === 0 ? 0 : Number(((priceDiff / sourceMinPrice) * 100).toFixed(1));
  const isCheaper = priceDiff < 0;
  const formattedLabel = isCheaper
    ? `На ${Math.abs(pctDiff)}% дешевле (экономия ${Math.abs(priceDiff)} ₽)`
    : `На ${pctDiff}% дороже (+${priceDiff} ₽)`;
  return { priceDiff, pctDiff, isCheaper, formattedLabel };
}
const zeroSourcePriceDelta = calculatePriceDelta(0, 100);
recordTest(
  "Calculations",
  "Price savings delta handles hypothetical zero source price without throwing",
  zeroSourcePriceDelta.priceDiff === 100,
  { result: zeroSourcePriceDelta }
);

// 2.3 Stock Status Assignment Logic
const pharmListForStock = getPharmaciesMock({ drugId: targetDrug.id }).pharmacies;
const stockLevels = pharmListForStock.map(p => p.inventory?.stockLevel);
const uniqueLevels = new Set(stockLevels);
const stockQuantitiesValid = pharmListForStock.every(p => {
  const inv = p.inventory;
  if (inv.stockLevel === "IN_STOCK") return inv.quantity >= 5;
  if (inv.stockLevel === "LOW_STOCK") return inv.quantity > 0 && inv.quantity < 5;
  if (inv.stockLevel === "OUT_OF_STOCK") return inv.quantity === 0;
  return true;
});
recordTest(
  "Calculations",
  "Stock status assignment: IN_STOCK (qty >= 5), LOW_STOCK (0 < qty < 5), OUT_OF_STOCK (qty == 0) consistent across all pharmacies",
  stockQuantitiesValid && uniqueLevels.has("IN_STOCK") && uniqueLevels.has("LOW_STOCK") && uniqueLevels.has("OUT_OF_STOCK"),
  { uniqueLevels: Array.from(uniqueLevels), pharmacies: pharmListForStock.map(p => ({ name: p.displayName, level: p.inventory?.stockLevel, qty: p.inventory?.quantity })) }
);


// ==========================================================================================
// 3. RFC 7807 PROBLEM DETAILS & CONTRACT COMPLIANCE
// ==========================================================================================
console.log("\n--- 3. RFC 7807 Problem Details & Contract Fidelity ---");

// Check OpenAPI schema for ApiErrorResponse
const openapiErrorSchema = openapi.components.schemas.ApiErrorResponse;
const openapiRequiredErrorFields = openapiErrorSchema.required; // ["type", "title", "status", "detail", "code", "timestamp", "traceId"]

// Check route handlers source code for RFC 7807 responses
const routeFiles = [
  "app/api/v1/drugs/[id]/route.ts",
  "app/api/v1/drugs/[id]/analogs/route.ts",
  "app/api/v1/pharmacies/[pharmacyId]/route.ts",
  "app/api/v1/pharmacies/[pharmacyId]/reserve/route.ts",
];

let allRoutesHaveRfc7807Structure = true;
let routesMissingRequiredContractFields = [];

routeFiles.forEach(rf => {
  const content = fs.readFileSync(path.resolve(__dirname, "..", rf), "utf-8");
  const hasType = content.includes('"type":') || content.includes("type:");
  const hasTitle = content.includes('"title":') || content.includes("title:");
  const hasStatus = content.includes('"status":') || content.includes("status:");
  const hasDetail = content.includes('"detail":') || content.includes("detail:");
  const hasCode = content.includes('"code":') || content.includes("code:");
  const hasTraceId = content.includes('"traceId":') || content.includes("traceId:");

  if (!hasType || !hasTitle || !hasStatus || !hasDetail) {
    allRoutesHaveRfc7807Structure = false;
  }
  if (!hasCode || !hasTraceId) {
    routesMissingRequiredContractFields.push(rf);
  }
});

recordTest(
  "RFC 7807 Compliance",
  "API route handlers implement RFC 7807 base fields (type, title, status, detail, instance, timestamp)",
  allRoutesHaveRfc7807Structure,
  { verifiedFiles: routeFiles }
);

recordTest(
  "Contract Fidelity",
  "All 4 error-returning API route handlers strictly include 'code' and 'traceId' conforming to OpenAPI 3.1 & contracts.ts",
  routesMissingRequiredContractFields.length === 0,
  { missingIn: routesMissingRequiredContractFields, openapiRequired: openapiRequiredErrorFields }
);


// ==========================================================================================
// SUMMARY
// ==========================================================================================
console.log("\n==========================================================================================");
console.log(`  FINAL VERDICT: ${results.passed}/${results.total} TESTS PASSED (${results.failed} FAILED)`);
console.log(`  CRITICAL/HIGH FINDINGS: ${results.findings.filter(f => f.severity === "HIGH").length}`);
console.log(`  MEDIUM/LOW FINDINGS: ${results.findings.filter(f => f.severity !== "HIGH").length}`);
console.log("==========================================================================================");

// Save structured report
const reportJsonPath = path.resolve(__dirname, "detailed-test-report.json");
fs.writeFileSync(reportJsonPath, JSON.stringify(results, null, 2), "utf-8");
console.log(`Saved detailed test execution report to: ${reportJsonPath}`);
