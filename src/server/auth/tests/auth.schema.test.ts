import {
  registerUserSchema,
  loginUserSchema,
  userResponseSchema,
  users,
} from "../schemas/auth.schema";

describe("Auth Schemas & Validations", () => {
  describe("registerUserSchema", () => {
    it("should accept valid registration data", () => {
      const validData = {
        name: "João Silva",
        email: "joao@example.com",
        password: "securepassword123",
      };

      const result = registerUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should reject email with invalid format", () => {
      const invalidData = {
        name: "João Silva",
        email: "invalid-email",
        password: "securepassword123",
      };

      const result = registerUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Formato de e-mail inválido");
      }
    });

    it("should reject password with less than 6 characters", () => {
      const invalidData = {
        name: "João Silva",
        email: "joao@example.com",
        password: "12345",
      };

      const result = registerUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("A senha deve ter no mínimo 6 caracteres");
      }
    });

    it("should reject name with less than 2 characters", () => {
      const invalidData = {
        name: "J",
        email: "joao@example.com",
        password: "securepassword123",
      };

      const result = registerUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("O nome deve ter no mínimo 2 caracteres");
      }
    });
  });

  describe("loginUserSchema", () => {
    it("should accept valid login credentials", () => {
      const validData = {
        email: "user@example.com",
        password: "mypassword",
      };

      const result = loginUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty password", () => {
      const invalidData = {
        email: "user@example.com",
        password: "",
      };

      const result = loginUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("userResponseSchema", () => {
    it("should parse valid user response format", () => {
      const responseData = {
        id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        name: "João",
        email: "joao@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = userResponseSchema.safeParse(responseData);
      expect(result.success).toBe(true);
    });
  });

  describe("users Drizzle Table Definition", () => {
    it("should have correct table and column configurations", () => {
      expect(users).toBeDefined();
      expect(users.id).toBeDefined();
      expect(users.name).toBeDefined();
      expect(users.email).toBeDefined();
      expect(users.password).toBeDefined();
      expect(users.createdAt).toBeDefined();
      expect(users.updatedAt).toBeDefined();
    });
  });
});
