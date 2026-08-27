import {
  DrugDetailsDto,
  DrugAnalogsResponse,
  VectorAnalogCard,
  SearchDrugsResponse,
  SearchDrugItem,
  SearchSuggestionsResponse,
  SearchSuggestionItem,
  PharmacyDto,
  PharmacyListResponse,
  CreateReservationRequest,
  ReservationResponse,
  DirectionsResponse,
  SystemHealthResponse,
  SystemMetricsResponse,
  MetricsHistoryResponse,
  MetricDataPoint,
} from "@/contracts/contracts";

export const MOCK_DRUGS: DrugDetailsDto[] = [
  {
    id: "e4b9d7a2-1a2c-49e3-85f0-61b6c7a10001",
    name: "Нурофен Экспресс 200мг №24 капсулы",
    latinName: "Nurofen Express",
    manufacturer: "Reckitt Benckiser",
    country: { id: "7a305f56-42d4-4f4a-bc12-fef18f5091a1", name: "Великобритания", code: "GB" },
    category: "Нестероидные противовоспалительные препараты (НПВП)",
    atcCode: "M01AE01",
    activeIngredient: "Ибупрофен (Ibuprofen)",
    dosage: "200 мг",
    packageSize: "24 капсулы",
    releaseForm: "Капсулы желатиновые мягкие",
    isPrescriptionRequired: false,
    storageConditions: "Хранить при температуре не выше 25 °C в сухом месте.",
    shelfLifeMonths: 36,
    indications: [
      "Головная боль и мигрень",
      "Зубная боль",
      "Боли в спине и суставах",
      "Лихорадочные состояния при простуде и гриппе",
    ],
    contraindications: [
      "Гиперчувствительность к ибупрофену",
      "Эрозивно-язвенные поражения ЖКТ в фазе обострения",
      "Тяжелая сердечная недостаточность",
    ],
    sideEffects: ["Диспепсия, тошнота", "Головокружение", "Кожная сыпь"],
    pharmacologicalAction:
      "Ингибирует ферменты ЦОГ-1 и ЦОГ-2, угнетает синтез простагландинов, снижает воспаление и жар.",
    fullDescription:
      "Быстродействующий анальгетик в форме капсул с жидким центром для быстрого снятия умеренной и сильной боли.",
    pricingSummary: { minPrice: 320, maxPrice: 410, averagePrice: 365, currency: "RUB" },
    stockSummary: { inStock: true, pharmaciesWithStock: 48, totalPharmacies: 52, totalUnits: 312 },
    qdrantVectorStatus: {
      isIndexed: true,
      vectorDimension: 768,
      collectionName: "drug_collection",
      lastIndexedAt: "2026-08-27T18:45:00.000Z",
    },
  },
  {
    id: "f5c0e8b3-2b3d-50f4-9601-72c7d8b20002",
    name: "МИГ 400 400мг №20 таблетки",
    latinName: "MIG 400",
    manufacturer: "Berlin-Chemie / Menarini",
    country: { id: "8b416067-53e5-505b-cd23-0f029061a2b2", name: "Германия", code: "DE" },
    category: "Нестероидные противовоспалительные препараты (НПВП)",
    atcCode: "M01AE01",
    activeIngredient: "Ибупрофен (Ibuprofen)",
    dosage: "400 мг",
    packageSize: "20 таблеток",
    releaseForm: "Таблетки, покрытые пленочной оболочкой",
    isPrescriptionRequired: false,
    storageConditions: "Хранить при температуре не выше 30 °C.",
    shelfLifeMonths: 36,
    indications: ["Головная боль", "Мигрень", "Зубная боль", "Невралгия", "Альгодисменорея"],
    contraindications: [
      "Язвенная болезнь желудка",
      "Беременность III триместр",
      "Детский возраст до 12 лет",
    ],
    sideEffects: ["Тошнота", "Абдоминальная боль", "Головная боль"],
    pharmacologicalAction:
      "Оказывает выраженное анальгезирующее действие за счет селективного подавления простагландинов.",
    fullDescription:
      "Усиленная дозировка ибупрофена 400мг для быстрого купирования приступов мигрени и острой боли.",
    pricingSummary: { minPrice: 240, maxPrice: 310, averagePrice: 275, currency: "RUB" },
    stockSummary: { inStock: true, pharmaciesWithStock: 42, totalPharmacies: 52, totalUnits: 198 },
    qdrantVectorStatus: {
      isIndexed: true,
      vectorDimension: 768,
      collectionName: "drug_collection",
      lastIndexedAt: "2026-08-27T18:45:00.000Z",
    },
  },
  {
    id: "d3a8c691-091b-38d2-74ef-50a5b6900003",
    name: "Ибупрофен-АКОС 400мг №20 таблетки",
    latinName: "Ibuprofen-AKOS",
    manufacturer: "Синтез АКОС",
    country: { id: "9c527178-64f6-616c-de34-1013a172b3c3", name: "Россия", code: "RU" },
    category: "Нестероидные противовоспалительные препараты (НПВП)",
    atcCode: "M01AE01",
    activeIngredient: "Ибупрофен (Ibuprofen)",
    dosage: "400 мг",
    packageSize: "20 таблеток",
    releaseForm: "Таблетки",
    isPrescriptionRequired: false,
    storageConditions: "В сухом защищенном от света месте при температуре до 25 °C.",
    shelfLifeMonths: 36,
    indications: [
      "Болевой синдром слабой и средней интенсивности",
      "Лихорадка при простудных заболеваниях",
    ],
    contraindications: ["Эрозии ЖКТ", "Беременность 3 триместр, лактация"],
    sideEffects: ["Диспептические явления", "Аллергические реакции"],
    pharmacologicalAction:
      "Оказывает противовоспалительное, анальгезирующее и жаропонижающее действие.",
    fullDescription:
      "Доступный отечественный аналог ибупрофена с доказанной биоэквивалентностью.",
    pricingSummary: { minPrice: 95, maxPrice: 140, averagePrice: 115, currency: "RUB" },
    stockSummary: { inStock: true, pharmaciesWithStock: 50, totalPharmacies: 52, totalUnits: 540 },
    qdrantVectorStatus: {
      isIndexed: true,
      vectorDimension: 768,
      collectionName: "drug_collection",
      lastIndexedAt: "2026-08-27T18:45:00.000Z",
    },
  },
  {
    id: "c297b580-980a-27c1-63de-4f94a58ff004",
    name: "Дексалгин 25мг №10 гранулы",
    latinName: "Dexalgin",
    manufacturer: "Menarini",
    country: { id: "0d638289-7507-727d-ef45-2124b283c4d4", name: "Италия", code: "IT" },
    category: "Нестероидные противовоспалительные препараты (НПВП)",
    atcCode: "M01AE17",
    activeIngredient: "Декскетопрофен (Dexketoprofen)",
    dosage: "25 мг",
    packageSize: "10 пакетиков-саше",
    releaseForm: "Гранулы для приготовления раствора для приема внутрь",
    isPrescriptionRequired: false,
    storageConditions: "При температуре не выше 25 °C.",
    shelfLifeMonths: 24,
    indications: [
      "Острая боль в суставах и мышцах",
      "Зубная боль",
      "Дисменорея",
      "Посттравматическая боль",
    ],
    contraindications: [
      "Тяжелые нарушения функции печени или почек",
      "Беременность и период лактации",
    ],
    sideEffects: ["Тошнота, рвота", "Головокружение", "Сонливость"],
    pharmacologicalAction:
      "Мощный энантиомер кетопрофена сверхбыстрого всасывания (действие через 15-30 минут).",
    fullDescription:
      "Инновационный нестероидный препарат быстрого растворения для купирования приступов умеренно-сильной боли.",
    pricingSummary: { minPrice: 490, maxPrice: 580, averagePrice: 535, currency: "RUB" },
    stockSummary: { inStock: true, pharmaciesWithStock: 18, totalPharmacies: 52, totalUnits: 45 },
    qdrantVectorStatus: {
      isIndexed: true,
      vectorDimension: 768,
      collectionName: "drug_collection",
      lastIndexedAt: "2026-08-27T18:45:00.000Z",
    },
  },
  {
    id: "a186b470-8799-16b0-52cd-3e83a47ee005",
    name: "Парацетамол Экстра 500мг №20 таблетки",
    latinName: "Paracetamol Extra",
    manufacturer: "Фармстандарт",
    country: { id: "9c527178-64f6-616c-de34-1013a172b3c3", name: "Россия", code: "RU" },
    category: "Анальгетики и антипиретики",
    atcCode: "N02BE01",
    activeIngredient: "Парацетамол (Paracetamol)",
    dosage: "500 мг",
    packageSize: "20 таблеток",
    releaseForm: "Таблетки",
    isPrescriptionRequired: false,
    storageConditions: "В сухом темном месте при комнатной температуре.",
    shelfLifeMonths: 48,
    indications: ["Лихорадка при инфекциях", "Головная боль", "Зубная боль", "Миалгия"],
    contraindications: ["Тяжелые нарушения функции печени", "Хронический алкоголизм"],
    sideEffects: ["Редко: аллергические реакции, тромбоцитопения"],
    pharmacologicalAction:
      "Блокирует синтез простагландинов в ЦНС, снижает возбудимость центра терморегуляции.",
    fullDescription:
      "Классический жаропонижающий и обезболивающий препарат первой линии безопасности.",
    pricingSummary: { minPrice: 65, maxPrice: 110, averagePrice: 85, currency: "RUB" },
    stockSummary: { inStock: true, pharmaciesWithStock: 52, totalPharmacies: 52, totalUnits: 890 },
    qdrantVectorStatus: {
      isIndexed: true,
      vectorDimension: 768,
      collectionName: "drug_collection",
      lastIndexedAt: "2026-08-27T18:45:00.000Z",
    },
  },
  {
    id: "b287c581-98aa-27c1-63de-4f94a58ff006",
    name: "Амоксиклав 875мг+125мг №14 таблетки",
    latinName: "Amoksiklav",
    manufacturer: "Sandoz",
    country: { id: "3d405f56-42d4-4f4a-bc12-fef18f5091a9", name: "Словения", code: "SI" },
    category: "Антибактериальные препараты",
    atcCode: "J01CR02",
    activeIngredient: "Амоксициллин + Клавулановая кислота",
    dosage: "875 мг + 125 мг",
    packageSize: "14 таблеток",
    releaseForm: "Таблетки диспергируемые",
    isPrescriptionRequired: true,
    storageConditions: "При температуре от 15 до 25 °C.",
    shelfLifeMonths: 24,
    indications: [
      "Инфекции верхних дыхательных путей",
      "Синусит, отит",
      "Инфекции мочевыводящих путей",
    ],
    contraindications: [
      "Повышенная чувствительность к пенициллинам",
      "Холестатическая желтуха",
    ],
    sideEffects: ["Тошнота, диарея", "Кандидоз кожи и слизистых"],
    pharmacologicalAction:
      "Комбинированный антибиотик широкого спектра с ингибитором бета-лактамаз.",
    fullDescription:
      "Высокоэффективный антибактериальный препарат для терапии устойчивых бактериальных инфекций.",
    pricingSummary: { minPrice: 460, maxPrice: 560, averagePrice: 510, currency: "RUB" },
    stockSummary: { inStock: true, pharmaciesWithStock: 38, totalPharmacies: 52, totalUnits: 154 },
    qdrantVectorStatus: {
      isIndexed: true,
      vectorDimension: 768,
      collectionName: "drug_collection",
      lastIndexedAt: "2026-08-27T18:45:00.000Z",
    },
  },
  {
    id: "c398d692-09bb-38d2-74ef-50a5b6900007",
    name: "Омез 20мг №30 капсулы",
    latinName: "Omez",
    manufacturer: "Dr. Reddy's",
    country: { id: "4e516067-53e5-505b-cd23-0f029061a2c0", name: "Индия", code: "IN" },
    category: "Ингибиторы протонной помпы",
    atcCode: "A02BC01",
    activeIngredient: "Омепразол (Omeprazole)",
    dosage: "20 мг",
    packageSize: "30 капсул",
    releaseForm: "Капсулы кишечнорастворимые",
    isPrescriptionRequired: false,
    storageConditions: "В сухом месте при температуре до 25 °C.",
    shelfLifeMonths: 36,
    indications: [
      "Язвенная болезнь желудка и 12-перстной кишки",
      "ГЭРБ, изжога",
      "Защита ЖКТ на фоне приема НПВП",
    ],
    contraindications: [
      "Одновременный прием с эрлотинибом",
      "Период грудного вскармливания",
    ],
    sideEffects: ["Метеоризм, запор или диарея", "Головная боль"],
    pharmacologicalAction:
      "Специфически ингибирует протонную помпу (H+/K+-АТФазу) париетальных клеток желудка.",
    fullDescription:
      "Золотой стандарт гастропротекции и снижения кислотности желудочного сока.",
    pricingSummary: { minPrice: 180, maxPrice: 245, averagePrice: 212, currency: "RUB" },
    stockSummary: { inStock: true, pharmaciesWithStock: 46, totalPharmacies: 52, totalUnits: 420 },
    qdrantVectorStatus: {
      isIndexed: true,
      vectorDimension: 768,
      collectionName: "drug_collection",
      lastIndexedAt: "2026-08-27T18:45:00.000Z",
    },
  },
  {
    id: "d409e7a3-1acc-49e3-85f0-61b6c7a10008",
    name: "Аторвастатин 20мг №30 таблетки",
    latinName: "Atorvastatin",
    manufacturer: "KRKA",
    country: { id: "3d405f56-42d4-4f4a-bc12-fef18f5091a9", name: "Словения", code: "SI" },
    category: "Гиполипидемические средства",
    atcCode: "C10AA05",
    activeIngredient: "Аторвастатин (Atorvastatin)",
    dosage: "20 мг",
    packageSize: "30 таблеток",
    releaseForm: "Таблетки, покрытые оболочкой",
    isPrescriptionRequired: true,
    storageConditions: "При температуре не выше 25 °C.",
    shelfLifeMonths: 24,
    indications: [
      "Гиперхолестеринемия",
      "Профилактика сердечно-сосудистых осложнений при ИБС",
    ],
    contraindications: ["Активные заболевания печени", "Беременность и лактация"],
    sideEffects: ["Миалгия", "Бессонница", "Повышение трансаминаз печени"],
    pharmacologicalAction:
      "Селективный конкурентный ингибитор ГМГ-КоА-редуктазы, снижает уровень холестерина ЛПНП.",
    fullDescription:
      "Эффективный статин европейского производства для контроля липидного спектра.",
    pricingSummary: { minPrice: 340, maxPrice: 420, averagePrice: 380, currency: "RUB" },
    stockSummary: { inStock: true, pharmaciesWithStock: 40, totalPharmacies: 52, totalUnits: 260 },
    qdrantVectorStatus: {
      isIndexed: true,
      vectorDimension: 768,
      collectionName: "drug_collection",
      lastIndexedAt: "2026-08-27T18:45:00.000Z",
    },
  },
  {
    id: "e510f8b4-2bdd-50f4-9601-72c7d8b20009",
    name: "Метформин 1000мг №60 таблетки",
    latinName: "Metformin",
    manufacturer: "Teva",
    country: { id: "5f627178-64f6-616c-de34-1013a172b3d1", name: "Израиль", code: "IL" },
    category: "Гипогликемические средства",
    atcCode: "A10BA02",
    activeIngredient: "Метформин (Metformin)",
    dosage: "1000 мг",
    packageSize: "60 таблеток",
    releaseForm: "Таблетки пролонгированного действия",
    isPrescriptionRequired: true,
    storageConditions: "В сухом месте при температуре 15-25 °C.",
    shelfLifeMonths: 36,
    indications: [
      "Сахарный диабет 2 типа",
      "Метаболический синдром и инсулинорезистентность",
    ],
    contraindications: [
      "Диабетический кетоацидоз",
      "Тяжелая почечная недостаточность (СКФ < 30 мл/мин)",
    ],
    sideEffects: ["Металлический привкус во рту", "Дискомфорт в животе в начале терапии"],
    pharmacologicalAction:
      "Снижает глюконеогенез, повышает чувствительность периферических рецепторов к инсулину.",
    fullDescription:
      "Базовый препарат первой линии защиты для контроля гликемии при сахарном диабете 2 типа.",
    pricingSummary: { minPrice: 220, maxPrice: 290, averagePrice: 255, currency: "RUB" },
    stockSummary: { inStock: true, pharmaciesWithStock: 44, totalPharmacies: 52, totalUnits: 380 },
    qdrantVectorStatus: {
      isIndexed: true,
      vectorDimension: 768,
      collectionName: "drug_collection",
      lastIndexedAt: "2026-08-27T18:45:00.000Z",
    },
  },
];

