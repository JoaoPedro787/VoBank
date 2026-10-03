import { filterPurchases, calculatePurchasesMetrics } from "../utils/purchases-filter";
import { PurchaseClient } from "../types/purchases.types";

describe("Purchases Filter & Metrics (TDD)", () => {
  const mockPurchases: PurchaseClient[] = [
    {
      id: "purchase-1",
      userId: "user-1",
      creditCardId: "card-nubank",
      description: "Supermercado Pão de Açúcar",
      totalAmount: "300.00",
      purchaseDate: "2026-03-10T12:00:00Z",
      paymentMethod: "credit",
      totalInstallments: 3,
      createdAt: "2026-03-10T12:00:00Z",
      updatedAt: "2026-03-10T12:00:00Z",
      creditCard: {
        id: "card-nubank",
        name: "Nubank",
        flag: "Mastercard",
        color: "#820ad1",
        closingDay: 25,
        dueDay: 5,
      },
      installments: [
        {
          id: "inst-1",
          purchaseId: "purchase-1",
          installmentNumber: 1,
          amount: "100.00",
          dueDate: "2026-04-05T12:00:00Z",
          billingMonth: 4,
          billingYear: 2026,
          createdAt: "",
          updatedAt: "",
          splits: [
            {
              id: "sp-1",
              installmentId: "inst-1",
              personId: "person-maria",
              amount: "50.00",
              percentage: "50",
              isPaid: true,
              paidAt: "2026-04-01T10:00:00Z",
              createdAt: "",
              updatedAt: "",
            },
            {
              id: "sp-2",
              installmentId: "inst-1",
              personId: null, // Titular
              amount: "50.00",
              percentage: "50",
              isPaid: true,
              paidAt: "2026-04-01T10:00:00Z",
              createdAt: "",
              updatedAt: "",
            },
          ],
        },
        {
          id: "inst-2",
          purchaseId: "purchase-1",
          installmentNumber: 2,
          amount: "100.00",
          dueDate: "2026-05-05T12:00:00Z",
          billingMonth: 5,
          billingYear: 2026,
          createdAt: "",
          updatedAt: "",
          splits: [
            {
              id: "sp-3",
              installmentId: "inst-2",
              personId: "person-maria",
              amount: "50.00",
              percentage: "50",
              isPaid: false,
              paidAt: null,
              createdAt: "",
              updatedAt: "",
            },
            {
              id: "sp-4",
              installmentId: "inst-2",
              personId: null,
              amount: "50.00",
              percentage: "50",
              isPaid: false,
              paidAt: null,
              createdAt: "",
              updatedAt: "",
            },
          ],
        },
      ],
    },
    {
      id: "purchase-2",
      userId: "user-1",
      creditCardId: "card-inter",
      description: "Cinema e Pipoca",
      totalAmount: "80.00",
      purchaseDate: "2026-03-15T12:00:00Z",
      paymentMethod: "credit",
      totalInstallments: 1,
      createdAt: "2026-03-15T12:00:00Z",
      updatedAt: "2026-03-15T12:00:00Z",
      creditCard: {
        id: "card-inter",
        name: "Inter",
        flag: "Mastercard",
        color: "#ff7a00",
        closingDay: 10,
        dueDay: 20,
      },
      installments: [
        {
          id: "inst-3",
          purchaseId: "purchase-2",
          installmentNumber: 1,
          amount: "80.00",
          dueDate: "2026-04-20T12:00:00Z",
          billingMonth: 4,
          billingYear: 2026,
          createdAt: "",
          updatedAt: "",
          splits: [
            {
              id: "sp-5",
              installmentId: "inst-3",
              personId: "person-joao",
              amount: "40.00",
              isPaid: false,
              createdAt: "",
              updatedAt: "",
            },
            {
              id: "sp-6",
              installmentId: "inst-3",
              personId: null,
              amount: "40.00",
              isPaid: false,
              createdAt: "",
              updatedAt: "",
            },
          ],
        },
      ],
    },
    {
      id: "purchase-3",
      userId: "user-1",
      creditCardId: null,
      description: "Almoço Restaurante",
      totalAmount: "45.00",
      purchaseDate: "2026-02-20T12:00:00Z",
      paymentMethod: "debit",
      totalInstallments: 1,
      createdAt: "2026-02-20T12:00:00Z",
      updatedAt: "2026-02-20T12:00:00Z",
      installments: [
        {
          id: "inst-4",
          purchaseId: "purchase-3",
          installmentNumber: 1,
          amount: "45.00",
          dueDate: "2026-02-20T12:00:00Z",
          billingMonth: 2,
          billingYear: 2026,
          createdAt: "",
          updatedAt: "",
          splits: [
            {
              id: "sp-7",
              installmentId: "inst-4",
              personId: null,
              amount: "45.00",
              isPaid: true,
              createdAt: "",
              updatedAt: "",
            },
          ],
        },
      ],
    },
  ];

  describe("Textual Search", () => {
    it("should filter purchases by description case-insensitively", () => {
      const result = filterPurchases(mockPurchases, {
        isAllPeriods: true,
        searchQuery: "supermercado",
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("purchase-1");
    });

    it("should trim search query and match partial strings", () => {
      const result = filterPurchases(mockPurchases, {
        isAllPeriods: true,
        searchQuery: "  Cine  ",
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("purchase-2");
    });

    it("should return empty array if no purchase matches description", () => {
      const result = filterPurchases(mockPurchases, {
        isAllPeriods: true,
        searchQuery: "Farmácia Inexistente",
      });

      expect(result).toHaveLength(0);
    });
  });

  describe("Period Filtering", () => {
    it("should return all purchases when isAllPeriods is true", () => {
      const result = filterPurchases(mockPurchases, { isAllPeriods: true });
      expect(result).toHaveLength(3);
    });

    it("should filter purchases by selected month and year based on purchaseDate", () => {
      // March 2026
      const marchResult = filterPurchases(mockPurchases, {
        isAllPeriods: false,
        selectedMonth: 3,
        selectedYear: 2026,
      });
      expect(marchResult).toHaveLength(2);
      expect(marchResult.map((p) => p.id)).toEqual(["purchase-1", "purchase-2"]);

      // February 2026
      const febResult = filterPurchases(mockPurchases, {
        isAllPeriods: false,
        selectedMonth: 2,
        selectedYear: 2026,
      });
      expect(febResult).toHaveLength(1);
      expect(febResult[0].id).toBe("purchase-3");

      // January 2026 (empty)
      const janResult = filterPurchases(mockPurchases, {
        isAllPeriods: false,
        selectedMonth: 1,
        selectedYear: 2026,
      });
      expect(janResult).toHaveLength(0);
    });
  });

  describe("Credit Card Filtering", () => {
    it("should filter by specific card ID", () => {
      const result = filterPurchases(mockPurchases, {
        isAllPeriods: true,
        selectedCardId: "card-nubank",
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("purchase-1");
    });

    it("should filter by no-card purchases (debit/cash)", () => {
      const result = filterPurchases(mockPurchases, {
        isAllPeriods: true,
        selectedCardId: "no-card",
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("purchase-3");
    });
  });

  describe("Person Filtering", () => {
    it("should filter by specific person assigned to splits", () => {
      const mariaResult = filterPurchases(mockPurchases, {
        isAllPeriods: true,
        selectedPersonId: "person-maria",
      });
      expect(mariaResult).toHaveLength(1);
      expect(mariaResult[0].id).toBe("purchase-1");

      const joaoResult = filterPurchases(mockPurchases, {
        isAllPeriods: true,
        selectedPersonId: "person-joao",
      });
      expect(joaoResult).toHaveLength(1);
      expect(joaoResult[0].id).toBe("purchase-2");
    });

    it("should filter by user (titular)", () => {
      const userResult = filterPurchases(mockPurchases, {
        isAllPeriods: true,
        selectedPersonId: "user",
      });
      expect(userResult).toHaveLength(3);
    });
  });

  describe("Cross-Filtering Combinations", () => {
    it("should accurately combine card, person, month/year and search query", () => {
      // Scenario: Nubank + Maria in March 2026
      const result = filterPurchases(mockPurchases, {
        isAllPeriods: false,
        selectedMonth: 3,
        selectedYear: 2026,
        selectedCardId: "card-nubank",
        selectedPersonId: "person-maria",
        searchQuery: "Supermercado",
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("purchase-1");

      // Scenario: Inter + Maria in March 2026 (Maria is not in Inter purchase)
      const noMatch = filterPurchases(mockPurchases, {
        isAllPeriods: false,
        selectedMonth: 3,
        selectedYear: 2026,
        selectedCardId: "card-inter",
        selectedPersonId: "person-maria",
      });

      expect(noMatch).toHaveLength(0);
    });
  });

  describe("Purchases Metrics Calculation", () => {
    it("should calculate totalAmount, totalCount, paidAmount, and pendingAmount accurately", () => {
      const metrics = calculatePurchasesMetrics(mockPurchases);

      // Total amounts: 300 + 80 + 45 = 425
      expect(metrics.totalAmount).toBe(425);
      expect(metrics.totalCount).toBe(3);

      // Paid amounts:
      // purchase-1: sp-1 (50.00) + sp-2 (50.00) = 100.00
      // purchase-2: 0
      // purchase-3: sp-7 (45.00) = 45.00
      // Total paid = 145.00
      expect(metrics.paidAmount).toBe(145);

      // Pending amounts:
      // purchase-1: sp-3 (50.00) + sp-4 (50.00) = 100.00
      // purchase-2: sp-5 (40.00) + sp-6 (40.00) = 80.00
      // purchase-3: 0
      // Total pending = 180.00
      expect(metrics.pendingAmount).toBe(180);
    });
  });
});
