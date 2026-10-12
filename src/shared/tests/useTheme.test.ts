import {
  useTheme,
  themeStorage,
  loadSavedThemePreference,
  THEME_STORAGE_KEY,
} from "../hooks/useTheme";
import * as nativewind from "nativewind";
import * as SecureStore from "expo-secure-store";

jest.mock("nativewind", () => ({
  useColorScheme: jest.fn(),
}));

jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    isAvailableAsync: jest.fn(async () => true),
  };
});

describe("useTheme Hook (TDD)", () => {
  const mockSetColorScheme = jest.fn();
  const mockToggleColorScheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    themeStorage._resetMemoryFallback();
  });

  describe("colorScheme and state properties", () => {
    it("should return light mode properties when colorScheme is light", () => {
      (nativewind.useColorScheme as jest.Mock).mockReturnValue({
        colorScheme: "light",
        setColorScheme: mockSetColorScheme,
        toggleColorScheme: mockToggleColorScheme,
      });

      const theme = useTheme();

      expect(theme.colorScheme).toBe("light");
      expect(theme.isDark).toBe(false);
    });

    it("should return dark mode properties when colorScheme is dark", () => {
      (nativewind.useColorScheme as jest.Mock).mockReturnValue({
        colorScheme: "dark",
        setColorScheme: mockSetColorScheme,
        toggleColorScheme: mockToggleColorScheme,
      });

      const theme = useTheme();

      expect(theme.colorScheme).toBe("dark");
      expect(theme.isDark).toBe(true);
    });

    it("should fallback to light when colorScheme is undefined", () => {
      (nativewind.useColorScheme as jest.Mock).mockReturnValue({
        colorScheme: undefined,
        setColorScheme: mockSetColorScheme,
        toggleColorScheme: mockToggleColorScheme,
      });

      const theme = useTheme();

      expect(theme.colorScheme).toBe("light");
      expect(theme.isDark).toBe(false);
    });
  });

  describe("toggling color scheme", () => {
    it("should toggle color scheme and persist dark when current is light", async () => {
      (nativewind.useColorScheme as jest.Mock).mockReturnValue({
        colorScheme: "light",
        setColorScheme: mockSetColorScheme,
        toggleColorScheme: mockToggleColorScheme,
      });

      const theme = useTheme();
      theme.toggleColorScheme();

      expect(mockToggleColorScheme).toHaveBeenCalledTimes(1);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(THEME_STORAGE_KEY, "dark");
    });

    it("should toggle color scheme and persist light when current is dark", async () => {
      (nativewind.useColorScheme as jest.Mock).mockReturnValue({
        colorScheme: "dark",
        setColorScheme: mockSetColorScheme,
        toggleColorScheme: mockToggleColorScheme,
      });

      const theme = useTheme();
      theme.toggleColorScheme();

      expect(mockToggleColorScheme).toHaveBeenCalledTimes(1);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(THEME_STORAGE_KEY, "light");
    });
  });

  describe("setting theme preference", () => {
    it("should allow setting theme to dark, light or system and persist each", async () => {
      (nativewind.useColorScheme as jest.Mock).mockReturnValue({
        colorScheme: "light",
        setColorScheme: mockSetColorScheme,
        toggleColorScheme: mockToggleColorScheme,
      });

      const theme = useTheme();

      theme.setTheme("dark");
      expect(mockSetColorScheme).toHaveBeenCalledWith("dark");
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(THEME_STORAGE_KEY, "dark");

      theme.setTheme("system");
      expect(mockSetColorScheme).toHaveBeenCalledWith("system");
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(THEME_STORAGE_KEY, "system");

      theme.setTheme("light");
      expect(mockSetColorScheme).toHaveBeenCalledWith("light");
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(THEME_STORAGE_KEY, "light");
    });

    it("should persist preference when setColorScheme is invoked directly with valid theme", async () => {
      (nativewind.useColorScheme as jest.Mock).mockReturnValue({
        colorScheme: "light",
        setColorScheme: mockSetColorScheme,
        toggleColorScheme: mockToggleColorScheme,
      });

      const theme = useTheme();
      theme.setColorScheme("dark");

      expect(mockSetColorScheme).toHaveBeenCalledWith("dark");
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(THEME_STORAGE_KEY, "dark");
    });
  });

  describe("theme initialization and persistence lifecycle", () => {
    it("should load and apply saved theme preference when one exists", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce("dark");
      (nativewind.useColorScheme as jest.Mock).mockReturnValue({
        colorScheme: "light",
        setColorScheme: mockSetColorScheme,
        toggleColorScheme: mockToggleColorScheme,
      });

      const theme = useTheme();
      const loaded = await theme.initTheme();

      expect(loaded).toBe("dark");
      expect(mockSetColorScheme).toHaveBeenCalledWith("dark");
    });

    it("should keep initial fallback and not alter colorScheme when no preference is saved", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
      (nativewind.useColorScheme as jest.Mock).mockReturnValue({
        colorScheme: "light",
        setColorScheme: mockSetColorScheme,
        toggleColorScheme: mockToggleColorScheme,
      });

      const theme = useTheme();
      const loaded = await theme.initTheme();

      expect(loaded).toBeNull();
      expect(mockSetColorScheme).not.toHaveBeenCalled();
    });

    it("should ignore invalid saved preference values and return null", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce("invalid-value");
      (nativewind.useColorScheme as jest.Mock).mockReturnValue({
        colorScheme: "light",
        setColorScheme: mockSetColorScheme,
        toggleColorScheme: mockToggleColorScheme,
      });

      const theme = useTheme();
      const loaded = await theme.initTheme();

      expect(loaded).toBeNull();
      expect(mockSetColorScheme).not.toHaveBeenCalled();
    });
  });

  describe("themeStorage and loadSavedThemePreference utilities", () => {
    it("should save and retrieve preferences via themeStorage", async () => {
      await themeStorage.savePreference("system");
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(THEME_STORAGE_KEY, "system");

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce("system");
      const pref = await themeStorage.getPreference();
      expect(pref).toBe("system");
    });

    it("should gracefully handle SecureStore read/write errors", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error("SecureStore error"));
      const pref = await themeStorage.getPreference();
      expect(pref).toBeNull();

      (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error("SecureStore write error"),
      );
      await expect(themeStorage.savePreference("dark")).resolves.not.toThrow();
    });

    it("should apply preference via loadSavedThemePreference callback", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce("light");
      const callback = jest.fn();

      const result = await loadSavedThemePreference(callback);

      expect(result).toBe("light");
      expect(callback).toHaveBeenCalledWith("light");
    });
  });
});