export const MOCK_PHARMACIES: PharmacyDto[] = [
  {
    id: "11111111-2222-3333-4444-555555555551",
    network: "Ригла",
    storeNumber: 142,
    displayName: "Аптека «Ригла» №142",
    address: {
      city: "Москва",
      street: "ул. Тверская",
      house: "12 стр. 1",
      postalCode: 125009,
      formatted: "г. Москва, ул. Тверская, д. 12, стр. 1",
    },
    location: { lat: 55.7624, lng: 37.6078, distanceKm: 0.95 },
    phoneNumber: "+7 (495) 730-27-30",
    email: "store142@rigla.ru",
    workingHours: { is24Hours: true, schedule: "Круглосуточно (24/7)", isOpenNow: true },
    hasDelivery: true,
    features: ["Круглосуточно", "Экспресс-бронь за 15 минут", "Оплата картой / СБП", "Пандус"],
    totalStockItems: 1420,
  },
  {
    id: "11111111-2222-3333-4444-555555555552",
    network: "Апрель",
    storeNumber: 88,
    displayName: "Аптека «Апрель» №88",
    address: {
      city: "Москва",
      street: "ул. Арбат",
      house: "25",
      postalCode: 119002,
      formatted: "г. Москва, ул. Арбат, д. 25",
    },
    location: { lat: 55.7499, lng: 37.5912, distanceKm: 1.78 },
    phoneNumber: "+7 (800) 200-90-01",
    email: "store88@apteka-aprel.ru",
    workingHours: { is24Hours: false, schedule: "08:00 – 22:00", isOpenNow: true },
    hasDelivery: false,
    features: ["Система клубных скидок", "Ортопедический отдел", "Онлайн-заказ"],
    totalStockItems: 980,
  },
  {
    id: "11111111-2222-3333-4444-555555555553",
    network: "Планета Здоровья",
    storeNumber: 5,
    displayName: "Аптека «Планета Здоровья» №5",
    address: {
      city: "Москва",
      street: "ул. Новый Арбат",
      house: "15",
      postalCode: 119019,
      formatted: "г. Москва, ул. Новый Арбат, д. 15",
    },
    location: { lat: 55.7525, lng: 37.593, distanceKm: 1.62 },
    phoneNumber: "+7 (495) 120-10-10",
    email: "store5@planetazdorovo.ru",
    workingHours: { is24Hours: true, schedule: "Круглосуточно", isOpenNow: true },
    hasDelivery: true,
    features: ["Круглосуточно", "Оптика", "Детское питание", "Консультация провизора"],
    totalStockItems: 2150,
  },
  {
    id: "11111111-2222-3333-4444-555555555554",
    network: "36.6",
    storeNumber: 204,
    displayName: "Аптека «36.6» №204",
    address: {
      city: "Москва",
      street: "Ленинградский пр-т",
      house: "36",
      postalCode: 125167,
      formatted: "г. Москва, Ленинградский пр-т, д. 36",
    },
    location: { lat: 55.7912, lng: 37.5582, distanceKm: 4.85 },
    phoneNumber: "+7 (495) 797-63-36",
    email: "store204@366.ru",
    workingHours: { is24Hours: false, schedule: "08:00 – 23:00", isOpenNow: true },
    hasDelivery: true,
    features: ["Премиальная космецевтика", "Срочная курьерская доставка", "Измерение давления"],
    totalStockItems: 1840,
  },
  {
    id: "11111111-2222-3333-4444-555555555555",
    network: "Столички",
    storeNumber: 17,
    displayName: "Аптека «Столички» №17",
    address: {
      city: "Москва",
      street: "ул. Маросейка",
      house: "9/2",
      postalCode: 101000,
      formatted: "г. Москва, ул. Маросейка, д. 9/2",
    },
    location: { lat: 55.757, lng: 37.6335, distanceKm: 1.15 },
    phoneNumber: "+7 (495) 215-52-15",
    email: "store17@stolichki.ru",
    workingHours: { is24Hours: false, schedule: "08:00 – 22:00", isOpenNow: true },
    hasDelivery: false,
    features: ["Социальные цены", "Широкий ассортимент медикаментов", "Электронная очередь"],
    totalStockItems: 1620,
  },
  {
    id: "11111111-2222-3333-4444-555555555556",
    network: "Доктор Столетов",
    storeNumber: 41,
    displayName: "Аптека «Доктор Столетов» №41",
    address: {
      city: "Москва",
      street: "пр-т Мира",
      house: "40",
      postalCode: 129110,
      formatted: "г. Москва, пр-т Мира, д. 40",
    },
    location: { lat: 55.7803, lng: 37.6321, distanceKm: 3.12 },
    phoneNumber: "+7 (495) 788-88-88",
    email: "store41@stoletov.ru",
    workingHours: { is24Hours: true, schedule: "Круглосуточно", isOpenNow: true },
    hasDelivery: true,
    features: ["Круглосуточно", "Фитоаптека", "Медицинские приборы", "Ортопедическая обувь"],
    totalStockItems: 1950,
  },
];

