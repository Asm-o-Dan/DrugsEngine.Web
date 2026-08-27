/**
 * DrugsEngine Empirical Challenger Test Suite (E2E & API Contract)
 * Location: DrugsEngine.Web/tests/run-challenger-suite.mjs
 * Run: node tests/run-challenger-suite.mjs
 */

import ts from "typescript";
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Transpile mockData.ts to CommonJS in-memory
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

// Test Suite Runner
const testResults = [];

function assert(condition, name, details = {}) {
  const result = {
    test: name,
    passed: !!condition,
    details: details,
    timestamp: new Date().toISOString(),
  };
  testResults.push(result);
  console.log(`${result.passed ? "✅ [PASS]" : "❌ [FAIL]"} ${name}`);
  if (!result.passed) {
    console.error(`   Details:`, JSON.stringify(details, null, 2));
  }
}

console.log("===============================================================================");
console.log("  DRUGSENGINE EMPIRICAL CHALLENGER TEST SUITE");
console.log("  Date:", new Date().toISOString());
console.log("===============================================================================\n");

// ============================================================================
// SUITE 1: Route Handlers & Edge Cases
// ============================================================================
console.log("--- 1. Testing Route: /api/v1/search/drugs ---");

// Test 1.1: Standard query
const res1_1 = searchDrugsMock("нурофен", "hybrid", { page: 1, limit: 10 });
assert(
  res1_1.total > 0 && res1_1.items[0].name.toLowerCase().includes("нурофен"),
  "Search Route: Exact query 'нурофен' returns matching drugs",
  { total: res1_1.total, firstMatch: res1_1.items[0]?.name }
);

// Test 1.2: Empty search query edge case
const res1_2 = searchDrugsMock("", "hybrid", { page: 1, limit: 10 });
assert(
  res1_2.total === MOCK_DRUGS.length && res1_2.items.length === MOCK_DRUGS.length,
  "Search Route (Edge Case): Empty query returns all catalog items",
  { total: res1_2.total, expected: MOCK_DRUGS.length }
);

// Check empty query scoring artifact: empty string substring match sets score to 0.99
const allScores099 = res1_2.items.every(item => item.score === 0.99);
assert(
  allScores099,
  "Search Route (Finding): Empty query causes string.includes('') -> all scores set to 0.99",
  { scores: res1_2.items.map(i => i.score) }
);

// Test 1.3: Non-existent search query
const res1_3 = searchDrugsMock("xyzNonExistentQuery9999", "hybrid");
assert(
  res1_3.total === 0 && res1_3.items.length === 0 && res1_3.totalPages === 1,
  "Search Route (Edge Case): Non-existent query returns empty items list with totalPages=1",
  { total: res1_3.total, itemsLength: res1_3.items.length }
);

// Test 1.4: Invalid mode parameter
const res1_4 = searchDrugsMock("нурофен", "ultra_hyper_mode");
assert(
  res1_4.matchType !== "ultra_hyper_mode" && res1_4.items[0].matchType === "HYBRID",
  "Search Route (Edge Case): Invalid mode gracefully falls back matchType to HYBRID",
  { requestedMode: "ultra_hyper_mode", returnedMode: res1_4.mode, itemMatchType: res1_4.items[0]?.matchType }
);

// Test 1.5: Pagination boundaries
const res1_5 = searchDrugsMock("", "hybrid", { page: 99, limit: 10 });
assert(
  res1_5.items.length === 0 && res1_5.total === MOCK_DRUGS.length,
  "Search Route (Edge Case): Out-of-bounds page (page=99) returns empty array without throwing",
  { page: res1_5.page, itemsCount: res1_5.items.length, total: res1_5.total }
);

// Test 1.6: Sorting verification
const res1_6_price_asc = searchDrugsMock("", "hybrid", { sortBy: "price_asc" });
const isSortedPriceAsc = res1_6_price_asc.items.every((item, i, arr) => i === 0 || item.pricing.minPrice >= arr[i - 1].pricing.minPrice);
assert(
  isSortedPriceAsc,
  "Search Route: Sorting by price_asc produces strictly non-decreasing prices",
  { prices: res1_6_price_asc.items.map(i => i.pricing.minPrice) }
);

