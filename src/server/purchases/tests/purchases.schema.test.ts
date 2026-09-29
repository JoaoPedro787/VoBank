import {
  createPurchaseSchema,
  splitInputSchema,
  toggleInstallmentSplitPaidSchema,
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
