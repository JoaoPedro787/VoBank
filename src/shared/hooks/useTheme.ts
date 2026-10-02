import { useColorScheme as useNativeWindColorScheme } from "nativewind";

export type ThemePreference = "light" | "dark" | "system";

export function useTheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativeWindColorScheme();

  const isDark = colorScheme === "dark";

  const setTheme = (theme: ThemePreference) => {
    setColorScheme(theme);
  };

  return {
    colorScheme: (colorScheme as "light" | "dark") ?? "light",
    isDark,
    setColorScheme,
    setTheme,
    toggleColorScheme,
  };
}
