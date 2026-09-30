import { PeopleService } from "../services/people.service";
import { InMemoryPeopleRepository } from "../repositories/in-memory-people.repository";
import { NotFoundError } from "../../shared/errors/app-error";

describe("PeopleService (In-Memory TDD)", () => {
  let peopleRepo: InMemoryPeopleRepository;
  let peopleService: PeopleService;
  const userId = "user-123";
  const otherUserId = "user-456";

  beforeEach(() => {
    peopleRepo = new InMemoryPeopleRepository();
    peopleService = new PeopleService(peopleRepo);
  });

  describe("createPerson", () => {
    it("should successfully create a person with name and hex color", async () => {
      const result = await peopleService.createPerson(userId, {
        name: "Lucas",
        color: "#3B82F6",
      });

      expect(result.id).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.name).toBe("Lucas");
      expect(result.color).toBe("#3B82F6");
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);

      // Verify in repository
      const saved = await peopleRepo.findById(result.id, userId);
      expect(saved).not.toBeNull();
      expect(saved?.name).toBe("Lucas");
    });

    it("should reject creation when name is empty", async () => {
      await expect(
        peopleService.createPerson(userId, {
          name: "  ",
          color: "#3B82F6",
        }),
      ).rejects.toThrow();
    });

    it("should reject creation when color is not a valid 6-digit hex", async () => {
      await expect(
        peopleService.createPerson(userId, {
          name: "Lucas",
          color: "invalid-color",
        }),
      ).rejects.toThrow();

      await expect(
        peopleService.createPerson(userId, {
          name: "Lucas",
          color: "#FFF",
        }),
      ).rejects.toThrow();
    });
  });

  describe("listPeople", () => {
    it("should list only people belonging to the authenticated user", async () => {
      await peopleRepo.create({
        userId,
        name: "Lucas",
        color: "#3B82F6",
      });
      await peopleRepo.create({
        userId,
        name: "Maria",
        color: "#EC4899",
      });
      await peopleRepo.create({
        userId: otherUserId,
        name: "Estranho",
        color: "#10B981",
      });

      const list = await peopleService.listPeople(userId);
      expect(list).toHaveLength(2);
      expect(list.map((p) => p.name)).toEqual(["Lucas", "Maria"]);
    });

    it("should return empty array when user has no people registered", async () => {
      const list = await peopleService.listPeople(userId);
      expect(list).toEqual([]);
    });
  });

  describe("getPerson", () => {
    it("should return the person when it belongs to user", async () => {
      const created = await peopleRepo.create({
        userId,
        name: "João",
        color: "#10B981",
      });

      const result = await peopleService.getPerson(created.id, userId);
      expect(result.id).toBe(created.id);
      expect(result.name).toBe("João");
    });

    it("should throw NotFoundError if person does not exist", async () => {
      await expect(peopleService.getPerson("non-existent-id", userId)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("should throw NotFoundError if person belongs to another user", async () => {
      const created = await peopleRepo.create({
        userId: otherUserId,
        name: "Alheio",
        color: "#10B981",
      });

      await expect(peopleService.getPerson(created.id, userId)).rejects.toThrow(NotFoundError);
    });
  });

  describe("updatePerson", () => {
    it("should update person name and color successfully", async () => {
      const created = await peopleRepo.create({
        userId,
        name: "Lucas",
        color: "#3B82F6",
      });

      const updated = await peopleService.updatePerson(created.id, userId, {
        name: "Lucas Fernandes",
        color: "#6366F1",
      });

      expect(updated.name).toBe("Lucas Fernandes");
      expect(updated.color).toBe("#6366F1");

      const inRepo = await peopleRepo.findById(created.id, userId);
      expect(inRepo?.name).toBe("Lucas Fernandes");
      expect(inRepo?.color).toBe("#6366F1");
    });

    it("should throw NotFoundError when updating non-existent person", async () => {
      await expect(
        peopleService.updatePerson("non-existent", userId, { name: "Novo" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when updating person of another user", async () => {
      const created = await peopleRepo.create({
        userId: otherUserId,
        name: "Outro",
        color: "#3B82F6",
      });

      await expect(
        peopleService.updatePerson(created.id, userId, { name: "Invasor" }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deletePerson", () => {
    it("should delete person successfully", async () => {
      const created = await peopleRepo.create({
        userId,
        name: "Lucas",
        color: "#3B82F6",
      });

      await peopleService.deletePerson(created.id, userId);

      const inRepo = await peopleRepo.findById(created.id, userId);
      expect(inRepo).toBeNull();
    });

    it("should throw NotFoundError when deleting non-existent person", async () => {
      await expect(peopleService.deletePerson("non-existent", userId)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("should throw NotFoundError when deleting person of another user", async () => {
      const created = await peopleRepo.create({
        userId: otherUserId,
        name: "Outro",
        color: "#3B82F6",
      });

      await expect(peopleService.deletePerson(created.id, userId)).rejects.toThrow(NotFoundError);
    });
  });
});