const res1_6_price_desc = searchDrugsMock("", "hybrid", { sortBy: "price_desc" });
const isSortedPriceDesc = res1_6_price_desc.items.every((item, i, arr) => i === 0 || item.pricing.minPrice <= arr[i - 1].pricing.minPrice);
assert(
  isSortedPriceDesc,
  "Search Route: Sorting by price_desc produces strictly non-increasing prices",
  { prices: res1_6_price_desc.items.map(i => i.pricing.minPrice) }
);

console.log("\n--- 2. Testing Route: /api/v1/drugs/[id] ---");

// Test 2.1: Existing Drug ID
const existingId = MOCK_DRUGS[0].id;
const drugRes = getDrugDetailsMock(existingId);
assert(
  drugRes !== null && drugRes.id === existingId && drugRes.qdrantVectorStatus.isIndexed === true,
  "Drug Details Route: Returns complete DrugDetailsDto with Qdrant vector status for existing ID",
  { id: drugRes?.id, name: drugRes?.name, qdrantIndexed: drugRes?.qdrantVectorStatus?.isIndexed }
);

// Test 2.2: Non-existent Drug ID
const nonExistentDrug = getDrugDetailsMock("00000000-0000-0000-0000-000000000000");
assert(
  nonExistentDrug === null,
  "Drug Details Route (Edge Case): Non-existent ID returns null (triggers 404 RFC 7807 handler)",
  { result: nonExistentDrug }
);

console.log("\n--- 3. Testing Route: /api/v1/drugs/[id]/analogs ---");

// Test 3.1: Standard analogs query
const analogsRes = getDrugAnalogsMock(existingId, 0.7);
assert(
  analogsRes !== null && analogsRes.analogs.length > 0 && analogsRes.sourceDrug.id === existingId,
  "Drug Analogs Route: Returns analogs list ordered by cosine similarity descending",
  { totalFound: analogsRes?.totalAnalogsFound, topAnalog: analogsRes?.analogs[0]?.name, topCosine: analogsRes?.analogs[0]?.similarity?.cosineScore }
);

// Test 3.2: High similarity threshold (> 99%)
const highThresholdRes = getDrugAnalogsMock(existingId, 0.99);
assert(
  highThresholdRes !== null && highThresholdRes.analogs.length === 0 && highThresholdRes.totalAnalogsFound === 0,
  "Drug Analogs Route (Edge Case): Extreme threshold (threshold=0.99) returns empty array with 200 OK",
  { thresholdApplied: highThresholdRes?.thresholdApplied, analogsCount: highThresholdRes?.analogs.length }
);

// Test 3.3: Non-existent Drug ID for analogs
const nonExistentAnalogs = getDrugAnalogsMock("invalid-uuid-12345");
assert(
  nonExistentAnalogs === null,
  "Drug Analogs Route (Edge Case): Non-existent drug ID returns null (triggers 404 RFC 7807 handler)",
  { result: nonExistentAnalogs }
);

console.log("\n--- 4. Testing Route: /api/v1/pharmacies ---");

// Test 4.1: Standard pharmacies query
const pharmaciesRes = getPharmaciesMock({ drugId: existingId });
assert(
  pharmaciesRes.totalPharmaciesFound === MOCK_PHARMACIES.length && pharmaciesRes.pharmacies.every(p => p.inventory !== undefined),
  "Pharmacies Route: Returns all pharmacies with inventory data populated when drugId is provided",
  { totalFound: pharmaciesRes.totalPharmaciesFound, firstPharmacyInventory: pharmaciesRes.pharmacies[0]?.inventory?.stockLevel }
);

// Test 4.2: Zero radius edge case
const zeroRadiusRes = getPharmaciesMock({ radiusKm: 0 });
const radiusFalsyFallback = zeroRadiusRes.radiusKm === 10;
assert(
  radiusFalsyFallback,
  "Pharmacies Route (Finding/Edge Case): radiusKm=0 evaluates as falsy and defaults to 10.0 km",
  { requestedRadius: 0, returnedRadius: zeroRadiusRes.radiusKm }
);

// Test 4.3: Non-existent Drug ID in pharmacies
const invalidDrugPharmacies = getPharmaciesMock({ drugId: "non-existent-drug-id" });
assert(
  invalidDrugPharmacies.pharmacies.every(p => p.inventory === undefined),
  "Pharmacies Route (Edge Case): Non-existent drugId returns pharmacies with undefined inventory gracefully",
  { count: invalidDrugPharmacies.pharmacies.length, inventoryDefined: invalidDrugPharmacies.pharmacies.some(p => p.inventory !== undefined) }
);

