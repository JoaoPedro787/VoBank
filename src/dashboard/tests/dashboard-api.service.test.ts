import { dashboardApiService } from "../services/dashboard-api.service";

describe("dashboardApiService", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should get dashboard summary successfully without query params", async () => {
    const mockSummary = {
      month: 10,
      year: 2026,
      totalCommitted: 500,
      totalPaid: 200,
      totalPending: 300,
      totalOverdue: 0,
      installmentsCount: 3,
      byPerson: [],
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSummary,
    } as Response);

    const result = await dashboardApiService.getSummary("fake-token");
    expect(result).toEqual(mockSummary);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/dashboard"),
      expect.objectContaining({
        headers: { Authorization: "Bearer fake-token" },
      }),
    );
  });

  it("should pass month and year query parameters when provided", async () => {
    const mockSummary = {
      month: 11,
      year: 2026,
      totalCommitted: 150,
      totalPaid: 150,
      totalPending: 0,
      totalOverdue: 0,
      installmentsCount: 1,
      byPerson: [],
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSummary,
    } as Response);

    const result = await dashboardApiService.getSummary("fake-token", 11, 2026);
    expect(result).toEqual(mockSummary);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/dashboard?month=11&year=2026"),
      expect.objectContaining({
        headers: { Authorization: "Bearer fake-token" },
      }),
    );
  });

  it("should throw error when API returns failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Erro ao carregar dados do dashboard" }),
    } as Response);

    await expect(dashboardApiService.getSummary("fake-token")).rejects.toThrow(
      "Erro ao carregar dados do dashboard",
    );
  });
});
