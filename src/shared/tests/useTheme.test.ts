import { useTheme } from "../hooks/useTheme";
import * as nativewind from "nativewind";

jest.mock("nativewind", () => ({
  useColorScheme: jest.fn(),
}));

describe("useTheme Hook (TDD)", () => {
  const mockSetColorScheme = jest.fn();
  const mockToggleColorScheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it("should toggle color scheme when toggleColorScheme is invoked", () => {
    (nativewind.useColorScheme as jest.Mock).mockReturnValue({
      colorScheme: "light",
      setColorScheme: mockSetColorScheme,
      toggleColorScheme: mockToggleColorScheme,
    });

    const theme = useTheme();
    theme.toggleColorScheme();

    expect(mockToggleColorScheme).toHaveBeenCalledTimes(1);
  });

  it("should allow setting theme to dark, light or system", () => {
    (nativewind.useColorScheme as jest.Mock).mockReturnValue({
      colorScheme: "light",
      setColorScheme: mockSetColorScheme,
      toggleColorScheme: mockToggleColorScheme,
    });

    const theme = useTheme();

    theme.setTheme("dark");
    expect(mockSetColorScheme).toHaveBeenCalledWith("dark");

    theme.setTheme("system");
    expect(mockSetColorScheme).toHaveBeenCalledWith("system");

    theme.setTheme("light");
    expect(mockSetColorScheme).toHaveBeenCalledWith("light");
  });
});