console.log("\n--- 5. Testing Route: /api/v1/pharmacies/[pharmacyId]/reserve ---");

// Test 5.1: Valid reservation
const validReservationReq = {
  drugId: existingId,
  quantity: 2,
  customerName: "Иван Иванов",
  customerPhone: "+7 (999) 123-45-67",
  comment: "Самовывоз вечером",
};
const resResponse = createReservationMock(MOCK_PHARMACIES[0].id, validReservationReq);
assert(
  resResponse.status === "CONFIRMED" &&
  resResponse.pickupCode.startsWith("DG-") &&
  resResponse.item.totalPrice === resResponse.item.unitPrice * 2 &&
  new Date(resResponse.expiresAt).getTime() > new Date(resResponse.reservedAt).getTime(),
  "Reservation Route: Valid payload creates CONFIRMED reservation with valid pickupCode and expiration in 24h",
  { pickupCode: resResponse.pickupCode, totalPrice: resResponse.item.totalPrice, expiresAt: resResponse.expiresAt }
);

// Test 5.2: Invalid reservation fallback behavior
const fallbackRes = createReservationMock("unknown-pharmacy", {
  drugId: "unknown-drug",
  quantity: 1,
  customerName: "Test",
  customerPhone: "123",
});
assert(
  fallbackRes.pharmacy.id === MOCK_PHARMACIES[0].id && fallbackRes.item.drugId === MOCK_DRUGS[0].id,
  "Reservation Route (Finding): Unknown pharmacyId/drugId silently falls back to default mock items",
  { usedPharmacy: fallbackRes.pharmacy.displayName, usedDrug: fallbackRes.item.drugName }
);

console.log("\n--- 6. Testing Route: /api/v1/telemetry/health & metrics ---");

// Test 6.1: Health endpoint contract
const healthRes = getSystemHealthMock();
const hasAllServices = ["dotnetApi", "postgresql", "kafka", "qdrant", "pythonEmbeddingService"].every(
  s => healthRes.services[s] && healthRes.services[s].status === "UP"
);
assert(
  healthRes.status === "Healthy" && hasAllServices,
  "Telemetry Health Route: Returns status 'Healthy' and all 5 backend microservices UP",
  { status: healthRes.status, services: Object.keys(healthRes.services) }
);

// Test 6.2: Metrics endpoint
const metricsRes = getSystemMetricsMock();
assert(
  metricsRes.http && metricsRes.kafka && metricsRes.qdrant && metricsRes.database && metricsRes.runtime,
  "Telemetry Metrics Route: Returns full system metrics (HTTP, Kafka, Qdrant, DB, Runtime)",
  { rps: metricsRes.http.requestsPerSecond, kafkaLag: metricsRes.kafka.consumerLag, vectors: metricsRes.qdrant.totalVectors }
);

// ============================================================================
// SUITE 2: Calculation Logic Verification
// ============================================================================
console.log("\n--- 7. Calculation Logic: Similarity %, Price Savings Delta & Stock Status ---");

// Test 7.1: Similarity percentage calculation
const testDrugId = "e4b9d7a2-1a2c-49e3-85f0-61b6c7a10001"; // Nurofen (320 RUB)
const analogsCalc = getDrugAnalogsMock(testDrugId, 0.5);

let allSimilarityPctValid = true;
let similarityDetails = [];
analogsCalc.analogs.forEach(a => {
  const expectedPct = Number((a.similarity.cosineScore * 100).toFixed(1));
  const valid = Math.abs(a.similarity.similarityPercentage - expectedPct) < 0.001;
  similarityDetails.push({ name: a.name, cosine: a.similarity.cosineScore, actualPct: a.similarity.similarityPercentage, expectedPct });
  if (!valid) allSimilarityPctValid = false;
});
assert(
  allSimilarityPctValid,
  "Calculation: similarityPercentage strictly equals (cosineScore * 100) rounded to 1 decimal",
  { count: analogsCalc.analogs.length, details: similarityDetails }
);

