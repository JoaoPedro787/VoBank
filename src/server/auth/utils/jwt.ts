import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "finances-secret-key-fallback-for-testing-only-123";
const JWT_EXPIRES_IN = "7d";

export interface TokenPayload {
  userId: string;
  email: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    if (decoded && decoded.userId && decoded.email) {
      return {
        userId: decoded.userId,
        email: decoded.email,
      };
    }
    return null;
  } catch {
    return null;
  }
}
