import { hashPassword, comparePassword } from "../utils/hash";
import { signToken, verifyToken } from "../utils/jwt";

describe("Auth Crypto & JWT Utilities (TDD)", () => {
  describe("Password Hashing", () => {
    it("should hash a password and verify it matches", async () => {
      const password = "mySecretPassword123";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(typeof hash).toBe("string");

      const isMatch = await comparePassword(password, hash);
      expect(isMatch).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const password = "correctPassword";
      const hash = await hashPassword(password);

      const isMatch = await comparePassword("wrongPassword", hash);
      expect(isMatch).toBe(false);
    });
  });

  describe("JWT Token Management", () => {
    const payload = {
      userId: "123e4567-e89b-12d3-a456-426614174000",
      email: "user@example.com",
    };

    it("should sign and verify a valid JWT token", () => {
      const token = signToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const verified = verifyToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.email).toBe(payload.email);
    });

    it("should return null for an invalid or tampered token", () => {
      const invalidToken = "invalid.token.here";
      const verified = verifyToken(invalidToken);
      expect(verified).toBeNull();
    });
  });
});