export function searchDrugsMock(
  query: string,
  mode: "exact" | "semantic" | "hybrid" = "hybrid",
  options: {
    category?: string;
    manufacturer?: string;
    inStockOnly?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
  } = {}
): SearchDrugsResponse {
  const validModes: ("exact" | "semantic" | "hybrid")[] = ["exact", "semantic", "hybrid"];
  const sanitizedMode: "exact" | "semantic" | "hybrid" = validModes.includes(mode as any) ? mode : "hybrid";
  const q = (query || "").trim().toLowerCase();
  const page = options.page || 1;
  const limit = options.limit || 10;

  let filtered = MOCK_DRUGS.filter((d) => {
    if (!q) return true;
    const matchName = d.name.toLowerCase().includes(q);
    const matchLatin = (d.latinName || "").toLowerCase().includes(q);
    const matchIngr = d.activeIngredient.toLowerCase().includes(q);
    const matchCat = d.category.toLowerCase().includes(q);
    const matchDesc = d.fullDescription.toLowerCase().includes(q);
    const matchInd = d.indications.some((i) => i.toLowerCase().includes(q));
    const matchForm = d.releaseForm.toLowerCase().includes(q);
    return matchName || matchLatin || matchIngr || matchCat || matchDesc || matchInd || matchForm;
  });

  if (options.category) {
    filtered = filtered.filter((d) => d.category.toLowerCase().includes(options.category!.toLowerCase()));
  }
  if (options.manufacturer) {
    filtered = filtered.filter(
      (d) => d.manufacturer.toLowerCase().includes(options.manufacturer!.toLowerCase())
    );
  }
  if (options.inStockOnly) {
    filtered = filtered.filter((d) => d.stockSummary.inStock);
  }

  const items: SearchDrugItem[] = filtered.map((d, index) => {
    let score = 0.96 - index * 0.03;
    if (d.name.toLowerCase().includes(q) || (d.latinName && d.latinName.toLowerCase().includes(q))) {
      score = 0.99;
    }
    return {
      id: d.id,
      name: d.name,
      manufacturer: d.manufacturer,
      country: d.country,
      category: d.category,
      activeIngredient: d.activeIngredient,
      dosage: d.dosage,
      releaseForm: d.releaseForm,
      description: d.fullDescription,
      score: Math.max(0.65, Number(score.toFixed(3))),
      matchType: sanitizedMode === "exact" ? "EXACT" : sanitizedMode === "semantic" ? "SEMANTIC" : "HYBRID",
      highlightedName: d.name,
      pricing: d.pricingSummary,
      stockSummary: {
        inStock: d.stockSummary.inStock,
        totalPharmacies: d.stockSummary.pharmaciesWithStock,
        totalQuantity: d.stockSummary.totalUnits,
      },
    };
  });

  if (options.sortBy === "price_asc") {
    items.sort((a, b) => a.pricing.minPrice - b.pricing.minPrice);
  } else if (options.sortBy === "price_desc") {
    items.sort((a, b) => b.pricing.minPrice - a.pricing.minPrice);
  } else if (options.sortBy === "name_asc") {
    items.sort((a, b) => a.name.localeCompare(b.name, "ru"));
  } else if (options.sortBy === "similarity_desc" || options.sortBy === "relevance") {
    items.sort((a, b) => b.score - a.score);
  }

  const total = items.length;
  const start = (page - 1) * limit;
  const pagedItems = items.slice(start, start + limit);

  return {
    query,
    mode: sanitizedMode,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    executionTimeMs: Math.round(18 + Math.random() * 24),
    filtersApplied: {
      category: options.category || null,
      manufacturer: options.manufacturer || null,
      inStockOnly: options.inStockOnly || false,
    },
    items: pagedItems,
    facets: {
      manufacturers: [
        { name: "Reckitt Benckiser", count: 1 },
        { name: "Berlin-Chemie / Menarini", count: 1 },
        { name: "Синтез АКОС", count: 1 },
        { name: "Menarini", count: 1 },
        { name: "Фармстандарт", count: 1 },
        { name: "Sandoz", count: 1 },
        { name: "Dr. Reddy's", count: 1 },
        { name: "KRKA", count: 1 },
        { name: "Teva", count: 1 },
      ],
      countries: [
        { code: "RU", name: "Россия", count: 2 },
        { code: "GB", name: "Великобритания", count: 1 },
        { code: "DE", name: "Германия", count: 1 },
        { code: "IT", name: "Италия", count: 1 },
        { code: "SI", name: "Словения", count: 2 },
        { code: "IN", name: "Индия", count: 1 },
        { code: "IL", name: "Израиль", count: 1 },
      ],
      categories: [
        { name: "Нестероидные противовоспалительные препараты (НПВП)", count: 4 },
        { name: "Анальгетики и антипиретики", count: 1 },
        { name: "Антибактериальные препараты", count: 1 },
        { name: "Ингибиторы протонной помпы", count: 1 },
        { name: "Гиполипидемические средства", count: 1 },
        { name: "Гипогликемические средства", count: 1 },
      ],
    },
  };
}

