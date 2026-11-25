import * as React from "react";
import { router } from "expo-router";
import { HeaderSettingsMenu } from "../components/HeaderSettingsMenu";
import { useAuth } from "@/auth/hooks/use-auth";
import { useTheme, themeStorage } from "@/shared/hooks/useTheme";
import { hapticFeedback } from "@/shared/utils/haptics";

jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  __esModule: true,
  default: () => ({ width: 390, height: 844, scale: 3, fontScale: 1 }),
}));

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock("@/auth/hooks/use-auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/shared/hooks/useTheme", () => ({
  useTheme: jest.fn(),
  themeStorage: {
    getPreference: jest.fn(),
    savePreference: jest.fn(),
  },
}));

jest.mock("@/shared/utils/haptics", () => ({
  hapticFeedback: {
    selection: jest.fn(),
    impactLight: jest.fn(),
  },
}));

type ElementNode = {
  type?: unknown;
  props?: Record<string, unknown> & { children?: unknown };
};

function findElementByTestId(node: unknown, testID: string): ElementNode | null {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElementByTestId(child, testID);
      if (found) return found;
    }
    return null;
  }

  const el = node as ElementNode;
  if (el.props?.testID === testID) {
    return el;
  }

  if (el.props?.children !== undefined) {
    return findElementByTestId(el.props.children, testID);
  }

  return null;
}

describe("HeaderSettingsMenu (TDD & Unit)", () => {
  const mockLogout = jest.fn();
  const mockSetTheme = jest.fn();
  const mockToggleColorScheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "user-1", name: "João Silva", email: "joao@vobank.app" },
      logout: mockLogout,
    });
    (useTheme as jest.Mock).mockReturnValue({
      colorScheme: "light",
      isDark: false,
      setTheme: mockSetTheme,
      toggleColorScheme: mockToggleColorScheme,
    });
    (themeStorage.getPreference as jest.Mock).mockResolvedValue("light");
    jest.spyOn(React, "useEffect").mockImplementation(() => {});
    jest.spyOn(React, "useRef").mockReturnValue({ current: null });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function mockStates({ isOpen = false, activeTheme = "light" } = {}) {
    const setIsOpen = jest.fn();
    const setActiveTheme = jest.fn();
    const setMenuAnchor = jest.fn();

    let callIndex = 0;
    (jest.spyOn(React, "useState") as jest.Mock).mockImplementation((init: unknown) => {
      const idx = callIndex++;
      if (idx === 0) return [isOpen, setIsOpen];
      if (idx === 1) return [activeTheme, setActiveTheme];
      if (idx === 2) return [null, setMenuAnchor];
      return [typeof init === "function" ? (init as () => unknown)() : init, jest.fn()];
    });

    return { setIsOpen, setActiveTheme, setMenuAnchor };
  }

  it("should render gear trigger button with accessible label and closed modal by default", () => {
    mockStates({ isOpen: false });

    const tree = HeaderSettingsMenu({ testID: "header-settings" });
    const trigger = findElementByTestId(tree, "header-settings-trigger");
    const modal = findElementByTestId(tree, "header-settings-modal");

    expect(trigger).not.toBeNull();
    expect(trigger?.props?.accessibilityRole).toBe("button");
    expect(trigger?.props?.accessibilityLabel).toBe("Abrir configurações");
    expect(modal?.props?.visible).toBe(false);
  });

  it("should open the popover list and trigger selection haptic when gear is pressed", () => {
    const { setIsOpen } = mockStates({ isOpen: false });

    const tree = HeaderSettingsMenu({ testID: "header-settings" });
    const trigger = findElementByTestId(tree, "header-settings-trigger");

    (trigger?.props?.onPress as () => void)();

    expect(hapticFeedback.selection).toHaveBeenCalledTimes(1);
    expect(setIsOpen).toHaveBeenCalledWith(true);
  });

  it("should render theme options and logout action when menu is open", () => {
    mockStates({ isOpen: true, activeTheme: "light" });

    const tree = HeaderSettingsMenu({ testID: "header-settings" });
    const modal = findElementByTestId(tree, "header-settings-modal");
    const lightBtn = findElementByTestId(tree, "header-settings-theme-light");
    const darkBtn = findElementByTestId(tree, "header-settings-theme-dark");
    const systemBtn = findElementByTestId(tree, "header-settings-theme-system");
    const logoutBtn = findElementByTestId(tree, "header-settings-logout");

    expect(modal?.props?.visible).toBe(true);
    expect(lightBtn).not.toBeNull();
    expect(darkBtn).not.toBeNull();
    expect(systemBtn).not.toBeNull();
    expect(logoutBtn).not.toBeNull();
    expect(logoutBtn?.props?.accessibilityLabel).toBe("Sair da conta");
  });

  it("should update theme preference via setTheme when selecting light, dark, or system", () => {
    const { setActiveTheme } = mockStates({ isOpen: true, activeTheme: "light" });

    const tree = HeaderSettingsMenu({ testID: "header-settings" });
    const darkBtn = findElementByTestId(tree, "header-settings-theme-dark");
    const systemBtn = findElementByTestId(tree, "header-settings-theme-system");

    (darkBtn?.props?.onPress as () => void)();
    expect(hapticFeedback.selection).toHaveBeenCalled();
    expect(setActiveTheme).toHaveBeenCalledWith("dark");
    expect(mockSetTheme).toHaveBeenCalledWith("dark");

    (systemBtn?.props?.onPress as () => void)();
    expect(setActiveTheme).toHaveBeenCalledWith("system");
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });

  it("should fallback to toggleColorScheme when setTheme is not provided", () => {
    (useTheme as jest.Mock).mockReturnValue({
      colorScheme: "light",
      isDark: false,
      toggleColorScheme: mockToggleColorScheme,
    });
    mockStates({ isOpen: true, activeTheme: "light" });

    const tree = HeaderSettingsMenu({ testID: "header-settings" });
    const darkBtn = findElementByTestId(tree, "header-settings-theme-dark");

    (darkBtn?.props?.onPress as () => void)();

    expect(mockToggleColorScheme).toHaveBeenCalledTimes(1);
  });

  it("should close menu, call logout, and redirect to login when logout item is pressed", async () => {
    mockLogout.mockResolvedValueOnce(undefined);
    const { setIsOpen } = mockStates({ isOpen: true, activeTheme: "dark" });

    const tree = HeaderSettingsMenu({ testID: "header-settings" });
    const logoutBtn = findElementByTestId(tree, "header-settings-logout");

    await (logoutBtn?.props?.onPress as () => Promise<void>)();

    expect(hapticFeedback.impactLight).toHaveBeenCalledTimes(1);
    expect(setIsOpen).toHaveBeenCalledWith(false);
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith("/(auth)/login");
  });
});
