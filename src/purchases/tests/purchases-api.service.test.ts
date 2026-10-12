import { purchasesApiService } from "../services/purchases-api.service";

describe("purchasesApiService", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should list purchases successfully", async () => {
    const mockPurchases = [
      {
        id: "p1",
        description: "Supermercado",
        totalAmount: "300",
        purchaseDate: "2025-05-10T12:00:00Z",
        paymentMethod: "credit",
        totalInstallments: 3,
        installments: [],
      },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPurchases,
    } as Response);

    const result = await purchasesApiService.list("fake-token");
    expect(result).toEqual(mockPurchases);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/purchases"),
      expect.objectContaining({
        headers: { Authorization: "Bearer fake-token" },
      }),
    );
  });

  it("should list purchases with query filter parameters", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    await purchasesApiService.list("fake-token", {
      month: 3,
      year: 2026,
      creditCardId: "c1",
      personId: "p1",
      search: "mercado",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(
        /\/api\/purchases\?month=3&year=2026&creditCardId=c1&personId=p1&search=mercado/,
      ),
      expect.objectContaining({
        headers: { Authorization: "Bearer fake-token" },
      }),
    );
  });

  it("should create a purchase successfully", async () => {
    const mockCreated = {
      id: "p1",
      description: "Notebook",
      totalAmount: "3000",
      purchaseDate: "2025-05-10T12:00:00Z",
      paymentMethod: "credit",
      totalInstallments: 10,
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCreated,
    } as Response);

    const result = await purchasesApiService.create("fake-token", {
      description: "Notebook",
      totalAmount: 3000,
      purchaseDate: new Date(),
      paymentMethod: "credit",
      creditCardId: "c1",
      totalInstallments: 10,
    });

    expect(result).toEqual(mockCreated);
  });

  it("should update a purchase successfully", async () => {
    const mockUpdated = {
      id: "p1",
      description: "Notebook Gamer",
      totalAmount: "3000",
      purchaseDate: "2025-05-15T12:00:00Z",
      paymentMethod: "credit",
      totalInstallments: 10,
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUpdated,
    } as Response);

    const result = await purchasesApiService.update("fake-token", "p1", {
      description: "Notebook Gamer",
      purchaseDate: new Date("2025-05-15T12:00:00Z"),
    });

    expect(result).toEqual(mockUpdated);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/purchases/p1"),
      expect.objectContaining({
        method: "PUT",
        headers: {
          Authorization: "Bearer fake-token",
          "Content-Type": "application/json",
        },
      }),
    );
  });

  it("should toggle installment split paid successfully", async () => {
    const mockUpdatedSplit = {
      id: "s1",
      installmentId: "i1",
      isPaid: true,
      paidAt: "2025-05-10T12:00:00Z",
      amount: "100",
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUpdatedSplit,
    } as Response);

    const result = await purchasesApiService.toggleSplitPaid("fake-token", "s1", true);
    expect(result).toEqual(mockUpdatedSplit);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/installments/s1/toggle-paid"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ isPaid: true }),
      }),
    );
  });

  it("should throw error when API returns failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Erro de validação" }),
    } as Response);

    await expect(
      purchasesApiService.create("fake-token", {
        description: "Falha",
        totalAmount: 10,
        purchaseDate: new Date(),
        paymentMethod: "cash",
      }),
    ).rejects.toThrow("Erro de validação");
  });
});