export function getSuggestionsMock(query: string, limit: number = 6): SearchSuggestionsResponse {
  const q = (query || "").trim().toLowerCase();
  if (!q || q.length < 2) {
    return { query, suggestions: [] };
  }

  const suggestions: SearchSuggestionItem[] = [];
  MOCK_DRUGS.forEach((d) => {
    if (d.name.toLowerCase().includes(q) || (d.latinName && d.latinName.toLowerCase().includes(q))) {
      suggestions.push({
        id: d.id,
        text: d.name,
        type: "DRUG",
        category: d.category,
        minPrice: d.pricingSummary.minPrice,
        currency: d.pricingSummary.currency,
      });
    } else if (d.activeIngredient.toLowerCase().includes(q)) {
      suggestions.push({
        id: d.id,
        text: d.activeIngredient,
        type: "ACTIVE_INGREDIENT",
        category: "Действующее вещество",
        minPrice: d.pricingSummary.minPrice,
        currency: d.pricingSummary.currency,
      });
    }
  });

  if (
    q.includes("бол") ||
    q.includes("голов") ||
    q.includes("жар") ||
    q.includes("зуб") ||
    q.includes("желуд") ||
    q.includes("мигрен") ||
    q.includes("простуд")
  ) {
    suggestions.push({
      id: null,
      text: `Семантический поиск: «${query}»`,
      type: "SYMPTOM_QUERY",
      category: "Векторный поиск Qdrant",
      minPrice: null,
      currency: null,
    });
  }

  return {
    query,
    suggestions: suggestions.slice(0, limit),
  };
}

