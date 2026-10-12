import { CreditCardsService } from "../services/credit-cards.service";
import { InMemoryCreditCardsRepository } from "../repositories/in-memory-credit-cards.repository";
import { NotFoundError } from "../../shared/errors/app-error";

describe("CreditCardsService (In-Memory TDD)", () => {
  let cardsRepo: InMemoryCreditCardsRepository;
  let cardsService: CreditCardsService;
  const userId = "user-123";
  const otherUserId = "user-456";

  beforeEach(() => {
    cardsRepo = new InMemoryCreditCardsRepository();
    cardsService = new CreditCardsService(cardsRepo);
  });

  describe("createCard", () => {
    it("should create a credit card with valid data", async () => {
      const result = await cardsService.createCard(userId, {
        name: "Nubank Ultravioleta",
        flag: "Mastercard",
        color: "#8A05BE",
        closingDay: 25,
        dueDay: 5,
        limit: 5000,
      });

      expect(result.id).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.name).toBe("Nubank Ultravioleta");
      expect(result.flag).toBe("Mastercard");
      expect(result.color).toBe("#8A05BE");
      expect(result.closingDay).toBe(25);
      expect(result.dueDay).toBe(5);
      expect(result.limit).toBe("5000");

      const saved = await cardsRepo.findById(result.id, userId);
      expect(saved).not.toBeNull();
      expect(saved?.name).toBe("Nubank Ultravioleta");
    });

    it("should set default flag to 'Outro' when not provided", async () => {
      const result = await cardsService.createCard(userId, {
        name: "Cartão Loja",
        color: "#000000",
        closingDay: 10,
        dueDay: 20,
      });

      expect(result.flag).toBe("Outro");
    });

    it("should reject card with closingDay greater than 31", async () => {
      await expect(
        cardsService.createCard(userId, {
          name: "Invalid Day",
          color: "#8A05BE",
          closingDay: 32,
          dueDay: 5,
        }),
      ).rejects.toThrow();
    });

    it("should reject card with dueDay less than 1", async () => {
      await expect(
        cardsService.createCard(userId, {
          name: "Invalid Day",
          color: "#8A05BE",
          closingDay: 15,
          dueDay: 0,
        }),
      ).rejects.toThrow();
    });

    it("should reject invalid color format", async () => {
      await expect(
        cardsService.createCard(userId, {
          name: "Invalid Color",
          color: "purple",
          closingDay: 15,
          dueDay: 25,
        }),
      ).rejects.toThrow();
    });
  });

  describe("listCards", () => {
    it("should list cards only belonging to the authenticated user", async () => {
      await cardsRepo.create({
        userId,
        name: "Nubank",
        color: "#8A05BE",
        closingDay: 25,
        dueDay: 5,
      });
      await cardsRepo.create({
        userId,
        name: "Inter",
        color: "#FF7A00",
        closingDay: 10,
        dueDay: 18,
      });
      await cardsRepo.create({
        userId: otherUserId,
        name: "Alheio",
        color: "#000000",
        closingDay: 1,
        dueDay: 10,
      });

      const list = await cardsService.listCards(userId);
      expect(list).toHaveLength(2);
      expect(list.map((c) => c.name)).toEqual(["Nubank", "Inter"]);
    });

    it("should return empty array when user has no cards", async () => {
      const list = await cardsService.listCards(userId);
      expect(list).toEqual([]);
    });
  });

  describe("getCard", () => {
    it("should return card by id when belonging to user", async () => {
      const created = await cardsRepo.create({
        userId,
        name: "C6 Bank",
        color: "#242424",
        closingDay: 12,
        dueDay: 20,
      });

      const result = await cardsService.getCard(created.id, userId);
      expect(result.id).toBe(created.id);
      expect(result.name).toBe("C6 Bank");
    });

    it("should throw NotFoundError if card does not exist", async () => {
      await expect(cardsService.getCard("non-existent", userId)).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError if card belongs to another user", async () => {
      const created = await cardsRepo.create({
        userId: otherUserId,
        name: "Alheio",
        color: "#242424",
        closingDay: 12,
        dueDay: 20,
      });

      await expect(cardsService.getCard(created.id, userId)).rejects.toThrow(NotFoundError);
    });
  });

  describe("updateCard", () => {
    it("should update card details successfully", async () => {
      const created = await cardsRepo.create({
        userId,
        name: "Nubank",
        color: "#8A05BE",
        closingDay: 25,
        dueDay: 5,
        limit: "3000",
      });

      const updated = await cardsService.updateCard(created.id, userId, {
        name: "Nubank Platinum",
        closingDay: 28,
        limit: 7500,
      });

      expect(updated.name).toBe("Nubank Platinum");
      expect(updated.closingDay).toBe(28);
      expect(updated.limit).toBe("7500");

      const inRepo = await cardsRepo.findById(created.id, userId);
      expect(inRepo?.name).toBe("Nubank Platinum");
      expect(inRepo?.limit).toBe("7500");
    });

    it("should throw NotFoundError when updating non-existent card", async () => {
      await expect(
        cardsService.updateCard("non-existent", userId, { name: "Novo" }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteCard", () => {
    it("should delete card successfully", async () => {
      const created = await cardsRepo.create({
        userId,
        name: "Nubank",
        color: "#8A05BE",
        closingDay: 25,
        dueDay: 5,
      });

      await cardsService.deleteCard(created.id, userId);

      const inRepo = await cardsRepo.findById(created.id, userId);
      expect(inRepo).toBeNull();
    });

    it("should throw NotFoundError when deleting non-existent card", async () => {
      await expect(cardsService.deleteCard("non-existent", userId)).rejects.toThrow(NotFoundError);
    });
  });
});
