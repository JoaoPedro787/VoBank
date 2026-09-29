import {
  createPersonSchema,
  updatePersonSchema,
  personResponseSchema,
  people,
} from "../schemas/people.schema";

describe("People Schemas & Validations", () => {
  describe("createPersonSchema", () => {
    it("should accept valid person name and hex color", () => {
      const validData = {
        name: "Lucas",
        color: "#3B82F6",
      };

      const result = createPersonSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Lucas");
        expect(result.data.color).toBe("#3B82F6");
      }
    });

    it("should reject empty name", () => {
      const invalidData = {
        name: "   ",
        color: "#3B82F6",
      };

      const result = createPersonSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("O nome da pessoa é obrigatório");
      }
    });

    it("should reject invalid hex color format without hash", () => {
      const invalidData = {
        name: "Lucas",
        color: "3B82F6",
      };

      const result = createPersonSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("formato hexadecimal #RRGGBB");
      }
    });

    it("should reject invalid hex characters or 3-digit shorthand", () => {
      const invalid3Digit = { name: "Lucas", color: "#FFF" };
      const invalidHexChars = { name: "Lucas", color: "#GGGGGG" };

      expect(createPersonSchema.safeParse(invalid3Digit).success).toBe(false);
      expect(createPersonSchema.safeParse(invalidHexChars).success).toBe(false);
    });
  });

  describe("updatePersonSchema", () => {
    it("should accept partial updates", () => {
      expect(updatePersonSchema.safeParse({ name: "Novo Nome" }).success).toBe(true);
      expect(updatePersonSchema.safeParse({ color: "#10B981" }).success).toBe(true);
      expect(updatePersonSchema.safeParse({}).success).toBe(true);
    });

    it("should reject invalid color in partial update", () => {
      const result = updatePersonSchema.safeParse({ color: "invalid" });
      expect(result.success).toBe(false);
    });
  });

  describe("personResponseSchema", () => {
    it("should validate complete person response payload", () => {
      const response = {
        id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        userId: "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
        name: "Maria",
        color: "#EC4899",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(personResponseSchema.safeParse(response).success).toBe(true);
    });
  });

  describe("people Drizzle Table Definition", () => {
    it("should have correct columns configured", () => {
      expect(people.id).toBeDefined();
      expect(people.userId).toBeDefined();
      expect(people.name).toBeDefined();
      expect(people.color).toBeDefined();
      expect(people.createdAt).toBeDefined();
      expect(people.updatedAt).toBeDefined();
    });
  });
});
