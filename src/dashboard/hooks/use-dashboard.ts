import * as React from "react";
import { useAuth } from "@/auth/hooks/use-auth";
import { dashboardApiService } from "../services/dashboard-api.service";
import { purchasesApiService } from "@/purchases/services/purchases-api.service";
import { notificationService } from "@/notifications/services/notification.service";
import { DashboardResponseClient } from "../types/dashboard.types";

export function useDashboard() {
  const { token } = useAuth();

  const now = new Date();
  const [month, setMonth] = React.useState<number>(now.getMonth() + 1);
  const [year, setYear] = React.useState<number>(now.getFullYear());
  const [selectedPersonId, setSelectedPersonId] = React.useState<string | "all">("all");

  const [data, setData] = React.useState<DashboardResponseClient | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchDashboard = React.useCallback(
    async (targetMonth?: number, targetYear?: number) => {
      if (!token) return;

      const m = targetMonth ?? month;
      const y = targetYear ?? year;

      setIsLoading(true);
      setError(null);
      try {
        const response = await dashboardApiService.getSummary(token, m, y);
        setData(response);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados do dashboard");
      } finally {
        setIsLoading(false);
      }
    },
    [token, month, year],
  );

  React.useEffect(() => {
    fetchDashboard(month, year);
  }, [fetchDashboard, month, year]);

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const toggleSplitPaid = async (splitId: string, currentPaid: boolean) => {
    if (!token) throw new Error("Usuário não autenticado");
    try {
      const willBePaid = !currentPaid;
      await purchasesApiService.toggleSplitPaid(token, splitId, willBePaid);

      if (willBePaid) {
        await notificationService.cancelSplitNotifications(splitId);
      }

      // Recarregar dados consolidados
      await fetchDashboard(month, year);
      return willBePaid;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar pagamento da parcela";
      setError(message);
      throw err;
    }
  };

  const setMonthYear = React.useCallback((newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
  }, []);

  return {
    month,
    year,
    data,
    isLoading,
    error,
    selectedPersonId,
    setSelectedPersonId,
    fetchDashboard,
    nextMonth,
    prevMonth,
    setMonthYear,
    toggleSplitPaid,
  };
}
