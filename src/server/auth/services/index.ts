import { AuthService } from "./auth.service";
import { DrizzleAuthRepository } from "../repositories/drizzle-auth.repository";

let authServiceInstance: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService(new DrizzleAuthRepository());
  }
  return authServiceInstance;
}

export function setAuthService(service: AuthService | null): void {
  authServiceInstance = service;
}

export * from "./auth.service";
