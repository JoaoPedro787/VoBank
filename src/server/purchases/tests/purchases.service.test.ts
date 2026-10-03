import { PurchasesService } from "../services/purchases.service";
import { InMemoryPurchasesRepository } from "../repositories/in-memory-purchases.repository";
import { InMemoryCreditCardsRepository } from "../../credit-cards/repositories/in-memory-credit-cards.repository";
import { InMemoryPeopleRepository } from "../../people/repositories/in-memory-people.repository";
import { NotFoundError, BadRequestError } from "../../shared/errors/app-error";

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

  describe("updatePurchase", () => {
    it("should successfully update purchase description and purchaseDate with recalculated dates", async () => {
      const created = await purchasesService.createPurchase(userId, {
        description: "Compra Original",
        totalAmount: 300,
        purchaseDate: new Date(Date.UTC(2025, 2, 20)), // 20/03 -> before closing 25 -> due 05/04
        paymentMethod: "credit",
        creditCardId: sampleCardId,
        totalInstallments: 3,
      });

      // Update date to 28/03 (after closing 25) -> due 05/05
      const updated = await purchasesService.updatePurchase(created.id, userId, {
        description: "Compra com Nova Descrição",
        purchaseDate: new Date(Date.UTC(2025, 2, 28)),
      });

      expect(updated.description).toBe("Compra com Nova Descrição");
      expect(updated.installments).toHaveLength(3);
      expect(updated.installments[0].billingMonth).toBe(5);
      expect(updated.installments[0].billingYear).toBe(2025);
      expect(updated.installments[1].billingMonth).toBe(6);
      expect(updated.installments[2].billingMonth).toBe(7);
    });

    it("should apply the abono rule when reattributing purchase with already paid installments", async () => {
      // Cria compra parcelada em 3x dividida 100% com Lucas (samplePersonId)
      const created = await purchasesService.createPurchase(userId, {
        description: "Notebook Dividido",
        totalAmount: 600,
        purchaseDate: new Date(Date.UTC(2025, 2, 10)),
        paymentMethod: "credit",
        creditCardId: sampleCardId,
        totalInstallments: 3,
        splits: [{ personId: samplePersonId, percentage: 100 }],
      });

      // Cadastra uma nova pessoa para receber a reatribuição
      const newPerson = await peopleRepo.create({
        userId,
        name: "Mariana Souza",
        color: "#ec4899",
      });
      purchasesRepo.setPeople(peopleRepo.getAll());

      // Lucas quita a 1ª parcela (isPaid = true)
      const firstSplitId = created.installments[0].splits[0].id;
      await purchasesService.toggleSplitPaid(firstSplitId, userId, true);

      // Reatribui a compra integralmente (100%) para Mariana (newPerson)
      const updated = await purchasesService.updatePurchase(created.id, userId, {
        splits: [{ personId: newPerson.id, percentage: 100 }],
      });

      // Parcela 1: Abono aplicado! Mantém o pagamento original quitado por Lucas
      const inst1Splits = updated.installments[0].splits;
      expect(inst1Splits).toHaveLength(1);
      expect(inst1Splits[0].personId).toBe(samplePersonId);
      expect(inst1Splits[0].isPaid).toBe(true);
      expect(inst1Splits[0].paidAt).toBeInstanceOf(Date);
      expect(inst1Splits[0].amount).toBe("200");

      // Parcela 2: Atribuída para a nova pessoa (Mariana) em aberto
      const inst2Splits = updated.installments[1].splits;
      expect(inst2Splits).toHaveLength(1);
      expect(inst2Splits[0].personId).toBe(newPerson.id);
      expect(inst2Splits[0].isPaid).toBe(false);
      expect(inst2Splits[0].paidAt).toBeNull();
      expect(inst2Splits[0].amount).toBe("200");

      // Parcela 3: Atribuída para a nova pessoa (Mariana) em aberto
      const inst3Splits = updated.installments[2].splits;
      expect(inst3Splits).toHaveLength(1);
      expect(inst3Splits[0].personId).toBe(newPerson.id);
      expect(inst3Splits[0].isPaid).toBe(false);
      expect(inst3Splits[0].paidAt).toBeNull();
      expect(inst3Splits[0].amount).toBe("200");
    });

    it("should reject changing totalInstallments with BadRequestError", async () => {
      const created = await purchasesService.createPurchase(userId, {
        description: "Compra Teste",
        totalAmount: 100,
        purchaseDate: new Date(),
        paymentMethod: "credit",
        creditCardId: sampleCardId,
        totalInstallments: 2,
      });

      await expect(
        purchasesService.updatePurchase(created.id, userId, {
          totalInstallments: 5,
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should reject changing paymentMethod with BadRequestError", async () => {
      const created = await purchasesService.createPurchase(userId, {
        description: "Compra Teste",
        totalAmount: 100,
        purchaseDate: new Date(),
        paymentMethod: "credit",
        creditCardId: sampleCardId,
        totalInstallments: 1,
      });

      await expect(
        purchasesService.updatePurchase(created.id, userId, {
          paymentMethod: "cash",
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should reject changing totalAmount with BadRequestError", async () => {
      const created = await purchasesService.createPurchase(userId, {
        description: "Compra Teste",
        totalAmount: 100,
        purchaseDate: new Date(),
        paymentMethod: "cash",
        totalInstallments: 1,
      });

      await expect(
        purchasesService.updatePurchase(created.id, userId, {
          totalAmount: 250,
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should reject changing creditCardId with BadRequestError", async () => {
      const anotherCard = await cardsRepo.create({
        userId,
        name: "Inter",
        flag: "Mastercard",
        color: "#ff7a00",
        closingDay: 15,
        dueDay: 25,
      });
      purchasesRepo.setCards(cardsRepo.getAll());

      const created = await purchasesService.createPurchase(userId, {
        description: "Compra Cartão",
        totalAmount: 100,
        purchaseDate: new Date(),
        paymentMethod: "credit",
        creditCardId: sampleCardId,
        totalInstallments: 1,
      });

      await expect(
        purchasesService.updatePurchase(created.id, userId, {
          creditCardId: anotherCard.id,
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should accept invariant structural fields when sent with unchanged values", async () => {
      const created = await purchasesService.createPurchase(userId, {
        description: "Compra Teste",
        totalAmount: 100,
        purchaseDate: new Date(),
        paymentMethod: "credit",
        creditCardId: sampleCardId,
        totalInstallments: 2,
      });

      const updated = await purchasesService.updatePurchase(created.id, userId, {
        description: "Nova Descrição",
        totalAmount: 100,
        paymentMethod: "credit",
        creditCardId: sampleCardId,
        totalInstallments: 2,
      });

      expect(updated.description).toBe("Nova Descrição");
    });

    it("should throw NotFoundError if purchase does not exist or belongs to another user", async () => {
      await expect(
        purchasesService.updatePurchase("00000000-0000-4000-a000-000000000000", userId, {
          description: "Inexistente",
        }),
      ).rejects.toThrow(NotFoundError);

      const created = await purchasesService.createPurchase(userId, {
        description: "Minha Compra",
        totalAmount: 50,
        purchaseDate: new Date(),
        paymentMethod: "cash",
      });

      await expect(
        purchasesService.updatePurchase(created.id, otherUserId, {
          description: "Tentativa Outro Usuário",
        }),
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
