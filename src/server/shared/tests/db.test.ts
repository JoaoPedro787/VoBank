import { testConnection, client } from "../db";

describe("Database Connection", () => {
  afterAll(async () => {
    try {
      await client.end({ timeout: 1 });
    } catch {
      // ignore
    }
  });

  it("should return boolean status for database connection helper", async () => {
    const isConnected = await testConnection();
    expect(typeof isConnected).toBe("boolean");
  });
});
