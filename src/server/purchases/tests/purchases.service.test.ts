import { PurchasesService } from "../services/purchases.service";
import { InMemoryPurchasesRepository } from "../repositories/in-memory-purchases.repository";
import { InMemoryCreditCardsRepository } from "../../credit-cards/repositories/in-memory-credit-cards.repository";
import { InMemoryPeopleRepository } from "../../people/repositories/in-memory-people.repository";
import { NotFoundError } from "../../shared/errors/app-error";

describe("PurchasesService (Isolated In-Memory Unit Tests)", () => {
  let purchasesRepo: InMemoryPurchasesRepository;
  let cardsRepo: InMemoryCreditCardsRepository;
  let peopleRepo: InMemoryPeopleRepository;
  let purchasesService: PurchasesService;

  const userId = "11111111-1111-4111-a111-111111111111";
  const otherUserId = "22222222-2222-4222-a222-222222222222";
  let sampleCardId: string;
  let samplePersonId: string;

  beforeEach(async () => {
    purchasesRepo = new InMemoryPurchasesRepository();
    cardsRepo = new InMemoryCreditCardsRepository();
    peopleRepo = new InMemoryPeopleRepository();

    // Create a card for user
    const card = await cardsRepo.create({
      userId,
      name: "Nubank",
      flag: "Mastercard",
      color: "#820ad1",
      closingDay: 25,
      dueDay: 5,
    });
    sampleCardId = card.id;

    // Create a person for user
    const person = await peopleRepo.create({
      userId,
      name: "Lucas Silva",
      color: "#3b82f6",
    });
    samplePersonId = person.id;

    // Conectar os repositórios em memória para relações
    purchasesRepo.setCards(cardsRepo.getAll());
    purchasesRepo.setPeople(peopleRepo.getAll());

    purchasesService = new PurchasesService(purchasesRepo, cardsRepo, peopleRepo);
  });

  describe("createPurchase", () => {
    it("should successfully create a cash purchase without card", async () => {
      const result = await purchasesService.createPurchase(userId, {
        description: "Almoço Executivo",
        totalAmount: 45,
        purchaseDate: new Date(Date.UTC(2025, 4, 10)),
        paymentMethod: "cash",
        totalInstallments: 1,
      });

      expect(result.id).toBeDefined();
      expect(result.description).toBe("Almoço Executivo");
      expect(result.totalAmount).toBe("45");
      expect(result.paymentMethod).toBe("cash");
      expect(result.installments).toHaveLength(1);
      expect(result.installments[0].amount).toBe("45");
      expect(result.installments[0].splits).toHaveLength(1);
      expect(result.installments[0].splits[0].personId).toBeNull();
    });

    it("should successfully create a debit purchase", async () => {
      const result = await purchasesService.createPurchase(userId, {
        description: "Gasolina",
        totalAmount: 150,
        purchaseDate: new Date(Date.UTC(2025, 4, 10)),
        paymentMethod: "debit",
        totalInstallments: 1,
      });

      expect(result.paymentMethod).toBe("debit");
      expect(result.installments).toHaveLength(1);
    });

    it("should create a credit purchase in 3 installments and split 50/50 with a person", async () => {
      const result = await purchasesService.createPurchase(userId, {
        description: "Supermercado Mensal",
        totalAmount: 600,
        purchaseDate: new Date(Date.UTC(2025, 2, 20)), // 20/03 -> before closing 25 -> due 05/04
        paymentMethod: "credit",
        creditCardId: sampleCardId,
        totalInstallments: 3,
        splits: [
          { personId: null, percentage: 50 },
          { personId: samplePersonId, percentage: 50 },
        ],
      });

      expect(result.creditCardId).toBe(sampleCardId);
      expect(result.installments).toHaveLength(3);

      // Verify installment amounts and due dates
      expect(result.installments[0].amount).toBe("200");
      expect(result.installments[0].billingMonth).toBe(4);
      expect(result.installments[0].billingYear).toBe(2025);

      expect(result.installments[1].amount).toBe("200");
      expect(result.installments[1].billingMonth).toBe(5);

      expect(result.installments[2].amount).toBe("200");
      expect(result.installments[2].billingMonth).toBe(6);

      // Verify splits in each installment
      result.installments.forEach((inst) => {
        expect(inst.splits).toHaveLength(2);

        const ownerSplit = inst.splits.find((s) => s.personId === null);
        const personSplit = inst.splits.find((s) => s.personId === samplePersonId);

        expect(ownerSplit?.amount).toBe("100");
        expect(personSplit?.amount).toBe("100");
        expect(ownerSplit?.isPaid).toBe(false);
        expect(personSplit?.isPaid).toBe(false);
      });
    });

    it("should reject credit purchase when card does not exist or belongs to another user", async () => {
      const nonexistentCardId = "99999999-9999-4999-a999-999999999999";

      await expect(
        purchasesService.createPurchase(userId, {
          description: "Teste",
          totalAmount: 100,
          purchaseDate: new Date(),
          paymentMethod: "credit",
          creditCardId: nonexistentCardId,
          totalInstallments: 1,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should reject split with a person belonging to another user", async () => {
      const otherPersonId = "88888888-8888-4888-a888-888888888888";

      await expect(
        purchasesService.createPurchase(userId, {
          description: "Teste",
          totalAmount: 100,
          purchaseDate: new Date(),
          paymentMethod: "cash",
          totalInstallments: 1,
          splits: [{ personId: otherPersonId, percentage: 50 }],
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("listPurchases and getPurchase", () => {
    it("should list only purchases belonging to the user", async () => {
      await purchasesService.createPurchase(userId, {
        description: "Compra 1",
        totalAmount: 100,
        purchaseDate: new Date(),
        paymentMethod: "cash",
      });

      await purchasesService.createPurchase(otherUserId, {
        description: "Compra de Outro",
        totalAmount: 200,
        purchaseDate: new Date(),
        paymentMethod: "cash",
      });

      const userPurchases = await purchasesService.listPurchases(userId);
      expect(userPurchases).toHaveLength(1);
      expect(userPurchases[0].description).toBe("Compra 1");
    });

    it("should retrieve a single purchase by id", async () => {
      const created = await purchasesService.createPurchase(userId, {
        description: "Compra Específica",
        totalAmount: 75,
        purchaseDate: new Date(),
        paymentMethod: "cash",
      });

      const found = await purchasesService.getPurchase(created.id, userId);
      expect(found.id).toBe(created.id);
      expect(found.description).toBe("Compra Específica");
    });

    it("should throw NotFoundError if purchase does not exist", async () => {
      await expect(
        purchasesService.getPurchase("00000000-0000-4000-a000-000000000000", userId),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("toggleSplitPaid", () => {
    it("should toggle installment split isPaid to true with paidAt timestamp", async () => {
      const purchase = await purchasesService.createPurchase(userId, {
        description: "Jantar",
        totalAmount: 200,
        purchaseDate: new Date(),
        paymentMethod: "cash",
        totalInstallments: 1,
        splits: [
          { personId: null, percentage: 50 },
          { personId: samplePersonId, percentage: 50 },
        ],
      });

      const friendSplit = purchase.installments[0].splits.find(
        (s) => s.personId === samplePersonId,
      );
      expect(friendSplit).toBeDefined();
      expect(friendSplit!.isPaid).toBe(false);

      const updated = await purchasesService.toggleSplitPaid(friendSplit!.id, userId, true);
      expect(updated.isPaid).toBe(true);
      expect(updated.paidAt).toBeInstanceOf(Date);

      // Toggle back to false
      const toggledOff = await purchasesService.toggleSplitPaid(friendSplit!.id, userId, false);
      expect(toggledOff.isPaid).toBe(false);
      expect(toggledOff.paidAt).toBeNull();
    });

    it("should throw NotFoundError if splitId does not belong to user purchase", async () => {
      await expect(
        purchasesService.toggleSplitPaid("00000000-0000-4000-a000-000000000000", userId, true),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deletePurchase", () => {
    it("should delete purchase and cascade remove installments and splits", async () => {
      const created = await purchasesService.createPurchase(userId, {
        description: "Para deletar",
        totalAmount: 50,
        purchaseDate: new Date(),
        paymentMethod: "cash",
      });

      await purchasesService.deletePurchase(created.id, userId);

      await expect(purchasesService.getPurchase(created.id, userId)).rejects.toThrow(NotFoundError);
    });
  });
});
