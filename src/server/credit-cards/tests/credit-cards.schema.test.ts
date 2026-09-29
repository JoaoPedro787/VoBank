import {
  createCreditCardSchema,
  updateCreditCardSchema,
  creditCardResponseSchema,
  creditCards,
} from "../schemas/credit-cards.schema";

describe("Credit Cards Schemas & Validations", () => {
  describe("createCreditCardSchema", () => {
    it("should accept valid credit card details", () => {
      const validData = {
        name: "Nubank Ultravioleta",
        flag: "Mastercard",
        color: "#8A05BE",
        closingDay: 25,
        dueDay: 5,
        limit: 5000,
      };

      const result = createCreditCardSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.closingDay).toBe(25);
        expect(result.data.dueDay).toBe(5);
        expect(result.data.limit).toBe(5000);
      }
    });

    it("should coerce string numbers for closingDay and dueDay", () => {
      const dataWithStrings = {
        name: "Inter",
        flag: "Mastercard",
        color: "#FF7A00",
        closingDay: "15",
        dueDay: "22",
      };

      const result = createCreditCardSchema.safeParse(dataWithStrings);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.closingDay).toBe(15);
        expect(result.data.dueDay).toBe(22);
      }
    });

    it("should reject closingDay less than 1 or greater than 31", () => {
      expect(
        createCreditCardSchema.safeParse({
          name: "Card",
          color: "#000000",
          closingDay: 0,
          dueDay: 10,
        }).success,
      ).toBe(false);

      expect(
        createCreditCardSchema.safeParse({
          name: "Card",
          color: "#000000",
          closingDay: 32,
          dueDay: 10,
        }).success,
      ).toBe(false);
    });

    it("should reject dueDay less than 1 or greater than 31", () => {
      expect(
        createCreditCardSchema.safeParse({
          name: "Card",
          color: "#000000",
          closingDay: 10,
          dueDay: 0,
        }).success,
      ).toBe(false);

      expect(
        createCreditCardSchema.safeParse({
          name: "Card",
          color: "#000000",
          closingDay: 10,
          dueDay: 32,
        }).success,
      ).toBe(false);
    });

    it("should reject invalid color format", () => {
      const result = createCreditCardSchema.safeParse({
        name: "Card",
        color: "blue",
        closingDay: 10,
        dueDay: 20,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("updateCreditCardSchema", () => {
    it("should allow partial edits", () => {
      expect(updateCreditCardSchema.safeParse({ name: "Novo Nome" }).success).toBe(true);
      expect(updateCreditCardSchema.safeParse({ closingDay: 20 }).success).toBe(true);
      expect(updateCreditCardSchema.safeParse({ dueDay: 28 }).success).toBe(true);
    });
  });

  describe("creditCardResponseSchema", () => {
    it("should validate credit card response data", () => {
      const card = {
        id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        userId: "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
        name: "Itaú Click",
        flag: "Visa",
        color: "#EC7000",
        closingDay: 20,
        dueDay: 27,
        limit: "10000.00",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(creditCardResponseSchema.safeParse(card).success).toBe(true);
    });
  });

  describe("creditCards Drizzle Table Definition", () => {
    it("should have correct columns configured", () => {
      expect(creditCards.id).toBeDefined();
      expect(creditCards.userId).toBeDefined();
      expect(creditCards.name).toBeDefined();
      expect(creditCards.flag).toBeDefined();
      expect(creditCards.color).toBeDefined();
      expect(creditCards.closingDay).toBeDefined();
      expect(creditCards.dueDay).toBeDefined();
      expect(creditCards.limit).toBeDefined();
      expect(creditCards.createdAt).toBeDefined();
      expect(creditCards.updatedAt).toBeDefined();
    });
  });
});
