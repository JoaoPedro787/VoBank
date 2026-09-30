import { getAuthUser, requireAuth } from "../middleware/auth.middleware";
import { signToken } from "../utils/jwt";
import { UnauthorizedError } from "../../shared/errors/app-error";

describe("Auth Middleware (TDD Unit Tests)", () => {
  const validPayload = { userId: "user-123", email: "user@example.com" };
  let validToken: string;

  beforeAll(() => {
    validToken = signToken(validPayload);
  });

  describe("getAuthUser", () => {
    it("should return null when Authorization header is missing", () => {
      const request = new Request("http://localhost:8081/test");
      expect(getAuthUser(request)).toBeNull();
    });

    it("should return null when header does not start with Bearer", () => {
      const request = new Request("http://localhost:8081/test", {
        headers: { Authorization: `Basic ${validToken}` },
      });
      expect(getAuthUser(request)).toBeNull();
    });

    it("should return null when Bearer token is empty", () => {
      const request = new Request("http://localhost:8081/test", {
        headers: { Authorization: "Bearer " },
      });
      expect(getAuthUser(request)).toBeNull();
    });

    it("should return null when Bearer token is invalid or corrupted", () => {
      const request = new Request("http://localhost:8081/test", {
        headers: { Authorization: "Bearer invalid.jwt.token" },
      });
      expect(getAuthUser(request)).toBeNull();
    });

    it("should return decoded token payload when token is valid", () => {
      const request = new Request("http://localhost:8081/test", {
        headers: { Authorization: `Bearer ${validToken}` },
      });
      const user = getAuthUser(request);
      expect(user).not.toBeNull();
      expect(user?.userId).toBe(validPayload.userId);
      expect(user?.email).toBe(validPayload.email);
    });
  });

  describe("requireAuth", () => {
    it("should return decoded payload when valid token is present", () => {
      const request = new Request("http://localhost:8081/test", {
        headers: { Authorization: `Bearer ${validToken}` },
      });
      const user = requireAuth(request);
      expect(user.userId).toBe(validPayload.userId);
      expect(user.email).toBe(validPayload.email);
    });

    it("should throw UnauthorizedError when token is missing", () => {
      const request = new Request("http://localhost:8081/test");
      expect(() => requireAuth(request)).toThrow(UnauthorizedError);
      expect(() => requireAuth(request)).toThrow("Token de autenticação ausente ou inválido");
    });

    it("should throw UnauthorizedError when token is invalid", () => {
      const request = new Request("http://localhost:8081/test", {
        headers: { Authorization: "Bearer bad-token" },
      });
      expect(() => requireAuth(request)).toThrow(UnauthorizedError);
    });
  });
});
