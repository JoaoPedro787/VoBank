import * as React from "react";
import { useAuth } from "@/auth/hooks/use-auth";
import { purchasesApiService } from "../services/purchases-api.service";
import {
  PurchaseClient,
  CreatePurchaseData,
  InstallmentSplitClient,
} from "../types/purchases.types";

export function usePurchases() {
  const { token } = useAuth();
  const [purchases, setPurchases] = React.useState<PurchaseClient[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchPurchases = React.useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await purchasesApiService.list(token);
      setPurchases(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar compras";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const createPurchase = React.useCallback(
    async (data: CreatePurchaseData): Promise<PurchaseClient> => {
      if (!token) throw new Error("Usuário não autenticado");
      setError(null);
      const created = await purchasesApiService.create(token, data);
      setPurchases((prev) => [created, ...prev]);
      return created;
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

      return updatedSplit;
    },
    [token],
  );

  return {
    purchases,
    isLoading,
    error,
    fetchPurchases,
    createPurchase,
    deletePurchase,
    toggleSplitPaid,
  };
}
