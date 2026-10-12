import { ZodError } from "zod";
import { AppError } from "../errors/app-error";

export function apiSuccess<T>(data: T, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function handleApiError(error: unknown): Response {
  if (error instanceof ZodError) {
    const issues = error.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    }));
    return Response.json(
      {
        error: "Dados de requisição inválidos",
        details: issues,
      },
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (error instanceof AppError) {
    return Response.json(
      { error: error.message },
      { status: error.statusCode, headers: { "Content-Type": "application/json" } },
    );
  }

  console.error("Unhandled API error:", error);
  return Response.json(
    { error: "Erro interno do servidor" },
    { status: 500, headers: { "Content-Type": "application/json" } },
  );
}