export function getDrugDetailsMock(id: string): DrugDetailsDto | null {
  return MOCK_DRUGS.find((d) => d.id === id) || null;
}

export function getDrugAnalogsMock(
  id: string,
  threshold: number = 0.7,
  inStockOnly: boolean = false
): DrugAnalogsResponse | null {
  const source = MOCK_DRUGS.find((d) => d.id === id);
  if (!source) return null;

  const analogs: VectorAnalogCard[] = [];

  MOCK_DRUGS.filter((d) => d.id !== id).forEach((cand) => {
    let cosine = 0.68;
    let matchCat: "DIRECT_GENERIC" | "THERAPEUTIC_ANALOG" | "ACTIVE_SUBSTANCE_MATCH" =
      "THERAPEUTIC_ANALOG";
    let reason = "Схожий фармакотерапевтический профиль";

    const sourceIngr = source.activeIngredient.toLowerCase();
    const candIngr = cand.activeIngredient.toLowerCase();

    if (
      sourceIngr.includes("ибупрофен") && candIngr.includes("ибупрофен")
    ) {
      cosine = cand.id.includes("f5c0") ? 0.985 : 0.962;
      matchCat = "DIRECT_GENERIC";
      reason = `Идентичное действующее вещество (${cand.activeIngredient}) и механизм действия`;
    } else if (
      (sourceIngr.includes("ибупрофен") || sourceIngr.includes("декскетопрофен")) &&
      (candIngr.includes("ибупрофен") || candIngr.includes("декскетопрофен"))
    ) {
      cosine = 0.915;
      matchCat = "ACTIVE_SUBSTANCE_MATCH";
      reason = `Препарат той же группы НПВП с быстрым началом действия (${cand.activeIngredient})`;
    } else if (cand.category === source.category) {
      cosine = 0.842;
      matchCat = "THERAPEUTIC_ANALOG";
      reason = `Общая фармакологическая группа (${cand.category})`;
    } else if (cand.indications.some((ind) => source.indications.some((sind) => sind.includes(ind.slice(0, 5))))) {
      cosine = 0.765;
      matchCat = "THERAPEUTIC_ANALOG";
      reason = "Схожие терапевтические показания и клинический эффект";
    }

    if (cosine >= threshold) {
      const priceDiff = cand.pricingSummary.minPrice - source.pricingSummary.minPrice;
      const pctDiff = Number(((priceDiff / source.pricingSummary.minPrice) * 100).toFixed(1));
      const isCheaper = priceDiff < 0;
      const formattedLabel = isCheaper
        ? `На ${Math.abs(pctDiff)}% дешевле (экономия ${Math.abs(priceDiff)} ₽)`
        : `На ${pctDiff}% дороже (+${priceDiff} ₽)`;

      if (!inStockOnly || cand.stockSummary.inStock) {
        analogs.push({
          id: cand.id,
          name: cand.name,
          manufacturer: cand.manufacturer,
          country: cand.country,
          activeIngredient: cand.activeIngredient,
          dosage: cand.dosage,
          releaseForm: cand.releaseForm,
          similarity: {
            cosineScore: cosine,
            similarityPercentage: Number((cosine * 100).toFixed(1)),
            matchCategory: matchCat,
            matchReason: reason,
          },
          pricing: {
            minPrice: cand.pricingSummary.minPrice,
            currency: cand.pricingSummary.currency,
            priceDelta: {
              amountDifference: priceDiff,
              percentageDifference: pctDiff,
              isCheaper,
              formattedLabel,
            },
          },
          stockSummary: {
            inStock: cand.stockSummary.inStock,
            pharmacyCount: cand.stockSummary.pharmaciesWithStock,
            totalUnits: cand.stockSummary.totalUnits,
          },
        });
      }
    }
  });

  analogs.sort((a, b) => b.similarity.cosineScore - a.similarity.cosineScore);

  return {
    sourceDrug: {
      id: source.id,
      name: source.name,
      activeIngredient: source.activeIngredient,
      minPrice: source.pricingSummary.minPrice,
      currency: source.pricingSummary.currency,
    },
    thresholdApplied: threshold,
    totalAnalogsFound: analogs.length,
    analogs,
  };
}

