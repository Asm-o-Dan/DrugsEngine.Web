"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { PharmacyDto } from "@/contracts/contracts";
import { PharmacyMap } from "@/components/pharmacies/PharmacyMap";
import { PharmacyCard } from "@/components/pharmacies/PharmacyCard";
import { StockFilter, PharmacyFilterState } from "@/components/pharmacies/StockFilter";
import { ReservationModal } from "@/components/pharmacies/ReservationModal";
import { DirectionsModal } from "@/components/pharmacies/DirectionsModal";
import {
  MapPin,
  ListFilter,
  Map as MapIcon,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Pill,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MOCK_DRUGS } from "@/lib/mockData";

function PharmaciesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialDrugId = searchParams.get("drugId") || "e4b9d7a2-1a2c-49e3-85f0-61b6c7a10001";
  const initialNetwork = searchParams.get("network") || undefined;
  const initialRadius = parseInt(searchParams.get("radius") || "10", 10);

  const [filters, setFilters] = React.useState<PharmacyFilterState>({
    drugId: initialDrugId,
    network: initialNetwork,
    radiusKm: initialRadius,
    inStockOnly: false,
    isOpenNow: false,
    searchQuery: "",
  });

  const [mobileTab, setMobileTab] = React.useState<"map" | "list">("map");
  const [pharmacies, setPharmacies] = React.useState<PharmacyDto[]>([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = React.useState<string | undefined>();
  const [status, setStatus] = React.useState<"loading" | "error" | "empty" | "success">("loading");
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();

  // Modals state
  const [reservePharmacy, setReservePharmacy] = React.useState<PharmacyDto | null>(null);
  const [directionsPharmacy, setDirectionsPharmacy] = React.useState<PharmacyDto | null>(null);

  // Sync URL params
  const syncUrlParams = React.useCallback(
    (newFilters: PharmacyFilterState) => {
      const params = new URLSearchParams();
      if (newFilters.drugId) params.set("drugId", newFilters.drugId);
      if (newFilters.network) params.set("network", newFilters.network);
      if (newFilters.radiusKm && newFilters.radiusKm !== 10) params.set("radius", String(newFilters.radiusKm));

      const searchStr = params.toString();
      const newUrl = searchStr ? `${pathname}?${searchStr}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router]
  );

  // Fetch pharmacies
  const fetchPharmacies = React.useCallback(async (f: PharmacyFilterState) => {
    setStatus("loading");
    setErrorMessage(undefined);

    try {
      const res = await apiClient.getPharmacies({
        drugId: f.drugId,
        radiusKm: f.radiusKm,
        network: f.network,
        inStockOnly: f.inStockOnly,
        isOpenNow: f.isOpenNow,
      });

      let list = res.pharmacies || [];

      // Filter by search query if present
      if (f.searchQuery.trim()) {
        const q = f.searchQuery.toLowerCase();
        list = list.filter(
          (p) =>
            p.displayName.toLowerCase().includes(q) ||
            p.address.formatted.toLowerCase().includes(q)
        );
      }

      setPharmacies(list);
      if (list.length > 0 && !selectedPharmacyId) {
        setSelectedPharmacyId(list[0].id);
      }

      if (list.length === 0) {
        setStatus("empty");
      } else {
        setStatus("success");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Ошибка подключения к сервису аптечных сетей");
    }
  }, [selectedPharmacyId]);

  React.useEffect(() => {
    fetchPharmacies(filters);
    syncUrlParams(filters);
  }, [filters, fetchPharmacies, syncUrlParams]);

  const handleResetFilters = () => {
    setFilters({
      drugId: undefined,
      network: undefined,
      radiusKm: 10,
      inStockOnly: false,
      isOpenNow: false,
      searchQuery: "",
    });
  };

  const selectedDrug = filters.drugId
    ? MOCK_DRUGS.find((d) => d.id === filters.drugId)
    : null;

  return (
    <div className="space-y-6 py-4 sm:py-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <MapPin className="h-3.5 w-3.5 text-emerald-500" />
            <span>Геолокация: Москва, Центральный АО (GPS Active)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Аптеки & Онлайн-бронирование
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {selectedDrug ? (
              <span>
                Проверка наличия и цен для: <strong className="text-slate-800 dark:text-slate-200">{selectedDrug.name}</strong>
              </span>
            ) : (
              "Интерактивная карта наличия медикаментов в 52 аптеках Москвы"
            )}
          </p>
        </div>

        {/* Mobile View Switcher Tabs */}
        <div className="flex lg:hidden rounded-xl bg-slate-100 p-1 dark:bg-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMobileTab("map")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              mobileTab === "map"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            )}
          >
            <MapIcon className="h-3.5 w-3.5 text-emerald-500" />
            <span>Карта</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("list")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              mobileTab === "list"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            )}
          >
            <ListFilter className="h-3.5 w-3.5 text-sky-500" />
            <span>Список ({pharmacies.length})</span>
          </button>
        </div>
      </div>

      {/* Main Split View: Left (Sticky Map) / Right (Filters + Pharmacy List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Interactive Map */}
        <div
          className={cn(
            "lg:col-span-6 lg:sticky lg:top-20 z-10",
            mobileTab === "map" ? "block" : "hidden lg:block"
          )}
        >
          <PharmacyMap
            pharmacies={pharmacies}
            selectedPharmacyId={selectedPharmacyId}
            onSelectPharmacy={(id) => setSelectedPharmacyId(id)}
            onReservePharmacy={(pharmacy) => setReservePharmacy(pharmacy)}
            onGetDirections={(pharmacy) => setDirectionsPharmacy(pharmacy)}
            className="h-[480px] lg:h-[620px]"
          />
        </div>

        {/* Right Side: Filters and Cards List */}
        <div
          className={cn(
            "lg:col-span-6 space-y-4",
            mobileTab === "list" ? "block" : "hidden lg:block"
          )}
        >
          {/* Stock Filter Control */}
          <StockFilter
            filters={filters}
            onFilterChange={(f) => setFilters(f)}
            onResetFilters={handleResetFilters}
          />

          {/* 1. Loading State */}
          {status === "loading" && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 animate-pulse space-y-3"
                >
                  <div className="flex justify-between">
                    <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="h-4 w-60 rounded bg-slate-100 dark:bg-slate-800/60" />
                  <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                </div>
              ))}
            </div>
          )}

          {/* 2. Error State */}
          {status === "error" && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 dark:border-rose-900/50 dark:bg-rose-950/20 text-center space-y-3">
              <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Ошибка загрузки списка аптек
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {errorMessage || "Сервис аптечной синхронизации временно недоступен."}
              </p>
              <Button
                size="sm"
                onClick={() => fetchPharmacies(filters)}
                className="bg-rose-600 text-white gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Повторить попытку
              </Button>
            </div>
          )}

          {/* 3. Empty State */}
          {status === "empty" && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 dark:border-slate-800 dark:bg-slate-900/30 text-center space-y-3">
              <MapPin className="h-8 w-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Аптеки не найдены в радиусе {filters.radiusKm} км
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Попробуйте расширить радиус поиска до 25 км или снять фильтр «Только в наличии».
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFilters({ ...filters, radiusKm: 25, inStockOnly: false })}
                  className="text-xs"
                >
                  Расширить радиус до 25 км
                </Button>
                <Button
                  size="sm"
                  onClick={handleResetFilters}
                  className="bg-emerald-600 text-white text-xs"
                >
                  Сбросить фильтры
                </Button>
              </div>
            </div>
          )}

          {/* 4. Success State: Pharmacy Cards */}
          {status === "success" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <span>
                  Найдено <strong>{pharmacies.length}</strong> {pharmacies.length === 1 ? "аптека" : "аптек"} в радиусе {filters.radiusKm} км
                </span>
                <span className="font-mono">Сортировка: по удаленности</span>
              </div>

              {pharmacies.map((pharmacy) => (
                <PharmacyCard
                  key={pharmacy.id}
                  pharmacy={pharmacy}
                  isSelected={pharmacy.id === selectedPharmacyId}
                  onSelect={() => {
                    setSelectedPharmacyId(pharmacy.id);
                    if (window.innerWidth < 1024) {
                      setMobileTab("map");
                    }
                  }}
                  onReserve={() => setReservePharmacy(pharmacy)}
                  onGetDirections={() => setDirectionsPharmacy(pharmacy)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={!!reservePharmacy}
        onClose={() => setReservePharmacy(null)}
        pharmacy={reservePharmacy}
        selectedDrugId={selectedDrug?.id}
        selectedDrugName={selectedDrug?.name}
        drugPrice={selectedDrug?.pricingSummary.minPrice}
      />

      {/* Directions Modal */}
      <DirectionsModal
        isOpen={!!directionsPharmacy}
        onClose={() => setDirectionsPharmacy(null)}
        pharmacy={directionsPharmacy}
      />
    </div>
  );
}

export default function PharmaciesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 py-8">
          <div className="h-8 w-64 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 h-[500px] rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="lg:col-span-6 h-[500px] rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
      }
    >
      <PharmaciesPageContent />
    </Suspense>
  );
}
