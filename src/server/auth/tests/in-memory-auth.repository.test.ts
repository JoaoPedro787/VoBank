import { InMemoryAuthRepository } from "../repositories/in-memory-auth.repository";

describe("InMemoryAuthRepository", () => {
  let repo: InMemoryAuthRepository;

  beforeEach(() => {
    repo = new InMemoryAuthRepository();
  });

  it("should create and retrieve user by email and by id", async () => {
    const created = await repo.create({
      name: "João Silva",
      email: "joao@example.com",
      password: "hashedPassword123",
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe("João Silva");
    expect(created.email).toBe("joao@example.com");

    const foundByEmail = await repo.findByEmail("joao@example.com");
    expect(foundByEmail).not.toBeNull();
    expect(foundByEmail?.id).toBe(created.id);

    // Case-insensitive email check
    const foundCaseInsensitive = await repo.findByEmail("JOAO@EXAMPLE.COM");
    expect(foundCaseInsensitive).not.toBeNull();
    expect(foundCaseInsensitive?.id).toBe(created.id);

    const foundById = await repo.findById(created.id);
    expect(foundById).not.toBeNull();
    expect(foundById?.email).toBe("joao@example.com");
  });

  it("should return null when user is not found", async () => {
    expect(await repo.findByEmail("notfound@example.com")).toBeNull();
    expect(await repo.findById("non-existent-id")).toBeNull();
  });

  it("should clear all users", async () => {
    await repo.create({
      name: "User 1",
      email: "u1@example.com",
      password: "pwd",
    });
    expect(repo.getAll()).toHaveLength(1);

    repo.clear();
    expect(repo.getAll()).toHaveLength(0);
    expect(await repo.findByEmail("u1@example.com")).toBeNull();
  });
});