export function getPharmaciesMock(params: {
  drugId?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  network?: string;
  inStockOnly?: boolean;
  isOpenNow?: boolean;
}): PharmacyListResponse {
  const centerLat = params.lat ?? 55.7558;
  const centerLng = params.lng ?? 37.6173;
  const radius = params.radiusKm ?? 10.0;

  const targetDrug = params.drugId ? MOCK_DRUGS.find((d) => d.id === params.drugId) : null;

  let list = MOCK_PHARMACIES.map((p, idx) => {
    const copy = { ...p };
    if (targetDrug) {
      const stockLevel = idx === 1 ? "LOW_STOCK" : idx === 3 ? "OUT_OF_STOCK" : "IN_STOCK";
      const quantity =
        stockLevel === "IN_STOCK" ? 12 + idx * 4 : stockLevel === "LOW_STOCK" ? 2 : 0;
      copy.inventory = {
        drugId: targetDrug.id,
        drugName: targetDrug.name,
        stockLevel: stockLevel as any,
        quantity,
        price: targetDrug.pricingSummary.minPrice + (idx % 3) * 15,
        currency: "RUB",
        lastUpdated: new Date().toISOString(),
      };
    }
    return copy;
  });

  if (params.network) {
    list = list.filter((p) => p.network.toLowerCase().includes(params.network!.toLowerCase()));
  }
  if (params.isOpenNow) {
    list = list.filter((p) => p.workingHours.isOpenNow);
  }
  if (params.inStockOnly && targetDrug) {
    list = list.filter((p) => p.inventory && p.inventory.quantity > 0);
  }

  return {
    center: { lat: centerLat, lng: centerLng },
    radiusKm: radius,
    drugId: params.drugId,
    totalPharmaciesFound: list.length,
    pharmacies: list,
  };
}

