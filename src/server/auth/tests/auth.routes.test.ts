import { AuthService } from "../services/auth.service";
import { InMemoryAuthRepository } from "../repositories/in-memory-auth.repository";
import { requireAuth } from "../middleware/auth.middleware";
import { apiSuccess, handleApiError } from "../../shared/utils/api-response";
import { signToken } from "../utils/jwt";
import { hashPassword } from "../utils/hash";

describe("Auth Route Components (In-Memory TDD)", () => {
  let authRepo: InMemoryAuthRepository;
  let authService: AuthService;

  // Handlers compostos pelos componentes da feature (em memória, sem importar rotas de app/api)
  const handleRegister = async (req: Request): Promise<Response> => {
    try {
      const body = await req.json();
      const result = await authService.register(body);
      return apiSuccess(result, 201);
    } catch (error) {
      return handleApiError(error);
    }
  };

  const handleLogin = async (req: Request): Promise<Response> => {
    try {
      const body = await req.json();
      const result = await authService.login(body);
      return apiSuccess(result, 200);
    } catch (error) {
      return handleApiError(error);
    }
  };

  const handleMe = async (req: Request): Promise<Response> => {
    try {
      const tokenUser = requireAuth(req);
      const profile = await authService.getProfile(tokenUser.userId);
      return apiSuccess(profile, 200);
    } catch (error) {
      return handleApiError(error);
    }
  };

  beforeEach(() => {
    authRepo = new InMemoryAuthRepository();
    authService = new AuthService(authRepo);
  });

  describe("Register Component Workflow", () => {
    it("should return 201 with created user and token in memory", async () => {
      const request = new Request("http://localhost:8081/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Maria Silva",
          email: "maria@example.com",
          password: "password123",
        }),
      });

      const response = await handleRegister(request);
      expect(response.status).toBe(201);

      const json = await response.json();
      expect(json.token).toBeDefined();
      expect(json.user.name).toBe("Maria Silva");
      expect(json.user.email).toBe("maria@example.com");

      // Validar persistência in-memory
      const savedUser = await authRepo.findByEmail("maria@example.com");
      expect(savedUser).not.toBeNull();
      expect(savedUser?.name).toBe("Maria Silva");
    });

    it("should return 400 when body fails Zod schema validation", async () => {
      const request = new Request("http://localhost:8081/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          email: "not-an-email",
          password: "123",
        }),
      });

      const response = await handleRegister(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toBe("Dados de requisição inválidos");
      expect(json.details).toBeDefined();
      expect(json.details.length).toBeGreaterThan(0);
    });

    it("should return 409 when email already exists in repository", async () => {
      // Cadastrar primeiro usuário
      await authRepo.create({
        name: "Existing",
        email: "maria@example.com",
        password: await hashPassword("password123"),
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

      const response = await handleRegister(request);
      expect(response.status).toBe(409);

      const json = await response.json();
      expect(json.error).toBe("E-mail já está em uso");
    });
  });

  describe("Login Component Workflow", () => {
    it("should return 200 with user and token on valid credentials", async () => {
      const password = "correctPassword123";
      const hashedPassword = await hashPassword(password);

      const savedUser = await authRepo.create({
        name: "Carlos",
        email: "carlos@example.com",
        password: hashedPassword,
      });

      const request = new Request("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "carlos@example.com",
          password: password,
        }),
      });

      const response = await handleLogin(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.token).toBeDefined();
      expect(json.user.id).toBe(savedUser.id);
      expect(json.user.email).toBe("carlos@example.com");
    });

    it("should return 401 on invalid credentials", async () => {
      const request = new Request("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "wrongPassword",
        }),
      });

      const response = await handleLogin(request);
      expect(response.status).toBe(401);

      const json = await response.json();
      expect(json.error).toBe("Credenciais inválidas");
    });
  });

  describe("Me / Protected Profile Component Workflow", () => {
    it("should return 200 with user profile when token is valid", async () => {
      const user = await authRepo.create({
        name: "Ana Santos",
        email: "ana@example.com",
        password: await hashPassword("hashedPassword123"),
      });

      const token = signToken({ userId: user.id, email: user.email });

      const request = new Request("http://localhost:8081/api/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await handleMe(request);
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

      const response = await handleMe(request);
      expect(response.status).toBe(401);

      const json = await response.json();
      expect(json.error).toBe("Token de autenticação ausente ou inválido");
    });
  });
});
