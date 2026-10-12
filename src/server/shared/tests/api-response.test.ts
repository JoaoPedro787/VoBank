import { z } from "zod";
import { apiSuccess, handleApiError } from "../utils/api-response";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "../errors/app-error";

describe("API Response Utilities (TDD Unit Tests)", () => {
  describe("apiSuccess", () => {
    it("should return Response with default status 200 and JSON body", async () => {
      const data = { message: "ok", count: 42 };
      const response = apiSuccess(data);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("application/json");

      const json = await response.json();
      expect(json).toEqual(data);
    });

    it("should support custom HTTP status codes (e.g., 201 Created)", async () => {
      const data = { id: "new-resource" };
      const response = apiSuccess(data, 201);

      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json).toEqual(data);
    });
  });

  describe("handleApiError", () => {
    it("should format ZodError into 400 with error message and details array", async () => {
      const testSchema = z.object({
        name: z.string().min(3, "Nome muito curto"),
        email: z.string().email("E-mail inválido"),
      });

      let zodError: unknown;
      try {
        testSchema.parse({ name: "a", email: "invalid" });
      } catch (err) {
        zodError = err;
      }

      const response = handleApiError(zodError);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toBe("Dados de requisição inválidos");
      expect(Array.isArray(json.details)).toBe(true);
      expect(json.details.length).toBe(2);
      expect(json.details[0].path).toBe("name");
      expect(json.details[1].path).toBe("email");
    });

    it("should format AppError into respective status code and message", async () => {
      const errors = [
        { err: new BadRequestError("Payload incorreto"), expectedStatus: 400 },
        { err: new UnauthorizedError("Não autorizado"), expectedStatus: 401 },
        { err: new ForbiddenError("Acesso negado"), expectedStatus: 403 },
        { err: new NotFoundError("Recurso não encontrado"), expectedStatus: 404 },
        { err: new ConflictError("Já existente"), expectedStatus: 409 },
      ];

      for (const { err, expectedStatus } of errors) {
        const response = handleApiError(err);
        expect(response.status).toBe(expectedStatus);

        const json = await response.json();
        expect(json.error).toBe(err.message);
      }
    });

    it("should format unexpected errors into 500 internal server error", async () => {
      // Mock console.error to avoid polluting test logs
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      const genericError = new Error("Something broke internally");
      const response = handleApiError(genericError);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe("Erro interno do servidor");

      spy.mockRestore();
    });
  });
});
