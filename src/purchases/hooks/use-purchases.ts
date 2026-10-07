import * as React from "react";
import { useAuth } from "@/auth/hooks/use-auth";
import { purchasesApiService } from "../services/purchases-api.service";
import {
  PurchaseClient,
  CreatePurchaseData,
  UpdatePurchaseData,
  InstallmentSplitClient,
  ListPurchasesFilters,
} from "../types/purchases.types";
import { notificationService } from "@/notifications/services/notification.service";

export function usePurchases(initialFilters?: ListPurchasesFilters) {
  const { token } = useAuth();
  const [purchases, setPurchases] = React.useState<PurchaseClient[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<ListPurchasesFilters | undefined>(initialFilters);

  const fetchPurchases = React.useCallback(
    async (overrideFilters?: ListPurchasesFilters) => {
      if (!token) return;
      setIsLoading(true);
      setError(null);
      try {
        const activeFilters = overrideFilters !== undefined ? overrideFilters : filters;
        const data = await purchasesApiService.list(token, activeFilters);
        setPurchases(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erro ao carregar compras";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [token, filters],
  );

  React.useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const createPurchase = React.useCallback(
    async (data: CreatePurchaseData): Promise<PurchaseClient> => {
      if (!token) throw new Error("Usuário não autenticado");
      setError(null);
      const created = await purchasesApiService.create(token, data);
      setPurchases((prev) => [created, ...prev]);

      // Agendar notificações locais para parcelas/splits pendentes
      await notificationService.schedulePurchaseNotifications(created);

      return created;
    },
    [token],
  );

  const updatePurchase = React.useCallback(
    async (id: string, data: UpdatePurchaseData): Promise<PurchaseClient> => {
      if (!token) throw new Error("Usuário não autenticado");
      setError(null);
      const updated = await purchasesApiService.update(token, id, data);
      setPurchases((prev) => prev.map((p) => (p.id === id ? updated : p)));

      // Reagendar notificações para parcelas atualizadas
      await notificationService.schedulePurchaseNotifications(updated);

      return updated;
    },
    [token],
  );

  const deletePurchase = React.useCallback(
    async (id: string): Promise<void> => {
      if (!token) throw new Error("Usuário não autenticado");
      setError(null);
      await purchasesApiService.delete(token, id);
      setPurchases((prev) => prev.filter((p) => p.id !== id));
    },
    [token],
  );

  const toggleSplitPaid = React.useCallback(
    async (splitId: string, isPaid: boolean): Promise<InstallmentSplitClient> => {
      if (!token) throw new Error("Usuário não autenticado");
      setError(null);
      const updatedSplit = await purchasesApiService.toggleSplitPaid(token, splitId, isPaid);

      setPurchases((prevPurchases) =>
        prevPurchases.map((purchase) => ({
          ...purchase,
          installments: purchase.installments.map((inst) => ({
            ...inst,
            splits: inst.splits.map((split) =>
              split.id === splitId
                ? {
                    ...split,
                    isPaid: updatedSplit.isPaid,
                    paidAt: updatedSplit.paidAt,
                  }
                : split,
            ),
          })),
        })),
      );

      if (updatedSplit.isPaid) {
        await notificationService.cancelSplitNotifications(splitId);
      }

      return updatedSplit;
    },
    [token],
  );

  return {
    purchases,
    isLoading,
    error,
    filters,
    setFilters,
    fetchPurchases,
    createPurchase,
    updatePurchase,
    deletePurchase,
    toggleSplitPaid,
  };
}
