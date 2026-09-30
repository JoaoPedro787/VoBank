import * as React from "react";
import { tokenService } from "../services/token.service";
import { authApiService } from "../services/auth-api.service";
import { UserProfile } from "../types/auth.types";
import { LoginUserInput, RegisterUserInput } from "@/server/auth/schemas/auth.schema";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginUserInput) => Promise<void>;
  register: (data: RegisterUserInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedToken = await tokenService.getToken();
        if (storedToken) {
          const profile = await authApiService.getMe(storedToken);
          setToken(storedToken);
          setUser(profile);
        }
      } catch {
        await tokenService.removeToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredAuth();
  }, []);

  const login = React.useCallback(async (data: LoginUserInput) => {
    setIsLoading(true);
    try {
      const response = await authApiService.login(data);
      await tokenService.saveToken(response.token);
      setToken(response.token);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = React.useCallback(async (data: RegisterUserInput) => {
    setIsLoading(true);
    try {
      const response = await authApiService.register(data);
      await tokenService.saveToken(response.token);
      setToken(response.token);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = React.useCallback(async () => {
    setIsLoading(true);
    try {
      await tokenService.removeToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!token && !!user,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
