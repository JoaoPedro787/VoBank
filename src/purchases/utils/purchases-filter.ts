import { PurchaseClient } from "../types/purchases.types";

export interface PurchaseFilterOptions {
  searchQuery?: string;
  isAllPeriods?: boolean;
  selectedMonth?: number; // 1 - 12
  selectedYear?: number;
  selectedCardId?: string; // "all" | "no-card" | cardId
  selectedPersonId?: string; // "all" | "user" | personId
}

export interface PurchaseMetrics {
  totalAmount: number;
  totalCount: number;
  paidAmount: number;
  pendingAmount: number;
}

/**
 * Filtra a lista de compras em memória com base em critérios cruzados
 * (descrição, período por data da compra, cartão de crédito e pessoa participante).
 */
export function filterPurchases(
  purchases: PurchaseClient[],
  options: PurchaseFilterOptions,
): PurchaseClient[] {
  const {
    searchQuery = "",
    isAllPeriods = false,
    selectedMonth,
    selectedYear,
    selectedCardId = "all",
    selectedPersonId = "all",
  } = options;

  const cleanQuery = searchQuery.trim().toLowerCase();

  return purchases.filter((purchase) => {
    // 1. Filtro textual por descrição
    if (cleanQuery && !purchase.description.toLowerCase().includes(cleanQuery)) {
      return false;
    }

    // 2. Filtro por período (Mês/Ano da data da compra)
    if (!isAllPeriods && selectedMonth != null && selectedYear != null) {
      const pDate = new Date(purchase.purchaseDate);
      if (!isNaN(pDate.getTime())) {
        const pMonth = pDate.getUTCMonth() + 1;
        const pYear = pDate.getUTCFullYear();
        if (pMonth !== selectedMonth || pYear !== selectedYear) {
          return false;
        }
      }
    }

    // 3. Filtro por Cartão de Crédito
    if (selectedCardId !== "all") {
      if (selectedCardId === "no-card") {
        if (purchase.creditCardId != null) return false;
      } else {
        if (purchase.creditCardId !== selectedCardId) return false;
      }
    }

    // 4. Filtro por Pessoa Participante
    if (selectedPersonId !== "all") {
      if (selectedPersonId === "user") {
        // Titular: compra sem divisões ou com split onde personId é nulo
        const hasSplits =
          purchase.installments &&
          purchase.installments.some((inst) => inst.splits && inst.splits.length > 0);

        if (hasSplits) {
          const hasUserSplit = purchase.installments.some((inst) =>
            inst.splits.some((s) => s.personId == null),
          );
          if (!hasUserSplit) return false;
        }
      } else {
        // Pessoa específica: verificar se existe split associado ao personId
        const hasPersonSplit =
          purchase.installments &&
          purchase.installments.some(
            (inst) => inst.splits && inst.splits.some((s) => s.personId === selectedPersonId),
          );

        if (!hasPersonSplit) return false;
      }
    }

    return true;
  });
}

/**
 * Calcula métricas consolidadas (gasto acumulado, quantidade, valor pago e pendente)
 * para a lista de compras filtradas.
 */
export function calculatePurchasesMetrics(purchases: PurchaseClient[]): PurchaseMetrics {
  let totalAmount = 0;
  let paidAmount = 0;
  let pendingAmount = 0;

  for (const purchase of purchases) {
    const numericTotal = Number(purchase.totalAmount) || 0;
    totalAmount += numericTotal;

    if (purchase.installments && purchase.installments.length > 0) {
      for (const inst of purchase.installments) {
        if (inst.splits && inst.splits.length > 0) {
          for (const split of inst.splits) {
            const splitAmount = Number(split.amount) || 0;
            if (split.isPaid) {
              paidAmount += splitAmount;
            } else {
              pendingAmount += splitAmount;
            }
          }
        } else {
          // Parcela sem splits explícitos: valor da parcela
          const instAmount = Number(inst.amount) || 0;
          pendingAmount += instAmount;
        }
      }
    } else {
      pendingAmount += numericTotal;
    }
  }

  return {
    totalAmount,
    totalCount: purchases.length,
    paidAmount,
    pendingAmount,
  };
}
