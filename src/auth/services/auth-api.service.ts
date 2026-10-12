import { getBaseApiUrl } from "@/shared/lib/api-config";
import { AuthResponse, UserProfile } from "../types/auth.types";
import { RegisterUserInput, LoginUserInput } from "@/server/auth/schemas/auth.schema";

export const authApiService = {
  async register(data: RegisterUserInput): Promise<AuthResponse> {
    const baseUrl = getBaseApiUrl();
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Falha ao registrar usuário");
    }

    return result as AuthResponse;
  },

  async login(data: LoginUserInput): Promise<AuthResponse> {
    const baseUrl = getBaseApiUrl();
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Credenciais inválidas");
    }

    return result as AuthResponse;
  },

  async getMe(token: string): Promise<UserProfile> {
    const baseUrl = getBaseApiUrl();
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Sessão expirada");
    }

    return result as UserProfile;
  },
};
