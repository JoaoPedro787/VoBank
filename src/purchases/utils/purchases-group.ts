import { PurchaseClient } from "../types/purchases.types";

export interface PurchaseDayGroup {
  dateKey: string;
  title: string;
  formattedDate: string;
  totalAmount: number;
  purchases: PurchaseClient[];
}

const MONTH_NAMES_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export interface GroupPurchasesOptions {
  referenceDate?: Date;
}

/**
 * Agrupa uma lista de compras cronologicamente por dia (do mais recente para o mais antigo),
 * fornecendo rótulos amigáveis ("Hoje", "Ontem" ou data formatada em português)
 * e o somatório total daquele dia.
 */
export function groupPurchasesByDay(
  purchases: PurchaseClient[],
  options?: GroupPurchasesOptions,
): PurchaseDayGroup[] {
  if (!purchases || purchases.length === 0) {
    return [];
  }

  const ref = options?.referenceDate ?? new Date();
  const refYear = ref.getFullYear();
  const refMonth = ref.getMonth();
  const refDay = ref.getDate();

  const todayDate = new Date(refYear, refMonth, refDay);
  const yesterdayDate = new Date(refYear, refMonth, refDay - 1);

  const formatKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const todayKey = formatKey(todayDate);
  const yesterdayKey = formatKey(yesterdayDate);

  const groupsMap = new Map<
    string,
    { dateObj: Date; purchases: PurchaseClient[]; totalAmount: number }
  >();

  for (const purchase of purchases) {
    const rawDate = new Date(purchase.purchaseDate);
    const dateObj = isNaN(rawDate.getTime()) ? new Date() : rawDate;

    let y: number;
    let m: number;
    let d: number;

    if (typeof purchase.purchaseDate === "string" && purchase.purchaseDate.includes("T")) {
      y = dateObj.getUTCFullYear();
      m = dateObj.getUTCMonth();
      d = dateObj.getUTCDate();
    } else {
      y = dateObj.getFullYear();
      m = dateObj.getMonth();
      d = dateObj.getDate();
    }

    const key = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const amount = Number(purchase.totalAmount) || 0;

    let group = groupsMap.get(key);
    if (!group) {
      group = {
        dateObj: new Date(y, m, d),
        purchases: [],
        totalAmount: 0,
      };
      groupsMap.set(key, group);
    }

    group.purchases.push(purchase);
    group.totalAmount += amount;
  }

  const sortedKeys = Array.from(groupsMap.keys()).sort((a, b) => b.localeCompare(a));

  return sortedKeys.map((key) => {
    const group = groupsMap.get(key)!;
    const gDate = group.dateObj;
    const gYear = gDate.getFullYear();
    const gMonth = gDate.getMonth();
    const gDay = gDate.getDate();

    let title: string;
    if (key === todayKey) {
      title = "Hoje";
    } else if (key === yesterdayKey) {
      title = "Ontem";
    } else if (gYear === refYear) {
      title = `${gDay} de ${MONTH_NAMES_PT[gMonth]}`;
    } else {
      title = `${gDay} de ${MONTH_NAMES_PT[gMonth]} de ${gYear}`;
    }

    const formattedDate = `${String(gDay).padStart(2, "0")}/${String(gMonth + 1).padStart(2, "0")}/${gYear}`;

    return {
      dateKey: key,
      title,
      formattedDate,
      totalAmount: Math.round(group.totalAmount * 100) / 100,
      purchases: group.purchases,
    };
  });
}
