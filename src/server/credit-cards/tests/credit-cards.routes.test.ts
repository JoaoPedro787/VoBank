import { CreditCardsService } from "../services/credit-cards.service";
import { InMemoryCreditCardsRepository } from "../repositories/in-memory-credit-cards.repository";
import { requireAuth } from "../../auth/middleware/auth.middleware";
import { apiSuccess, handleApiError } from "../../shared/utils/api-response";
import { signToken } from "../../auth/utils/jwt";

describe("Credit Cards Route Components (In-Memory TDD)", () => {
  let cardsRepo: InMemoryCreditCardsRepository;
  let cardsService: CreditCardsService;
  const userId = "user-123";
  let token: string;

  const handleListCards = async (req: Request): Promise<Response> => {
    try {
      const authUser = requireAuth(req);
      const result = await cardsService.listCards(authUser.userId);
      return apiSuccess(result, 200);
    } catch (error) {
      return handleApiError(error);
    }
  };

  const handleCreateCard = async (req: Request): Promise<Response> => {
    try {
      const authUser = requireAuth(req);
      const body = await req.json();
      const result = await cardsService.createCard(authUser.userId, body);
      return apiSuccess(result, 201);
    } catch (error) {
      return handleApiError(error);
    }
  };

  const handleGetCard = async (req: Request, id: string): Promise<Response> => {
    try {
      const authUser = requireAuth(req);
      const result = await cardsService.getCard(id, authUser.userId);
      return apiSuccess(result, 200);
    } catch (error) {
      return handleApiError(error);
    }
  };

  const handleUpdateCard = async (req: Request, id: string): Promise<Response> => {
    try {
      const authUser = requireAuth(req);
      const body = await req.json();
      const result = await cardsService.updateCard(id, authUser.userId, body);
      return apiSuccess(result, 200);
    } catch (error) {
      return handleApiError(error);
    }
  };

  const handleDeleteCard = async (req: Request, id: string): Promise<Response> => {
    try {
      const authUser = requireAuth(req);
      await cardsService.deleteCard(id, authUser.userId);
      return apiSuccess({ message: "Cartão removido com sucesso" }, 200);
    } catch (error) {
      return handleApiError(error);
    }
  };

  beforeEach(() => {
    cardsRepo = new InMemoryCreditCardsRepository();
    cardsService = new CreditCardsService(cardsRepo);
    token = signToken({ userId, email: "user@example.com" });
  });

  describe("GET /api/cards", () => {
    it("should return 200 with user's credit cards", async () => {
      await cardsRepo.create({
        userId,
        name: "Nubank",
        color: "#8A05BE",
        closingDay: 25,
        dueDay: 5,
      });

      const request = new Request("http://localhost:8081/api/cards", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const response = await handleListCards(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(Array.isArray(json)).toBe(true);
      expect(json).toHaveLength(1);
      expect(json[0].name).toBe("Nubank");
    });

    it("should return 401 when token is missing", async () => {
      const request = new Request("http://localhost:8081/api/cards", {
        method: "GET",
      });

      const response = await handleListCards(request);
      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/cards", () => {
    it("should return 201 with created card", async () => {
      const request = new Request("http://localhost:8081/api/cards", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Nubank",
          flag: "Mastercard",
          color: "#8A05BE",
          closingDay: 25,
          dueDay: 5,
          limit: 4000,
        }),
      });

      const response = await handleCreateCard(request);
      expect(response.status).toBe(201);

      const json = await response.json();
      expect(json.id).toBeDefined();
      expect(json.name).toBe("Nubank");
      expect(json.closingDay).toBe(25);
      expect(json.dueDay).toBe(5);
    });

    it("should return 400 when closingDay or dueDay is invalid", async () => {
      const request = new Request("http://localhost:8081/api/cards", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Nubank",
          color: "#8A05BE",
          closingDay: 35,
          dueDay: 5,
        }),
      });

      const response = await handleCreateCard(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toBe("Dados de requisição inválidos");
    });
  });

  describe("GET /api/cards/:id", () => {
    it("should return 200 with card details", async () => {
      const card = await cardsRepo.create({
        userId,
        name: "Nubank",
        color: "#8A05BE",
        closingDay: 25,
        dueDay: 5,
      });

      const request = new Request(`http://localhost:8081/api/cards/${card.id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const response = await handleGetCard(request, card.id);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.id).toBe(card.id);
      expect(json.name).toBe("Nubank");
    });

    it("should return 404 when card not found", async () => {
      const request = new Request("http://localhost:8081/api/cards/non-existent-id", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const response = await handleGetCard(request, "non-existent-id");
      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/cards/:id", () => {
    it("should return 200 with updated card", async () => {
      const card = await cardsRepo.create({
        userId,
        name: "Nubank",
        color: "#8A05BE",
        closingDay: 25,
        dueDay: 5,
      });

      const request = new Request(`http://localhost:8081/api/cards/${card.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Nubank Black",
          limit: 10000,
        }),
      });

      const response = await handleUpdateCard(request, card.id);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.name).toBe("Nubank Black");
      expect(json.limit).toBe("10000");
    });
  });

  describe("DELETE /api/cards/:id", () => {
    it("should return 200 and remove the card", async () => {
      const card = await cardsRepo.create({
        userId,
        name: "Nubank",
        color: "#8A05BE",
        closingDay: 25,
        dueDay: 5,
      });

      const request = new Request(`http://localhost:8081/api/cards/${card.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const response = await handleDeleteCard(request, card.id);
      expect(response.status).toBe(200);

      const inRepo = await cardsRepo.findById(card.id, userId);
      expect(inRepo).toBeNull();
    });
  });
});