export function getPharmacyDetailsMock(pharmacyId: string): PharmacyDto | null {
  return MOCK_PHARMACIES.find((p) => p.id === pharmacyId) || null;
}

export function createReservationMock(
  pharmacyId: string,
  req: CreateReservationRequest
): ReservationResponse {
  const pharmacy = MOCK_PHARMACIES.find((p) => p.id === pharmacyId) || MOCK_PHARMACIES[0];
  const drug = MOCK_DRUGS.find((d) => d.id === req.drugId) || MOCK_DRUGS[0];
  const unitPrice = drug.pricingSummary.minPrice;
  const totalPrice = unitPrice * (req.quantity || 1);
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 3600 * 1000);

  const codeNum = Math.floor(1000 + Math.random() * 9000);

  return {
    reservationId: `res_${Math.random().toString(36).substring(2, 11)}`,
    pickupCode: `DG-${codeNum}`,
    status: "CONFIRMED",
    pharmacy: {
      id: pharmacy.id,
      displayName: pharmacy.displayName,
      address: pharmacy.address.formatted,
    },
    item: {
      drugId: drug.id,
      drugName: drug.name,
      quantity: req.quantity || 1,
      unitPrice,
      totalPrice,
      currency: "RUB",
    },
    reservedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    instructions: `Заказ под кодом DG-${codeNum} зарезервирован на кассе. Оплата при получении. Срок бронирования 24 часа.`,
  };
}

