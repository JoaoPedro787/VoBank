import {
  createPurchaseSchema,
  updatePurchaseSchema,
  createUpdatePurchaseWithInvarianceSchema,
  validatePurchaseInvariance,
  splitInputSchema,
  toggleInstallmentSplitPaidSchema,
  listPurchasesQuerySchema,
  purchases,
  installments,
  installmentSplits,
  paymentMethodEnum,
} from "../schemas/purchases.schema";

describe("Purchases, Installments & Splits Schemas & Validations", () => {
  const dummyCardId = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";
  const dummyPersonId = "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e";

  describe("createPurchaseSchema", () => {
    it("should accept valid credit purchase with card and installments", () => {
      const validCreditData = {
        description: "Supermercado Mensal",
        totalAmount: 600,
        purchaseDate: new Date(),
        paymentMethod: "credit" as const,
        creditCardId: dummyCardId,
        totalInstallments: 3,
        splits: [
          { personId: null, percentage: 50, amount: 300 },
          { personId: dummyPersonId, percentage: 50, amount: 300 },
        ],
      };

      const result = createPurchaseSchema.safeParse(validCreditData);
      expect(result.success).toBe(true);
    });

    it("should accept cash and debit purchases without creditCardId", () => {
      const cashPurchase = {
        description: "Almoço",
        totalAmount: 45.5,
        purchaseDate: new Date(),
        paymentMethod: "cash" as const,
        totalInstallments: 1,
      };

      const debitPurchase = {
        description: "Combustível",
        totalAmount: 120,
        purchaseDate: new Date(),
        paymentMethod: "debit" as const,
        totalInstallments: 1,
      };

      expect(createPurchaseSchema.safeParse(cashPurchase).success).toBe(true);
      expect(createPurchaseSchema.safeParse(debitPurchase).success).toBe(true);
    });

    it("should reject credit purchase when creditCardId is missing", () => {
      const invalidCredit = {
        description: "Notebook",
        totalAmount: 3000,
        purchaseDate: new Date(),
        paymentMethod: "credit" as const,
        totalInstallments: 10,
      };

      const result = createPurchaseSchema.safeParse(invalidCredit);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "O cartão de crédito é obrigatório para compras no crédito",
        );
      }
    });

    it("should reject negative or zero totalAmount", () => {
      const negativeAmount = {
        description: "Item",
        totalAmount: -50,
        purchaseDate: new Date(),
        paymentMethod: "cash" as const,
      };

      const zeroAmount = {
        description: "Item",
        totalAmount: 0,
        purchaseDate: new Date(),
        paymentMethod: "cash" as const,
      };

      expect(createPurchaseSchema.safeParse(negativeAmount).success).toBe(false);
      expect(createPurchaseSchema.safeParse(zeroAmount).success).toBe(false);
    });

    it("should reject totalInstallments less than 1", () => {
      const invalidInstallments = {
        description: "Item",
        totalAmount: 100,
        purchaseDate: new Date(),
        paymentMethod: "credit" as const,
        creditCardId: dummyCardId,
        totalInstallments: 0,
      };

      expect(createPurchaseSchema.safeParse(invalidInstallments).success).toBe(false);
    });

    it("should accept purchase without purchaseDate and default to current date", () => {
      const before = new Date();
      const withoutDate = {
        description: "Almoço sem data",
        totalAmount: 35,
        paymentMethod: "cash" as const,
      };

      const result = createPurchaseSchema.safeParse(withoutDate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.purchaseDate).toBeInstanceOf(Date);
        expect(result.data.purchaseDate.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
      }
    });

    it("should preserve explicitly provided purchaseDate", () => {
      const explicitDate = new Date("2026-01-15T12:00:00Z");
      const data = {
        description: "Compra com data explícita",
        totalAmount: 50,
        purchaseDate: explicitDate,
        paymentMethod: "cash" as const,
      };

      const result = createPurchaseSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.purchaseDate.getTime()).toBe(explicitDate.getTime());
      }
    });
  });

  describe("updatePurchaseSchema and Invariance", () => {
    const originalPurchase = {
      paymentMethod: "credit",
      creditCardId: dummyCardId,
      totalAmount: 600,
      totalInstallments: 3,
    };

    it("should accept valid partial update with description and splits", () => {
      const validUpdate = {
        description: "Supermercado - Descrição Atualizada",
        splits: [{ personId: dummyPersonId, percentage: 100, amount: 600 }],
      };

      const result = updatePurchaseSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it("should accept update with purchaseDate", () => {
      const validUpdate = {
        purchaseDate: new Date("2026-02-10T10:00:00Z"),
      };

      const result = updatePurchaseSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it("should reject changing paymentMethod under invariance validation", () => {
      const invarianceSchema = createUpdatePurchaseWithInvarianceSchema(originalPurchase);
      const invalidUpdate = {
        paymentMethod: "cash" as const,
      };

      const result = invarianceSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Não é permitido alterar o método de pagamento da compra",
        );
      }

      expect(() => validatePurchaseInvariance(originalPurchase, { paymentMethod: "cash" })).toThrow(
        "Não é permitido alterar o método de pagamento da compra",
      );
    });

    it("should reject changing creditCardId under invariance validation", () => {
      const invarianceSchema = createUpdatePurchaseWithInvarianceSchema(originalPurchase);
      const anotherCardId = "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f";
      const invalidUpdate = {
        creditCardId: anotherCardId,
      };

      const result = invarianceSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Não é permitido alterar o cartão de crédito da compra",
        );
      }

      expect(() =>
        validatePurchaseInvariance(originalPurchase, { creditCardId: anotherCardId }),
      ).toThrow("Não é permitido alterar o cartão de crédito da compra");
    });

    it("should reject changing totalAmount under invariance validation", () => {
      const invarianceSchema = createUpdatePurchaseWithInvarianceSchema(originalPurchase);
      const invalidUpdate = {
        totalAmount: 700,
      };

      const result = invarianceSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Não é permitido alterar o valor total da compra",
        );
      }

      expect(() => validatePurchaseInvariance(originalPurchase, { totalAmount: 700 })).toThrow(
        "Não é permitido alterar o valor total da compra",
      );
    });

    it("should reject changing totalInstallments under invariance validation", () => {
      const invarianceSchema = createUpdatePurchaseWithInvarianceSchema(originalPurchase);
      const invalidUpdate = {
        totalInstallments: 5,
      };

      const result = invarianceSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Não é permitido alterar a quantidade de parcelas da compra",
        );
      }

      expect(() => validatePurchaseInvariance(originalPurchase, { totalInstallments: 5 })).toThrow(
        "Não é permitido alterar a quantidade de parcelas da compra",
      );
    });

    it("should accept invariant fields when matching original values", () => {
      const invarianceSchema = createUpdatePurchaseWithInvarianceSchema(originalPurchase);
      const validUpdate = {
        description: "Nova descrição",
        paymentMethod: "credit" as const,
        creditCardId: dummyCardId,
        totalAmount: 600,
        totalInstallments: 3,
      };

      const result = invarianceSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
      expect(() => validatePurchaseInvariance(originalPurchase, validUpdate)).not.toThrow();
    });
  });

  describe("splitInputSchema", () => {
    it("should accept valid split definitions", () => {
      expect(
        splitInputSchema.safeParse({
          personId: null,
          percentage: 50,
          amount: 100,
        }).success,
      ).toBe(true);

      expect(
        splitInputSchema.safeParse({
          personId: dummyPersonId,
          percentage: 100,
          amount: 200,
        }).success,
      ).toBe(true);
    });

    it("should reject percentage greater than 100 or negative", () => {
      expect(splitInputSchema.safeParse({ percentage: 110 }).success).toBe(false);
      expect(splitInputSchema.safeParse({ percentage: -5 }).success).toBe(false);
    });
  });

  describe("toggleInstallmentSplitPaidSchema", () => {
    it("should accept valid boolean isPaid", () => {
      expect(toggleInstallmentSplitPaidSchema.safeParse({ isPaid: true }).success).toBe(true);
      expect(toggleInstallmentSplitPaidSchema.safeParse({ isPaid: false }).success).toBe(true);
    });

    it("should reject non-boolean isPaid", () => {
      expect(toggleInstallmentSplitPaidSchema.safeParse({ isPaid: "yes" }).success).toBe(false);
    });
  });

  describe("listPurchasesQuerySchema", () => {
    it("should accept empty query object", () => {
      const result = listPurchasesQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept valid month and year as numbers", () => {
      const result = listPurchasesQuerySchema.safeParse({
        month: 3,
        year: 2026,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.month).toBe(3);
        expect(result.data.year).toBe(2026);
      }
    });

    it("should coerce string values for month and year", () => {
      const result = listPurchasesQuerySchema.safeParse({
        month: "12",
        year: "2025",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.month).toBe(12);
        expect(result.data.year).toBe(2025);
      }
    });

    it("should reject month less than 1 or greater than 12", () => {
      expect(listPurchasesQuerySchema.safeParse({ month: 0 }).success).toBe(false);
      expect(listPurchasesQuerySchema.safeParse({ month: 13 }).success).toBe(false);
      expect(listPurchasesQuerySchema.safeParse({ month: -1 }).success).toBe(false);
    });

    it("should reject non-integer month", () => {
      expect(listPurchasesQuerySchema.safeParse({ month: 4.5 }).success).toBe(false);
    });

    it("should reject year outside 2000-2100", () => {
      expect(listPurchasesQuerySchema.safeParse({ year: 1999 }).success).toBe(false);
      expect(listPurchasesQuerySchema.safeParse({ year: 2101 }).success).toBe(false);
    });

    it("should accept valid creditCardId, personId, and search", () => {
      const result = listPurchasesQuerySchema.safeParse({
        creditCardId: dummyCardId,
        personId: dummyPersonId,
        search: "Mercado",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.creditCardId).toBe(dummyCardId);
        expect(result.data.personId).toBe(dummyPersonId);
        expect(result.data.search).toBe("Mercado");
      }
    });

    it("should accept special filter identifiers such as 'no-card', 'none', and 'user'", () => {
      const noCardResult = listPurchasesQuerySchema.safeParse({ creditCardId: "no-card" });
      const noneCardResult = listPurchasesQuerySchema.safeParse({ creditCardId: "none" });
      const userResult = listPurchasesQuerySchema.safeParse({ personId: "user" });

      expect(noCardResult.success).toBe(true);
      expect(noneCardResult.success).toBe(true);
      expect(userResult.success).toBe(true);
    });
  });

  describe("Drizzle Tables and Enum Definitions", () => {
    it("should export valid paymentMethodEnum", () => {
      expect(paymentMethodEnum).toBeDefined();
      expect(paymentMethodEnum.enumValues).toEqual(["cash", "debit", "credit"]);
    });

    it("should define purchases table columns correctly", () => {
      expect(purchases.id).toBeDefined();
      expect(purchases.userId).toBeDefined();
      expect(purchases.creditCardId).toBeDefined();
      expect(purchases.description).toBeDefined();
      expect(purchases.totalAmount).toBeDefined();
      expect(purchases.purchaseDate).toBeDefined();
      expect(purchases.paymentMethod).toBeDefined();
      expect(purchases.totalInstallments).toBeDefined();
      expect(purchases.createdAt).toBeDefined();
      expect(purchases.updatedAt).toBeDefined();
    });

    it("should define installments table columns correctly", () => {
      expect(installments.id).toBeDefined();
      expect(installments.purchaseId).toBeDefined();
      expect(installments.installmentNumber).toBeDefined();
      expect(installments.amount).toBeDefined();
      expect(installments.dueDate).toBeDefined();
      expect(installments.billingMonth).toBeDefined();
      expect(installments.billingYear).toBeDefined();
      expect(installments.createdAt).toBeDefined();
      expect(installments.updatedAt).toBeDefined();
    });

    it("should define installment_splits table columns correctly", () => {
      expect(installmentSplits.id).toBeDefined();
      expect(installmentSplits.installmentId).toBeDefined();
      expect(installmentSplits.personId).toBeDefined();
      expect(installmentSplits.amount).toBeDefined();
      expect(installmentSplits.percentage).toBeDefined();
      expect(installmentSplits.isPaid).toBeDefined();
      expect(installmentSplits.paidAt).toBeDefined();
      expect(installmentSplits.createdAt).toBeDefined();
      expect(installmentSplits.updatedAt).toBeDefined();
    });
  });
});
