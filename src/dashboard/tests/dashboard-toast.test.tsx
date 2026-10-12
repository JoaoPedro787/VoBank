import * as React from "react";
import HomeScreen from "@/app/(tabs)/index";
import { useDashboard } from "../hooks/use-dashboard";
import { showToast } from "@/shared/utils/toast";
import { purchasesApiService } from "@/purchases/services/purchases-api.service";
import { notificationService } from "@/notifications/services/notification.service";
import { dashboardApiService } from "../services/dashboard-api.service";
import { useAuth } from "@/auth/hooks/use-auth";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
  useFocusEffect: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 40, bottom: 20, left: 0, right: 0 }),
}));

jest.mock("@/auth/hooks/use-auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/shared/hooks/useTheme", () => ({
  useTheme: () => ({
    isDark: false,
    toggleColorScheme: jest.fn(),
  }),
}));

jest.mock("../hooks/use-dashboard", () => ({
  useDashboard: jest.fn(),
}));

jest.mock("@/purchases/services/purchases-api.service", () => ({
  purchasesApiService: {
    toggleSplitPaid: jest.fn(),
  },
}));

jest.mock("../services/dashboard-api.service", () => ({
  dashboardApiService: {
    getSummary: jest.fn(),
  },
}));

jest.mock("@/notifications/services/notification.service", () => ({
  notificationService: {
    cancelSplitNotifications: jest.fn(),
  },
}));

