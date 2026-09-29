import { useColorScheme as useNativeWindColorScheme } from "nativewind";

export function useTheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativeWindColorScheme();

  const isDark = colorScheme === "dark";

  return {
    colorScheme: colorScheme ?? "light",
    isDark,
    setColorScheme,
    toggleColorScheme,
  };
}
