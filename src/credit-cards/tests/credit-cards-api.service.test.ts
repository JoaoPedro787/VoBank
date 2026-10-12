import { creditCardsApiService } from "../services/credit-cards-api.service";

describe("creditCardsApiService", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should list credit cards successfully", async () => {
    const mockCards = [
      {
        id: "1",
        name: "Nubank",
        flag: "Mastercard",
        color: "#8A05BE",
        closingDay: 25,
        dueDay: 5,
        userId: "u1",
      },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCards,
    } as Response);

    const result = await creditCardsApiService.list("fake-token");
    expect(result).toEqual(mockCards);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/cards"),
      expect.objectContaining({
        headers: { Authorization: "Bearer fake-token" },
      }),
    );
  });

  it("should create a credit card successfully", async () => {
    const newCard = {
      id: "1",
      name: "Nubank",
      flag: "Mastercard",
      color: "#8A05BE",
      closingDay: 25,
      dueDay: 5,
      userId: "u1",
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => newCard,
    } as Response);

    const result = await creditCardsApiService.create("fake-token", {
      name: "Nubank",
      flag: "Mastercard",
      color: "#8A05BE",
      closingDay: 25,
      dueDay: 5,
    });

    expect(result).toEqual(newCard);
  });

  it("should throw error when create fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Erro ao criar cartão" }),
    } as Response);

    await expect(
      creditCardsApiService.create("fake-token", {
        name: "",
        color: "#8A05BE",
        closingDay: 25,
        dueDay: 5,
      }),
    ).rejects.toThrow("Erro ao criar cartão");
  });

  it("should update a credit card successfully", async () => {
    const updated = {
      id: "1",
      name: "Nubank Gold",
      flag: "Mastercard",
      color: "#8A05BE",
      closingDay: 28,
      dueDay: 8,
      userId: "u1",
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => updated,
    } as Response);

    const result = await creditCardsApiService.update("fake-token", "1", {
      name: "Nubank Gold",
      closingDay: 28,
      dueDay: 8,
    });

    expect(result).toEqual(updated);
  });

  it("should delete a credit card successfully", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Cartão removido com sucesso" }),
    } as Response);

    await expect(creditCardsApiService.delete("fake-token", "1")).resolves.toBeUndefined();
  });
});
