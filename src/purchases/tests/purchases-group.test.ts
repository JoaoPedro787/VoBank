import { groupPurchasesByDay } from "../utils/purchases-group";
import { PurchaseClient } from "../types/purchases.types";

describe("groupPurchasesByDay", () => {
  const referenceDate = new Date(2026, 2, 15, 12, 0, 0); // 15 de Março de 2026

  const createMockPurchase = (
    id: string,
    description: string,
    totalAmount: string,
    purchaseDate: string,
  ): PurchaseClient => ({
    id,
    userId: "u1",
    description,
    totalAmount,
    purchaseDate,
    paymentMethod: "credit",
    totalInstallments: 1,
    createdAt: purchaseDate,
    updatedAt: purchaseDate,
    installments: [],
  });

  it("should return an empty array when given an empty list", () => {
    expect(groupPurchasesByDay([])).toEqual([]);
    expect(groupPurchasesByDay(null as unknown as PurchaseClient[])).toEqual([]);
  });

  it("should group purchases by day and calculate totalAmount per group", () => {
    const purchases: PurchaseClient[] = [
      createMockPurchase("p1", "Café", "15.50", "2026-03-15T10:00:00Z"),
      createMockPurchase("p2", "Almoço", "45.00", "2026-03-15T13:00:00Z"),
      createMockPurchase("p3", "Mercado", "120.00", "2026-03-14T18:00:00Z"),
      createMockPurchase("p4", "Farmácia", "50.00", "2026-03-10T09:00:00Z"),
      createMockPurchase("p5", "Presente de Natal", "200.00", "2025-12-25T15:00:00Z"),
    ];

    const groups = groupPurchasesByDay(purchases, { referenceDate });

    expect(groups).toHaveLength(4);

    // Grupo 1: Hoje (15/03/2026)
    expect(groups[0].dateKey).toBe("2026-03-15");
    expect(groups[0].title).toBe("Hoje");
    expect(groups[0].formattedDate).toBe("15/03/2026");
    expect(groups[0].totalAmount).toBe(60.5);
    expect(groups[0].purchases).toHaveLength(2);
    expect(groups[0].purchases.map((p) => p.id)).toEqual(["p1", "p2"]);

    // Grupo 2: Ontem (14/03/2026)
    expect(groups[1].dateKey).toBe("2026-03-14");
    expect(groups[1].title).toBe("Ontem");
    expect(groups[1].formattedDate).toBe("14/03/2026");
    expect(groups[1].totalAmount).toBe(120.0);
    expect(groups[1].purchases).toHaveLength(1);

    // Grupo 3: Mesmo ano (10/03/2026)
    expect(groups[2].dateKey).toBe("2026-03-10");
    expect(groups[2].title).toBe("10 de Março");
    expect(groups[2].formattedDate).toBe("10/03/2026");
    expect(groups[2].totalAmount).toBe(50.0);

    // Grupo 4: Ano anterior (25/12/2025)
    expect(groups[3].dateKey).toBe("2025-12-25");
    expect(groups[3].title).toBe("25 de Dezembro de 2025");
    expect(groups[3].formattedDate).toBe("25/12/2025");
    expect(groups[3].totalAmount).toBe(200.0);
  });

  it("should sort groups in descending chronological order", () => {
    const purchases: PurchaseClient[] = [
      createMockPurchase("p1", "Antigo", "10", "2026-01-01T12:00:00Z"),
      createMockPurchase("p2", "Recente", "20", "2026-03-15T12:00:00Z"),
      createMockPurchase("p3", "Médio", "30", "2026-02-15T12:00:00Z"),
    ];

    const groups = groupPurchasesByDay(purchases, { referenceDate });

    expect(groups.map((g) => g.dateKey)).toEqual(["2026-03-15", "2026-02-15", "2026-01-01"]);
  });
});
