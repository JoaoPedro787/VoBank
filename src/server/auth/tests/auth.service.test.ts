import { AuthService } from "../services/auth.service";
import { IAuthRepository } from "../repositories/auth.repository.interface";
import { User } from "../schemas/auth.schema";
import { hashPassword } from "../utils/hash";

describe("AuthService (TDD with Mocked Repository)", () => {
  let mockAuthRepo: jest.Mocked<IAuthRepository>;
  let authService: AuthService;

  beforeEach(() => {
    mockAuthRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    authService = new AuthService(mockAuthRepo);
  });

  describe("register", () => {
    it("should successfully register a user and return user data with token", async () => {
      const input = {
        name: "João Silva",
        email: "joao@example.com",
        password: "securepassword123",
      };

      mockAuthRepo.findByEmail.mockResolvedValue(null);

      const createdUser: User = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: input.name,
        email: input.email,
        password: "hashedPassword123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthRepo.create.mockResolvedValue(createdUser);

      const result = await authService.register(input);

      expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith(input.email);
      expect(mockAuthRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: input.name,
          email: input.email,
        }),
      );
      expect(result.token).toBeDefined();
      expect(result.user.id).toBe(createdUser.id);
      expect(result.user.email).toBe(createdUser.email);
      expect((result.user as unknown as { password?: string }).password).toBeUndefined();
    });

    it("should reject registration if email is already taken", async () => {
      const input = {
        name: "Existing User",
        email: "existing@example.com",
        password: "password123",
      };

      const existingUser: User = {
        id: "existing-id",
        name: input.name,
        email: input.email,
        password: "hashedPassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthRepo.findByEmail.mockResolvedValue(existingUser);

      await expect(authService.register(input)).rejects.toThrow("E-mail já está em uso");
      expect(mockAuthRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const password = "mysecretpassword";
      const hashedPassword = await hashPassword(password);

      const existingUser: User = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "João Silva",
        email: "joao@example.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthRepo.findByEmail.mockResolvedValue(existingUser);

      const result = await authService.login({
        email: "joao@example.com",
        password: password,
      });

      expect(result.token).toBeDefined();
      expect(result.user.id).toBe(existingUser.id);
      expect(result.user.email).toBe(existingUser.email);
      expect((result.user as unknown as { password?: string }).password).toBeUndefined();
    });

    it("should throw error if user with email is not found", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: "unknown@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Credenciais inválidas");
    });

    it("should throw error if password is wrong", async () => {
      const hashedPassword = await hashPassword("correctPassword");

      const existingUser: User = {
        id: "user-id",
        name: "João Silva",
        email: "joao@example.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthRepo.findByEmail.mockResolvedValue(existingUser);

      await expect(
        authService.login({
          email: "joao@example.com",
          password: "wrongPassword",
        }),
      ).rejects.toThrow("Credenciais inválidas");
    });
  });

  describe("getProfile", () => {
    it("should return user profile without password", async () => {
      const user: User = {
        id: "user-123",
        name: "João Silva",
        email: "joao@example.com",
        password: "hashedPassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthRepo.findById.mockResolvedValue(user);

      const profile = await authService.getProfile("user-123");

      expect(profile.id).toBe(user.id);
      expect(profile.email).toBe(user.email);
      expect((profile as unknown as { password?: string }).password).toBeUndefined();
    });

    it("should throw error if user not found", async () => {
      mockAuthRepo.findById.mockResolvedValue(null);

      await expect(authService.getProfile("non-existent-id")).rejects.toThrow(
        "Usuário não encontrado",
      );
    });
  });
});
