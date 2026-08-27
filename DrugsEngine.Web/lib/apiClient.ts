import {
  SearchDrugsResponse,
  SearchSuggestionsResponse,
  DrugDetailsDto,
  DrugAnalogsResponse,
  PharmacyListResponse,
  PharmacyDto,
  CreateReservationRequest,
  ReservationResponse,
  DirectionsResponse,
  SystemHealthResponse,
  SystemMetricsResponse,
  MetricsHistoryResponse,
  ProblemDetails,
} from "@/contracts/contracts";
import {
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
} from "./mockData";

export class ApiError extends Error {
  public problemDetails?: ProblemDetails;
  public statusCode: number;

  constructor(message: string, statusCode: number, problemDetails?: ProblemDetails) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.problemDetails = problemDetails;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";
  }

  private async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(options?.headers || {}),
        },
      });

      if (!res.ok) {
        let problem: ProblemDetails | undefined;
        try {
          problem = await res.json();
        } catch {
          // non-json
        }
        throw new ApiError(
          problem?.detail || `API Request failed with status ${res.status}: ${res.statusText}`,
          res.status,
          problem
        );
      }

      return (await res.json()) as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(err.message || "Network error connecting to DrugsEngine API", 500);
    }
  }

  async searchDrugs(
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
  ): Promise<SearchDrugsResponse> {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (mode) params.set("mode", mode);
    if (options.category) params.set("category", options.category);
    if (options.manufacturer) params.set("manufacturer", options.manufacturer);
    if (options.inStockOnly !== undefined) params.set("inStockOnly", String(options.inStockOnly));
    if (options.page) params.set("page", String(options.page));
    if (options.limit) params.set("limit", String(options.limit));
    if (options.sortBy) params.set("sortBy", options.sortBy);

    try {
      return await this.fetchJson<SearchDrugsResponse>(
        `${this.baseUrl}/search/drugs?${params.toString()}`
      );
    } catch {
      return searchDrugsMock(query, mode, options);
    }
  }

  async getSuggestions(query: string, limit: number = 6): Promise<SearchSuggestionsResponse> {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    try {
      return await this.fetchJson<SearchSuggestionsResponse>(
        `${this.baseUrl}/search/suggestions?${params.toString()}`
      );
    } catch {
      return getSuggestionsMock(query, limit);
    }
  }

  async getDrugDetails(id: string): Promise<DrugDetailsDto> {
    try {
      return await this.fetchJson<DrugDetailsDto>(`${this.baseUrl}/drugs/${encodeURIComponent(id)}`);
    } catch {
      const mock = getDrugDetailsMock(id);
      if (!mock) {
        throw new ApiError(`Drug with id '${id}' not found`, 404);
      }
      return mock;
    }
  }

  async getDrugAnalogs(
    id: string,
    threshold: number = 0.7,
    inStockOnly: boolean = false
  ): Promise<DrugAnalogsResponse> {
    const params = new URLSearchParams({
      threshold: String(threshold),
      inStockOnly: String(inStockOnly),
    });
    try {
      return await this.fetchJson<DrugAnalogsResponse>(
        `${this.baseUrl}/drugs/${encodeURIComponent(id)}/analogs?${params.toString()}`
      );
    } catch {
      const mock = getDrugAnalogsMock(id, threshold, inStockOnly);
      if (!mock) {
        throw new ApiError(`Drug with id '${id}' not found`, 404);
      }
      return mock;
    }
  }

  async getPharmacies(
    params: {
      drugId?: string;
      lat?: number;
      lng?: number;
      radiusKm?: number;
      network?: string;
      inStockOnly?: boolean;
      isOpenNow?: boolean;
    } = {}
  ): Promise<PharmacyListResponse> {
    const query = new URLSearchParams();
    if (params.drugId) query.set("drugId", params.drugId);
    if (params.lat !== undefined) query.set("lat", String(params.lat));
    if (params.lng !== undefined) query.set("lng", String(params.lng));
    if (params.radiusKm !== undefined) query.set("radiusKm", String(params.radiusKm));
    if (params.network) query.set("network", params.network);
    if (params.inStockOnly !== undefined) query.set("inStockOnly", String(params.inStockOnly));
    if (params.isOpenNow !== undefined) query.set("isOpenNow", String(params.isOpenNow));

    try {
      return await this.fetchJson<PharmacyListResponse>(
        `${this.baseUrl}/pharmacies?${query.toString()}`
      );
    } catch {
      return getPharmaciesMock(params);
    }
  }

  async getPharmacyDetails(pharmacyId: string): Promise<PharmacyDto> {
    try {
      return await this.fetchJson<PharmacyDto>(
        `${this.baseUrl}/pharmacies/${encodeURIComponent(pharmacyId)}`
      );
    } catch {
      const mock = getPharmacyDetailsMock(pharmacyId);
      if (!mock) {
        throw new ApiError(`Pharmacy with id '${pharmacyId}' not found`, 404);
      }
      return mock;
    }
  }

  async createReservation(
    pharmacyId: string,
    req: CreateReservationRequest
  ): Promise<ReservationResponse> {
    try {
      return await this.fetchJson<ReservationResponse>(
        `${this.baseUrl}/pharmacies/${encodeURIComponent(pharmacyId)}/reserve`,
        {
          method: "POST",
          body: JSON.stringify(req),
        }
      );
    } catch {
      return createReservationMock(pharmacyId, req);
    }
  }

  async getDirections(
    pharmacyId: string,
    fromLat: number,
    fromLng: number,
    mode: string = "driving"
  ): Promise<DirectionsResponse> {
    const params = new URLSearchParams({
      fromLat: String(fromLat),
      fromLng: String(fromLng),
      mode,
    });
    try {
      return await this.fetchJson<DirectionsResponse>(
        `${this.baseUrl}/pharmacies/${encodeURIComponent(pharmacyId)}/directions?${params.toString()}`
      );
    } catch {
      return getDirectionsMock(pharmacyId, fromLat, fromLng, mode);
    }
  }

  async getSystemHealth(): Promise<SystemHealthResponse> {
    try {
      return await this.fetchJson<SystemHealthResponse>(`${this.baseUrl}/telemetry/health`);
    } catch {
      return getSystemHealthMock();
    }
  }

  async getSystemMetrics(): Promise<SystemMetricsResponse> {
    try {
      return await this.fetchJson<SystemMetricsResponse>(`${this.baseUrl}/telemetry/metrics`);
    } catch {
      return getSystemMetricsMock();
    }
  }

  async getMetricsHistory(metric: string, range: string = "1h"): Promise<MetricsHistoryResponse> {
    const params = new URLSearchParams({ metric, range });
    try {
      return await this.fetchJson<MetricsHistoryResponse>(
        `${this.baseUrl}/telemetry/metrics/history?${params.toString()}`
      );
    } catch {
      return getMetricsHistoryMock(metric, range);
    }
  }
}

export const apiClient = new ApiClient();
