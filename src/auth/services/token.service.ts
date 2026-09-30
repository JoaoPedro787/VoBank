import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "finances_auth_token";

let memoryFallbackToken: string | null = null;

export const tokenService = {
  async saveToken(token: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(TOKEN_KEY, token);
        } else {
          memoryFallbackToken = token;
        }
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch {
      memoryFallbackToken = token;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          return window.localStorage.getItem(TOKEN_KEY);
        }
        return memoryFallbackToken;
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return memoryFallbackToken;
    }
  },

  async removeToken(): Promise<void> {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(TOKEN_KEY);
        }
        memoryFallbackToken = null;
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch {
      memoryFallbackToken = null;
    }
  },
};
