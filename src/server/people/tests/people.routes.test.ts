import { PeopleService } from "../services/people.service";
import { InMemoryPeopleRepository } from "../repositories/in-memory-people.repository";
import { requireAuth } from "../../auth/middleware/auth.middleware";
import { apiSuccess, handleApiError } from "../../shared/utils/api-response";
import { signToken } from "../../auth/utils/jwt";

describe("People Route Components (In-Memory TDD)", () => {
  let peopleRepo: InMemoryPeopleRepository;
  let peopleService: PeopleService;
  const userId = "user-123";
  let token: string;

  // Handlers compostos pelos componentes da feature em memória
  const handleListPeople = async (req: Request): Promise<Response> => {
    try {
      const authUser = requireAuth(req);
      const result = await peopleService.listPeople(authUser.userId);
      return apiSuccess(result, 200);
    } catch (error) {
      return handleApiError(error);
    }
  };

  const handleCreatePerson = async (req: Request): Promise<Response> => {
    try {
      const authUser = requireAuth(req);
      const body = await req.json();
      const result = await peopleService.createPerson(authUser.userId, body);
      return apiSuccess(result, 201);
    } catch (error) {
      return handleApiError(error);
    }
  };

  const handleGetPerson = async (req: Request, id: string): Promise<Response> => {
    try {
      const authUser = requireAuth(req);
      const result = await peopleService.getPerson(id, authUser.userId);
      return apiSuccess(result, 200);
    } catch (error) {
      return handleApiError(error);
    }
  };

  const handleUpdatePerson = async (req: Request, id: string): Promise<Response> => {
    try {
      const authUser = requireAuth(req);
      const body = await req.json();
      const result = await peopleService.updatePerson(id, authUser.userId, body);
      return apiSuccess(result, 200);
    } catch (error) {
      return handleApiError(error);
    }
  };

  const handleDeletePerson = async (req: Request, id: string): Promise<Response> => {
    try {
      const authUser = requireAuth(req);
      await peopleService.deletePerson(id, authUser.userId);
      return apiSuccess({ message: "Pessoa removida com sucesso" }, 200);
    } catch (error) {
      return handleApiError(error);
    }
  };

  beforeEach(() => {
    peopleRepo = new InMemoryPeopleRepository();
    peopleService = new PeopleService(peopleRepo);
    token = signToken({ userId, email: "user@example.com" });
  });

  describe("GET /api/people", () => {
    it("should return 200 with list of people for authenticated user", async () => {
      await peopleRepo.create({ userId, name: "Lucas", color: "#3B82F6" });
      await peopleRepo.create({ userId, name: "Maria", color: "#EC4899" });

      const request = new Request("http://localhost:8081/api/people", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const response = await handleListPeople(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(Array.isArray(json)).toBe(true);
      expect(json).toHaveLength(2);
      expect(json[0].name).toBe("Lucas");
      expect(json[1].name).toBe("Maria");
    });

    it("should return 401 when token is missing", async () => {
      const request = new Request("http://localhost:8081/api/people", {
        method: "GET",
      });

      const response = await handleListPeople(request);
      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/people", () => {
    it("should return 201 with created person", async () => {
      const request = new Request("http://localhost:8081/api/people", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Lucas",
          color: "#3B82F6",
        }),
      });

      const response = await handleCreatePerson(request);
      expect(response.status).toBe(201);

      const json = await response.json();
      expect(json.id).toBeDefined();
      expect(json.name).toBe("Lucas");
      expect(json.color).toBe("#3B82F6");
      expect(json.userId).toBe(userId);
    });

    it("should return 400 when color is invalid", async () => {
      const request = new Request("http://localhost:8081/api/people", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Lucas",
          color: "invalid-color",
        }),
      });

      const response = await handleCreatePerson(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toBe("Dados de requisição inválidos");
      expect(json.details).toBeDefined();
    });

    it("should return 400 when name is empty", async () => {
      const request = new Request("http://localhost:8081/api/people", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "",
          color: "#3B82F6",
        }),
      });

      const response = await handleCreatePerson(request);
      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/people/:id", () => {
    it("should return 200 with person details", async () => {
      const person = await peopleRepo.create({
        userId,
        name: "Lucas",
        color: "#3B82F6",
      });

      const request = new Request(`http://localhost:8081/api/people/${person.id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const response = await handleGetPerson(request, person.id);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.id).toBe(person.id);
      expect(json.name).toBe("Lucas");
    });

    it("should return 404 when person is not found", async () => {
      const request = new Request("http://localhost:8081/api/people/non-existent-id", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const response = await handleGetPerson(request, "non-existent-id");
      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/people/:id", () => {
    it("should return 200 with updated person", async () => {
      const person = await peopleRepo.create({
        userId,
        name: "Lucas",
        color: "#3B82F6",
      });

      const request = new Request(`http://localhost:8081/api/people/${person.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Lucas Novo",
          color: "#10B981",
        }),
      });

      const response = await handleUpdatePerson(request, person.id);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.name).toBe("Lucas Novo");
      expect(json.color).toBe("#10B981");
    });
  });

  describe("DELETE /api/people/:id", () => {
    it("should return 200 and remove the person", async () => {
      const person = await peopleRepo.create({
        userId,
        name: "Lucas",
        color: "#3B82F6",
      });

      const request = new Request(`http://localhost:8081/api/people/${person.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const response = await handleDeletePerson(request, person.id);
      expect(response.status).toBe(200);

      const remaining = await peopleRepo.findById(person.id, userId);
      expect(remaining).toBeNull();
    });
  });
});
