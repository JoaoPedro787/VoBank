import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";

export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "vobank_theme_preference";

let memoryFallbackPreference: ThemePreference | null = null;

export const themeStorage = {
  async getPreference(): Promise<ThemePreference | null> {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          return (window.localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference) || null;
        }
        return memoryFallbackPreference;
      }
      return (await SecureStore.getItemAsync(THEME_STORAGE_KEY)) as ThemePreference | null;
    } catch {
      return memoryFallbackPreference;
    }
  },

  async savePreference(preference: ThemePreference): Promise<void> {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(THEME_STORAGE_KEY, preference);
        }
        memoryFallbackPreference = preference;
        return;
      }
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, preference);
      memoryFallbackPreference = preference;
    } catch {
      memoryFallbackPreference = preference;
    }
  },
};

export async function loadSavedThemePreference(
  applyScheme?: (scheme: ThemePreference) => void,
): Promise<ThemePreference | null> {
  const saved = await themeStorage.getPreference();
  if (saved && (saved === "light" || saved === "dark" || saved === "system")) {
    if (applyScheme) {
      applyScheme(saved);
    }
    return saved;
  }
  return null;
}

export function useTheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativeWindColorScheme();

  const isDark = colorScheme === "dark";

  const setTheme = (theme: ThemePreference) => {
    setColorScheme(theme);
    void themeStorage.savePreference(theme);
  };

  const handleSetColorScheme = (scheme: Parameters<typeof setColorScheme>[0]) => {
    setColorScheme(scheme);
    if (scheme === "light" || scheme === "dark" || scheme === "system") {
      void themeStorage.savePreference(scheme);
    }
  };

  const handleToggleColorScheme = () => {
    const nextTheme: ThemePreference = isDark ? "light" : "dark";
    toggleColorScheme();
    void themeStorage.savePreference(nextTheme);
  };

  const initTheme = async (): Promise<ThemePreference | null> => {
    return loadSavedThemePreference(setColorScheme);
  };

  return {
    colorScheme: (colorScheme as "light" | "dark") ?? "light",
    isDark,
    setColorScheme: handleSetColorScheme,
    setTheme,
    toggleColorScheme: handleToggleColorScheme,
    initTheme,
  };
}
