import { testConnection, client } from "../db";

describe("Database Connection", () => {
  afterAll(async () => {
    await client.end();
  });

  it("should successfully connect to the local PostgreSQL database", async () => {
    const isConnected = await testConnection();
    expect(isConnected).toBe(true);
  });
});