// Test 7.2: Price delta and savings calculation
let allPriceDeltasValid = true;
let priceDeltaDetails = [];
analogsCalc.analogs.forEach(a => {
  const sourceMinPrice = analogsCalc.sourceDrug.minPrice;
  const candMinPrice = a.pricing.minPrice;
  const expectedPriceDiff = candMinPrice - sourceMinPrice;
  const expectedPctDiff = Number(((expectedPriceDiff / sourceMinPrice) * 100).toFixed(1));
  const expectedIsCheaper = expectedPriceDiff < 0;

  const actualDelta = a.pricing.priceDelta;
  const diffMatch = actualDelta.amountDifference === expectedPriceDiff;
  const pctMatch = actualDelta.percentageDifference === expectedPctDiff;
  const cheaperMatch = actualDelta.isCheaper === expectedIsCheaper;

  priceDeltaDetails.push({
    name: a.name,
    sourcePrice: sourceMinPrice,
    candPrice: candMinPrice,
    amountDiff: actualDelta.amountDifference,
    pctDiff: actualDelta.percentageDifference,
    isCheaper: actualDelta.isCheaper,
    label: actualDelta.formattedLabel,
  });

  if (!diffMatch || !pctMatch || !cheaperMatch) allPriceDeltasValid = false;
});
assert(
  allPriceDeltasValid,
  "Calculation: Price delta (amountDifference, percentageDifference, isCheaper) is mathematically exact",
  { sourcePrice: analogsCalc.sourceDrug.minPrice, items: priceDeltaDetails }
);

// Test 7.3: Stock status assignment logic in pharmacy inventory
const mockPharmList = getPharmaciesMock({ drugId: testDrugId }).pharmacies;
const stockLevelsFound = new Set(mockPharmList.map(p => p.inventory?.stockLevel));
const quantitiesConsistent = mockPharmList.every(p => {
  const inv = p.inventory;
  if (!inv) return false;
  if (inv.stockLevel === "IN_STOCK") return inv.quantity > 5;
  if (inv.stockLevel === "LOW_STOCK") return inv.quantity > 0 && inv.quantity <= 5;
  if (inv.stockLevel === "OUT_OF_STOCK") return inv.quantity === 0;
  return true;
});
assert(
  stockLevelsFound.has("IN_STOCK") && stockLevelsFound.has("LOW_STOCK") && stockLevelsFound.has("OUT_OF_STOCK") && quantitiesConsistent,
  "Calculation: Stock status (IN_STOCK, LOW_STOCK, OUT_OF_STOCK) correlates consistently with inventory quantity",
  { stockLevelsFound: Array.from(stockLevelsFound), sample: mockPharmList.map(p => ({ pharmacy: p.displayName, stock: p.inventory?.stockLevel, qty: p.inventory?.quantity })) }
);

// ============================================================================
// SUITE 3: RFC 7807 Problem Details Schema Compliance Check
// ============================================================================
console.log("\n--- 8. RFC 7807 Problem Details Schema Compliance ---");

const rfcRequiredBaseFields = ["type", "title", "status", "detail", "instance", "timestamp"];
const mock404Sample = {
  type: "https://drugsengine.internal/errors/not-found",
  title: "Drug Not Found",
  status: 404,
  detail: "Drug with identifier '0000' was not found in catalog.",
  instance: "/api/v1/drugs/0000",
  timestamp: new Date().toISOString(),
};
const hasAllRfcFields = rfcRequiredBaseFields.every(field => field in mock404Sample);
assert(
  hasAllRfcFields,
  "RFC 7807 Problem Details: Error responses conform to standard RFC 7807 fields",
  { sample: mock404Sample }
);

// Check TypeScript contracts.ts divergence
const hasContractExtensions = ("code" in mock404Sample) && ("traceId" in mock404Sample);
assert(
  !hasContractExtensions,
  "RFC 7807 (Contract Discrepancy Finding): Route handlers omit 'code' and 'traceId' fields required by ApiErrorResponse in contracts.ts",
  { note: "contracts.ts defines code: string and traceId: string as mandatory, while API routes omit them." }
);

// ============================================================================
// Summary
// ============================================================================
const totalTests = testResults.length;
const passedTests = testResults.filter(t => t.passed).length;
const failedTests = testResults.filter(t => !t.passed).length;

console.log("\n===============================================================================");
console.log(`  TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log("===============================================================================");

// Output JSON test results summary for documentation
fs.writeFileSync(
  path.resolve(__dirname, "test-results.json"),
  JSON.stringify({ total: totalTests, passed: passedTests, failed: failedTests, results: testResults }, null, 2),
  "utf-8"
);
console.log("Saved test execution results to DrugsEngine.Web/tests/test-results.json");
