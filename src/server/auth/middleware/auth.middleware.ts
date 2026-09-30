import { UnauthorizedError } from "../../shared/errors/app-error";
import { verifyToken, TokenPayload } from "../utils/jwt";

export function getAuthUser(request: Request): TokenPayload | null {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export function requireAuth(request: Request): TokenPayload {
  const user = getAuthUser(request);
  if (!user) {
    throw new UnauthorizedError("Token de autenticação ausente ou inválido");
  }
  return user;
}
