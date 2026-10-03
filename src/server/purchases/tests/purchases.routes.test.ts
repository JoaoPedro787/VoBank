import { PurchasesService } from "../services/purchases.service";
import { InMemoryPurchasesRepository } from "../repositories/in-memory-purchases.repository";
import { InMemoryCreditCardsRepository } from "../../credit-cards/repositories/in-memory-credit-cards.repository";
import { InMemoryPeopleRepository } from "../../people/repositories/in-memory-people.repository";
import { requireAuth } from "../../auth/middleware/auth.middleware";
import { toggleInstallmentSplitPaidSchema } from "../schemas/purchases.schema";
import { PurchaseWithRelations } from "../repositories/purchases.repository.interface";
import { apiSuccess, handleApiError } from "../../shared/utils/api-response";
import { signToken } from "../../auth/utils/jwt";

describe("Purchases Route Handlers (Isolated In-Memory TDD)", () => {
  let purchasesRepo: InMemoryPurchasesRepository;
  let cardsRepo: InMemoryCreditCardsRepository;
  let peopleRepo: InMemoryPeopleRepository;
  let purchasesService: PurchasesService;
  const userId = "11111111-1111-4111-a111-111111111111";
  let token: string;
  let cardId: string;
  let personId: string;

  const handleListPurchases = async (req: Request): Promise<Response> => {
    try {
      const authUser = requireAuth(req);
      const result = await purchasesService.listPurchases(authUser.userId);
      return apiSuccess(result, 200);
    } catch (error) {
      return handleApiError(error);
    }
  };

  const handleCreatePurchase = async (req: Request): Promise<Response> => {
    try {
      const authUser = requireAuth(req);
      const body = await req.json();
      const result = await purchasesService.createPurchase(authUser.userId, body);
      return apiSuccess(result, 201);
    } catch (error) {
      return handleApiError(error);
    }
  };

  const handleGetPurchase = async (req: Request, id: string): Promise<Response> => {
    try {
      const authUser = requireAuth(req);
      const result = await purchasesService.getPurchase(id, authUser.userId);
      return apiSuccess(result, 200);
    } catch (error) {
      return handleApiError(error);
    }
  };

  const handleDeletePurchase = async (req: Request, id: string): Promise<Response> => {
    try {
      const authUser = requireAuth(req);
      await purchasesService.deletePurchase(id, authUser.userId);
      return apiSuccess({ message: "Compra excluída com sucesso" }, 200);
    } catch (error) {
      return handleApiError(error);
    }
  };

  const handleUpdatePurchase = async (req: Request, id: string): Promise<Response> => {
    try {
      const authUser = requireAuth(req);
      const body = await req.json();
      const result = await purchasesService.updatePurchase(id, authUser.userId, body);
      return apiSuccess(result, 200);
    } catch (error) {
      return handleApiError(error);
    }
  };

  const handleToggleSplitPaid = async (req: Request, splitId: string): Promise<Response> => {
    try {
      const authUser = requireAuth(req);
      const body = await req.json();
      const validated = toggleInstallmentSplitPaidSchema.parse(body);
      const result = await purchasesService.toggleSplitPaid(
        splitId,
        authUser.userId,
        validated.isPaid,
      );
      return apiSuccess(result, 200);
    } catch (error) {
      return handleApiError(error);
    }
  };

  beforeEach(async () => {
    purchasesRepo = new InMemoryPurchasesRepository();
    cardsRepo = new InMemoryCreditCardsRepository();
    peopleRepo = new InMemoryPeopleRepository();

    const card = await cardsRepo.create({
      userId,
      name: "Nubank",
      flag: "Mastercard",
      color: "#820ad1",
      closingDay: 25,
      dueDay: 5,
    });
    cardId = card.id;

    const person = await peopleRepo.create({
      userId,
      name: "Ana",
      color: "#ec4899",
    });
    personId = person.id;

    purchasesRepo.setCards(cardsRepo.getAll());
    purchasesRepo.setPeople(peopleRepo.getAll());

    purchasesService = new PurchasesService(purchasesRepo, cardsRepo, peopleRepo);

    token = signToken({
      userId,
      email: "user@example.com",
    });
  });

  describe("POST /api/purchases", () => {
    it("should return 401 when Authorization header is missing", async () => {
      const req = new Request("http://localhost:8081/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: "Jantar",
          totalAmount: 100,
          purchaseDate: new Date(),
          paymentMethod: "cash",
        }),
      });

      const res = await handleCreatePurchase(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBeDefined();
    });

    it("should return 201 and created purchase with installments and splits", async () => {
      const req = new Request("http://localhost:8081/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: "Smartphone",
          totalAmount: 1200,
          purchaseDate: new Date(Date.UTC(2025, 2, 10)),
          paymentMethod: "credit",
          creditCardId: cardId,
          totalInstallments: 3,
          splits: [
            { personId: null, percentage: 50 },
            { personId, percentage: 50 },
          ],
        }),
      });

      const res = await handleCreatePurchase(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.description).toBe("Smartphone");
      expect(json.installments).toHaveLength(3);
    });

    it("should return 400 when credit purchase lacks creditCardId", async () => {
      const req = new Request("http://localhost:8081/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: "Smartphone",
          totalAmount: 1200,
          purchaseDate: new Date(),
          paymentMethod: "credit",
          totalInstallments: 3,
        }),
      });

      const res = await handleCreatePurchase(req);
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/purchases and /api/purchases/:id", () => {
    it("should list all purchases for user", async () => {
      await purchasesService.createPurchase(userId, {
        description: "Cinema",
        totalAmount: 60,
        purchaseDate: new Date(),
        paymentMethod: "cash",
      });

      const req = new Request("http://localhost:8081/api/purchases", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await handleListPurchases(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(Array.isArray(json)).toBe(true);
      expect(json).toHaveLength(1);
      expect(json[0].description).toBe("Cinema");
    });

    it("should return single purchase", async () => {
      const created = await purchasesService.createPurchase(userId, {
        description: "Farmácia",
        totalAmount: 80,
        purchaseDate: new Date(),
        paymentMethod: "cash",
      });

      const req = new Request(`http://localhost:8081/api/purchases/${created.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await handleGetPurchase(req, created.id);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.description).toBe("Farmácia");
    });

    it("should return 404 for non-existent purchase", async () => {
      const req = new Request("http://localhost:8081/api/purchases/invalid-id", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await handleGetPurchase(req, "invalid-id");
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/installments/:id/toggle-paid", () => {
    it("should toggle installment split isPaid status", async () => {
      const created = await purchasesService.createPurchase(userId, {
        description: "Aluguel",
        totalAmount: 1000,
        purchaseDate: new Date(),
        paymentMethod: "cash",
        splits: [
          { personId: null, percentage: 50 },
          { personId, percentage: 50 },
        ],
      });

      const splitId = created.installments[0].splits.find((s) => s.personId === personId)!.id;

      const req = new Request(`http://localhost:8081/api/installments/${splitId}/toggle-paid`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPaid: true }),
      });

      const res = await handleToggleSplitPaid(req, splitId);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.isPaid).toBe(true);
      expect(json.paidAt).toBeDefined();
    });

    it("should return 400 when isPaid is missing from payload", async () => {
      const req = new Request("http://localhost:8081/api/installments/split-1/toggle-paid", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const res = await handleToggleSplitPaid(req, "split-1");
      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/purchases/:id", () => {
    it("should return 401 when Authorization header is missing", async () => {
      const req = new Request("http://localhost:8081/api/purchases/some-id", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "Nova descrição" }),
      });

      const res = await handleUpdatePurchase(req, "some-id");
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBeDefined();
    });

    it("should return 404 for non-existent purchase", async () => {
      const req = new Request("http://localhost:8081/api/purchases/invalid-id", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description: "Atualizado" }),
      });

      const res = await handleUpdatePurchase(req, "invalid-id");
      expect(res.status).toBe(404);
    });

    it("should update description and purchase date successfully", async () => {
      const created = await purchasesService.createPurchase(userId, {
        description: "Mercado Antigo",
        totalAmount: 150,
        purchaseDate: new Date("2026-03-01T10:00:00Z"),
        paymentMethod: "cash",
      });

      const req = new Request(`http://localhost:8081/api/purchases/${created.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: "Mercado Novo",
          purchaseDate: new Date("2026-03-05T15:00:00Z"),
        }),
      });

      const res = await handleUpdatePurchase(req, created.id);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.description).toBe("Mercado Novo");
      expect(new Date(json.purchaseDate).toISOString()).toBe(
        new Date("2026-03-05T15:00:00Z").toISOString(),
      );
    });

    it("should return 400 when attempting to change structural fields", async () => {
      const created = await purchasesService.createPurchase(userId, {
        description: "Compra Cartão",
        totalAmount: 300,
        purchaseDate: new Date("2026-03-10T12:00:00Z"),
        paymentMethod: "credit",
        creditCardId: cardId,
        totalInstallments: 3,
      });

      // Tentativa de alterar totalInstallments
      const req = new Request(`http://localhost:8081/api/purchases/${created.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          totalInstallments: 6,
        }),
      });

      const res = await handleUpdatePurchase(req, created.id);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/parcelas/i);
    });

    it("should apply abono rule when updating splits on partially paid purchase", async () => {
      const otherPerson = await peopleRepo.create({
        userId,
        name: "Carlos",
        color: "#10b981",
      });
      purchasesRepo.setPeople(peopleRepo.getAll());

      const created = await purchasesService.createPurchase(userId, {
        description: "Jantar Especial",
        totalAmount: 200,
        purchaseDate: new Date("2026-03-10T12:00:00Z"),
        paymentMethod: "credit",
        creditCardId: cardId,
        totalInstallments: 2,
        splits: [
          { personId: null, percentage: 50 },
          { personId, percentage: 50 },
        ],
      });

      // Pagar a parcela 1 de Ana
      const inst1SplitAna = created.installments[0].splits.find((s) => s.personId === personId)!;
      await purchasesService.toggleSplitPaid(inst1SplitAna.id, userId, true);

      // Reatribuir a compra para Carlos (50% Carlos, 50% Titular)
      const req = new Request(`http://localhost:8081/api/purchases/${created.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          splits: [
            { personId: null, percentage: 50 },
            { personId: otherPerson.id, percentage: 50 },
          ],
        }),
      });

      const res = await handleUpdatePurchase(req, created.id);
      expect(res.status).toBe(200);
      const json = (await res.json()) as PurchaseWithRelations;

      // Parcela 1 teve split pago por Ana -> preservada pelo abono
      const inst1 = json.installments.find((i) => i.installmentNumber === 1);
      expect(inst1?.splits.some((s) => s.personId === personId && s.isPaid === true)).toBe(true);

      // Parcela 2 estava aberta -> transferida para Carlos
      const inst2 = json.installments.find((i) => i.installmentNumber === 2);
      expect(inst2?.splits.some((s) => s.personId === otherPerson.id && s.isPaid === false)).toBe(
        true,
      );
    });
  });

  describe("DELETE /api/purchases/:id", () => {
    it("should delete purchase and return 200", async () => {
      const created = await purchasesService.createPurchase(userId, {
        description: "Para deletar",
        totalAmount: 30,
        purchaseDate: new Date(),
        paymentMethod: "cash",
      });

      const req = new Request(`http://localhost:8081/api/purchases/${created.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await handleDeletePurchase(req, created.id);
      expect(res.status).toBe(200);

      const checkReq = new Request(`http://localhost:8081/api/purchases/${created.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const checkRes = await handleGetPurchase(checkReq, created.id);
      expect(checkRes.status).toBe(404);
    });
  });
});