jest.mock("@/shared/utils/toast", () => ({
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("Dashboard Split Toast & Payment Toggle (TDD)", () => {
  const mockToggleSplitPaid = jest.fn();

  const mockItem = {
    id: "split-1",
    installmentId: "inst-1",
    installmentNumber: 1,
    totalInstallments: 3,
    purchaseDescription: "Compra de Teste",
    amount: 100,
    dueDate: "2026-10-15T12:00:00Z",
    isPaid: false,
    isOverdue: false,
    paidAt: null,
    personColor: "#007AFF",
    personName: "João",
    creditCardName: "Nubank",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, "useMemo").mockImplementation(<T,>(fn: () => T): T => fn());
    jest.spyOn(React, "useCallback").mockImplementation(<T,>(fn: T): T => fn);
    (useAuth as jest.Mock).mockReturnValue({
      user: { name: "Test User" },
      token: "valid-token",
      logout: jest.fn(),
    });
    (useDashboard as jest.Mock).mockReturnValue({
      month: 10,
      year: 2026,
      data: {
        month: 10,
        year: 2026,
        totalCommitted: 100,
        totalPaid: 0,
        totalPending: 100,
        totalOverdue: 0,
        installmentsCount: 1,
        byPerson: [],
      },
      isLoading: false,
      error: null,
      selectedPersonId: "all",
      setSelectedPersonId: jest.fn(),
      fetchDashboard: jest.fn(),
      nextMonth: jest.fn(),
      prevMonth: jest.fn(),
      setMonthYear: jest.fn(),
      toggleSplitPaid: mockToggleSplitPaid,
    });
  });

  describe("HomeScreen Split Toast Feedback", () => {
    it("should trigger success toast with 'Parcela marcada como paga!' when marking unpaid split as paid", async () => {
      mockToggleSplitPaid.mockResolvedValueOnce(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element: any = HomeScreen();
      // FlatList is the 3rd child in container: [Header, Error(null), FlatList]
      const flatList = element.props.children[2];
      const renderedItem = flatList.props.renderItem({ item: { ...mockItem, isPaid: false } });

      const actionLine = renderedItem.props.children.props.children[1];
      const pressable = actionLine.props.children[1];

      await pressable.props.onPress();

      expect(mockToggleSplitPaid).toHaveBeenCalledWith("split-1", false);
      expect(showToast.success).toHaveBeenCalledWith("Parcela marcada como paga!");
    });

    it("should trigger success toast with 'Parcela marcada como pendente!' when marking paid split as unpaid", async () => {
      mockToggleSplitPaid.mockResolvedValueOnce(false);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element: any = HomeScreen();
      const flatList = element.props.children[2];
      const renderedItem = flatList.props.renderItem({ item: { ...mockItem, isPaid: true } });

      const actionLine = renderedItem.props.children.props.children[1];
      const pressable = actionLine.props.children[1];

      await pressable.props.onPress();

      expect(mockToggleSplitPaid).toHaveBeenCalledWith("split-1", true);
      expect(showToast.success).toHaveBeenCalledWith("Parcela marcada como pendente!");
    });

    it("should trigger error toast when toggleSplitPaid fails", async () => {
      mockToggleSplitPaid.mockRejectedValueOnce(new Error("Falha de rede"));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element: any = HomeScreen();
      const flatList = element.props.children[2];
      const renderedItem = flatList.props.renderItem({ item: { ...mockItem, isPaid: false } });

      const actionLine = renderedItem.props.children.props.children[1];
      const pressable = actionLine.props.children[1];

      await pressable.props.onPress();

      expect(mockToggleSplitPaid).toHaveBeenCalledWith("split-1", false);
      expect(showToast.error).toHaveBeenCalledWith(
        "Erro ao atualizar status da parcela",
        "Falha de rede",
      );
    });
  });

  describe("useDashboard toggleSplitPaid contract", () => {
    it("should call api and notification service when toggling to paid and return true", async () => {
      const { useDashboard: actualUseDashboard } = jest.requireActual("../hooks/use-dashboard");
      (purchasesApiService.toggleSplitPaid as jest.Mock).mockResolvedValueOnce({
        id: "split-1",
        isPaid: true,
      });
      (dashboardApiService.getSummary as jest.Mock).mockResolvedValueOnce({
        month: 10,
        year: 2026,
        totalCommitted: 100,
        totalPaid: 100,
        totalPending: 0,
        totalOverdue: 0,
        installmentsCount: 1,
        byPerson: [],
      });

      // Mock react useState and useEffect to execute hook function
      (jest.spyOn(React, "useState") as jest.Mock).mockImplementation((init: unknown) => [
        typeof init === "function" ? (init as () => unknown)() : init,
        jest.fn(),
      ]);
      jest.spyOn(React, "useEffect").mockImplementation(() => {});

      const hookResult = actualUseDashboard();
      const result = await hookResult.toggleSplitPaid("split-1", false);

      expect(purchasesApiService.toggleSplitPaid).toHaveBeenCalledWith(
        "valid-token",
        "split-1",
        true,
      );
      expect(notificationService.cancelSplitNotifications).toHaveBeenCalledWith("split-1");
      expect(result).toBe(true);
    });

    it("should rethrow and not cancel notifications when toggling to unpaid", async () => {
      const { useDashboard: actualUseDashboard } = jest.requireActual("../hooks/use-dashboard");
      (purchasesApiService.toggleSplitPaid as jest.Mock).mockResolvedValueOnce({
        id: "split-1",
        isPaid: false,
      });
      (dashboardApiService.getSummary as jest.Mock).mockResolvedValueOnce({
        month: 10,
        year: 2026,
        totalCommitted: 100,
        totalPaid: 0,
        totalPending: 100,
        totalOverdue: 0,
        installmentsCount: 1,
        byPerson: [],
      });

      (jest.spyOn(React, "useState") as jest.Mock).mockImplementation((init: unknown) => [
        typeof init === "function" ? (init as () => unknown)() : init,
        jest.fn(),
      ]);
      jest.spyOn(React, "useEffect").mockImplementation(() => {});

      const hookResult = actualUseDashboard();
      const result = await hookResult.toggleSplitPaid("split-1", true);

      expect(purchasesApiService.toggleSplitPaid).toHaveBeenCalledWith(
        "valid-token",
        "split-1",
        false,
      );
      expect(notificationService.cancelSplitNotifications).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("should rethrow error when api call fails", async () => {
      const { useDashboard: actualUseDashboard } = jest.requireActual("../hooks/use-dashboard");
      (purchasesApiService.toggleSplitPaid as jest.Mock).mockRejectedValueOnce(
        new Error("Erro 500 no servidor"),
      );

      (jest.spyOn(React, "useState") as jest.Mock).mockImplementation((init: unknown) => [
        typeof init === "function" ? (init as () => unknown)() : init,
        jest.fn(),
      ]);
      jest.spyOn(React, "useEffect").mockImplementation(() => {});

      const hookResult = actualUseDashboard();

      await expect(hookResult.toggleSplitPaid("split-1", false)).rejects.toThrow(
        "Erro 500 no servidor",
      );
    });
  });
});
