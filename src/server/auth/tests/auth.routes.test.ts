import { POST as registerHandler } from "../../../app/api/auth/register+api";
import { POST as loginHandler } from "../../../app/api/auth/login+api";
import { GET as meHandler } from "../../../app/api/auth/me+api";
import { setAuthService, AuthService } from "../services";
import { IAuthRepository } from "../repositories/auth.repository.interface";
import { User } from "../schemas/auth.schema";
import { signToken } from "../utils/jwt";
import { hashPassword } from "../utils/hash";

describe("Auth API Routes (TDD)", () => {
  let mockAuthRepo: jest.Mocked<IAuthRepository>;
  let authService: AuthService;

  beforeEach(() => {
    mockAuthRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    authService = new AuthService(mockAuthRepo);
    setAuthService(authService);
  });

  afterEach(() => {
    setAuthService(null);
  });

  describe("POST /api/auth/register", () => {
    it("should return 201 with user and token on valid registration", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue(null);
      mockAuthRepo.create.mockResolvedValue({
        id: "user-123",
        name: "Maria Silva",
        email: "maria@example.com",
        password: "hashedPassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new Request("http://localhost:8081/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Maria Silva",
          email: "maria@example.com",
          password: "password123",
        }),
      });

      const response = await registerHandler(request);
      expect(response.status).toBe(201);

      const json = await response.json();
      expect(json.token).toBeDefined();
      expect(json.user.name).toBe("Maria Silva");
      expect(json.user.email).toBe("maria@example.com");
    });

    it("should return 400 when body is invalid Zod schema", async () => {
      const request = new Request("http://localhost:8081/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          email: "invalid-email",
          password: "123",
        }),
      });

      const response = await registerHandler(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toBe("Dados de requisição inválidos");
      expect(json.details).toBeDefined();
    });

    it("should return 409 when email already exists", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue({
        id: "existing-user",
        name: "Existing",
        email: "maria@example.com",
        password: "hashedPassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new Request("http://localhost:8081/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Maria Silva",
          email: "maria@example.com",
          password: "password123",
        }),
      });

      const response = await registerHandler(request);
      expect(response.status).toBe(409);

      const json = await response.json();
      expect(json.error).toBe("E-mail já está em uso");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return 200 with user and token on valid credentials", async () => {
      const password = "correctPassword123";
      const hashedPassword = await hashPassword(password);

      const existingUser: User = {
        id: "user-456",
        name: "Carlos",
        email: "carlos@example.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthRepo.findByEmail.mockResolvedValue(existingUser);

      const request = new Request("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "carlos@example.com",
          password: password,
        }),
      });

      const response = await loginHandler(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.token).toBeDefined();
      expect(json.user.id).toBe("user-456");
      expect(json.user.email).toBe("carlos@example.com");
    });

    it("should return 401 on invalid credentials", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue(null);

      const request = new Request("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "carlos@example.com",
          password: "wrongPassword",
        }),
      });

      const response = await loginHandler(request);
      expect(response.status).toBe(401);

      const json = await response.json();
      expect(json.error).toBe("Credenciais inválidas");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return 200 with user profile when authenticated", async () => {
      const user: User = {
        id: "user-789",
        name: "Ana Santos",
        email: "ana@example.com",
        password: "hashedPassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthRepo.findById.mockResolvedValue(user);

      const token = signToken({ userId: user.id, email: user.email });

      const request = new Request("http://localhost:8081/api/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await meHandler(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.id).toBe(user.id);
      expect(json.name).toBe("Ana Santos");
      expect(json.email).toBe("ana@example.com");
    });

    it("should return 401 when Authorization header is missing", async () => {
      const request = new Request("http://localhost:8081/api/auth/me", {
        method: "GET",
      });

      const response = await meHandler(request);
      expect(response.status).toBe(401);

      const json = await response.json();
      expect(json.error).toBe("Token de autenticação ausente ou inválido");
    });
  });
});
