import { peopleApiService } from "../services/people-api.service";

describe("peopleApiService", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should list people successfully", async () => {
    const mockPeople = [
      { id: "1", name: "Lucas", color: "#3B82F6", userId: "u1" },
      { id: "2", name: "Maria", color: "#EC4899", userId: "u1" },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPeople,
    } as Response);

    const result = await peopleApiService.list("fake-token");
    expect(result).toEqual(mockPeople);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/people"),
      expect.objectContaining({
        headers: { Authorization: "Bearer fake-token" },
      }),
    );
  });

  it("should create a person successfully", async () => {
    const newPerson = { id: "1", name: "Lucas", color: "#3B82F6", userId: "u1" };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => newPerson,
    } as Response);

    const result = await peopleApiService.create("fake-token", {
      name: "Lucas",
      color: "#3B82F6",
    });

    expect(result).toEqual(newPerson);
  });

  it("should throw error when create fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Erro ao criar pessoa" }),
    } as Response);

    await expect(
      peopleApiService.create("fake-token", { name: "", color: "#3B82F6" }),
    ).rejects.toThrow("Erro ao criar pessoa");
  });

  it("should update a person successfully", async () => {
    const updated = { id: "1", name: "Lucas Fernandes", color: "#3B82F6", userId: "u1" };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => updated,
    } as Response);

    const result = await peopleApiService.update("fake-token", "1", {
      name: "Lucas Fernandes",
    });

    expect(result).toEqual(updated);
  });

  it("should delete a person successfully", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Pessoa removida com sucesso" }),
    } as Response);

    await expect(peopleApiService.delete("fake-token", "1")).resolves.toBeUndefined();
  });
});