export function getDirectionsMock(
  pharmacyId: string,
  fromLat: number,
  fromLng: number,
  mode: string = "driving"
): DirectionsResponse {
  const isWalking = mode === "walking";
  const isTransit = mode === "transit";

  return {
    pharmacyId,
    travelMode: mode as any,
    distanceMeters: isWalking ? 1200 : isTransit ? 2100 : 1450,
    distanceKm: isWalking ? 1.2 : isTransit ? 2.1 : 1.45,
    durationMinutes: isWalking ? 16 : isTransit ? 11 : 6,
    trafficLevel: "MODERATE",
    routePolyline: "gfo}Efk|bG?e@`@i@t@e@x@o@m@q@y@",
    navigationSteps: isWalking
      ? [
          "Выйдите из метро и двигайтесь на север 350 м",
          "Поверните направо на пешеходную улицу (400 м)",
          "Пройдите 450 м до входа в аптеку справа",
        ]
      : isTransit
      ? [
          "Дойдите до остановки общественного транспорта (3 мин)",
          "Сядьте на автобус м1 или м9 и проедьте 2 остановки",
          "Пройдите 150 метров пешком до аптеки",
        ]
      : [
          "Двигайтесь прямо по проспекту 500 м",
          "Поверните направо на перекрестке (750 м)",
          "Аптека будет расположена справа через 200 м (парковка доступна)",
        ],
  };
}

export function getSystemHealthMock(): SystemHealthResponse {
  return {
    status: "Healthy",
    environment: "production",
    timestamp: new Date().toISOString(),
    uptimeSeconds: 864200,
    version: "1.4.2",
    services: {
      dotnetApi: {
        status: "UP",
        latencyMs: 3.2,
        details: ".NET 8.0 Kestrel MediatR CQRS pipeline active",
      },
      postgresql: {
        status: "UP",
        latencyMs: 5.1,
        details: "PostgreSQL 16.2 connected, active connections: 14/100",
      },
      kafka: {
        status: "UP",
        latencyMs: 8.4,
        details: "Topic drug-ingestion-events healthy, lag: 0",
      },
      qdrant: {
        status: "UP",
        latencyMs: 4.6,
        details: "Qdrant v1.8.2 connected, collection drug_collection indexed (128,450 vectors)",
      },
      pythonEmbeddingService: {
        status: "UP",
        latencyMs: 12.8,
        details: "LaBSE 768-dim model loaded on CUDA worker",
      },
    },
  };
}

export function getSystemMetricsMock(): SystemMetricsResponse {
  return {
    timestamp: new Date().toISOString(),
    http: {
      requestsPerSecond: 142.5,
      errorRatePercentage: 0.02,
      latency: { p50Ms: 14.2, p95Ms: 45.8, p99Ms: 112.4 },
      totalRequests24h: 12450890,
    },
    kafka: {
      consumerGroup: "drug-vectorization-group",
      consumerLag: 0,
      messagesInPerSecond: 28.4,
      batchProcessingDurationSec: 0.72,
      uncommittedOffsets: 0,
      deadLetterQueueCount: 0,
    },
    qdrant: {
      collectionName: "drug_collection",
      totalVectors: 128450,
      vectorDimension: 768,
      indexedVectorsCount: 128450,
      searchLatencyP95Ms: 18.5,
      memoryUsageMb: 384.6,
    },
    database: {
      activeConnections: 14,
      idleConnections: 26,
      maxConnections: 100,
      databaseSizeBytes: 142850000,
      databaseSizeFormatted: "136.2 MB",
      cacheHitRatioPercentage: 99.4,
      slowQueriesCount: 0,
    },
    runtime: {
      cpuUsagePercentage: 8.5,
      memoryUsedMb: 512.4,
      memoryTotalMb: 2048.0,
      gcPauseTimeMs: 1.2,
      threadPoolWorkers: 24,
    },
  };
}

export function getMetricsHistoryMock(
  metric: string,
  range: string = "1h"
): MetricsHistoryResponse {
  const count = range === "15m" ? 15 : range === "6h" ? 36 : range === "24h" ? 48 : 30;
  const now = Date.now();
  const stepMs = (60 * 1000 * 60) / count;
  const points: MetricDataPoint[] = [];

  let baseVal =
    metric === "latency"
      ? 18
      : metric === "requests_throughput"
      ? 142
      : metric === "kafka_lag"
      ? 0
      : 128450;

  for (let i = count; i >= 0; i--) {
    const t = new Date(now - i * stepMs).toISOString();
    const jitter = (Math.random() - 0.5) * (baseVal * 0.18);
    points.push({
      timestamp: t,
      value: Math.max(0, Number((baseVal + jitter).toFixed(1))),
    });
  }

  return {
    metric,
    range: range as any,
    step: "1m",
    points,
  };
}
