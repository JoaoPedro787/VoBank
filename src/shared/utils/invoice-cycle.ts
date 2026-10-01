export interface BillingCycleResult {
  dueDate: Date;
  billingMonth: number; // 1-12
  billingYear: number;
}

export interface CreditCardCycleOptions {
  purchaseDate: Date;
  closingDay: number;
  dueDay: number;
}

export interface InstallmentDateResult {
  installmentNumber: number;
  dueDate: Date;
  billingMonth: number;
  billingYear: number;
}

export interface CalculateInstallmentDatesOptions {
  purchaseDate: Date;
  paymentMethod: "cash" | "debit" | "credit";
  totalInstallments: number;
  card?: {
    closingDay: number;
    dueDay: number;
  } | null;
}

/**
 * Retorna o dia seguro dentro do mês/ano, respeitando o número de dias
 * de meses com 28, 29, 30 ou 31 dias (inclusive anos bissextos).
 *
 * @param year Ano completo (ex: 2025)
 * @param monthIndex Mês indexado em 0 (0 = Janeiro, 1 = Fevereiro, ..., 11 = Dezembro)
 * @param targetDay Dia desejado (1 a 31)
 */
export function clampDayToMonthEnd(year: number, monthIndex: number, targetDay: number): number {
  // O dia 0 do mês seguinte em UTC é o último dia do mês atual
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  return Math.min(Math.max(1, targetDay), daysInMonth);
}

/**
 * Calcula a data de vencimento e a competência (mês/ano) da primeira fatura
 * de uma compra no cartão de crédito, com base na data da compra, dia de
 * fechamento e dia de vencimento.
 */
export function calculateCreditCardBillingCycle({
  purchaseDate,
  closingDay,
  dueDay,
}: CreditCardCycleOptions): BillingCycleResult & {
  firstDueMonthIndex: number;
  baseYear: number;
} {
  const pYear = purchaseDate.getUTCFullYear();
  const pMonth = purchaseDate.getUTCMonth();
  const pDay = purchaseDate.getUTCDate();

  // Dia efetivo de fechamento no mês da compra (ex: se closingDay for 31 e for fevereiro)
  const effectiveClosingDay = clampDayToMonthEnd(pYear, pMonth, closingDay);

  // Se a compra foi após o dia do fechamento, a fatura fecha no mês seguinte
  const closesNextMonth = pDay > effectiveClosingDay;
  const closingMonthIndex = pMonth + (closesNextMonth ? 1 : 0);

  // Se o dia de vencimento for maior que o dia de fechamento (ex: fecha dia 5, vence dia 15),
  // a fatura vence no mesmo mês do fechamento. Se for menor ou igual (ex: fecha 25, vence 5),
  // a fatura vence no mês seguinte ao fechamento.
  const dueMonthOffset = dueDay > closingDay ? 0 : 1;
  const targetDueMonthIndex = closingMonthIndex + dueMonthOffset;

  const dueYear = pYear + Math.floor(targetDueMonthIndex / 12);
  const normalizedDueMonth = ((targetDueMonthIndex % 12) + 12) % 12;
  const actualDueDay = clampDayToMonthEnd(dueYear, normalizedDueMonth, dueDay);

  const dueDate = new Date(Date.UTC(dueYear, normalizedDueMonth, actualDueDay, 12, 0, 0));

  return {
    dueDate,
    billingMonth: normalizedDueMonth + 1,
    billingYear: dueYear,
    firstDueMonthIndex: targetDueMonthIndex,
    baseYear: pYear,
  };
}

/**
 * Gera as datas e competências de cada uma das parcelas de uma compra,
 * tratando cartões de crédito, compras à vista ou no débito.
 */
export function calculateInstallmentDates({
  purchaseDate,
  paymentMethod,
  totalInstallments,
  card,
}: CalculateInstallmentDatesOptions): InstallmentDateResult[] {
  const count = Math.max(1, totalInstallments);

  if (paymentMethod !== "credit" || !card) {
    const pYear = purchaseDate.getUTCFullYear();
    const pMonth = purchaseDate.getUTCMonth();
    const pDay = purchaseDate.getUTCDate();

    return [
      {
        installmentNumber: 1,
        dueDate: new Date(Date.UTC(pYear, pMonth, pDay, 12, 0, 0)),
        billingMonth: pMonth + 1,
        billingYear: pYear,
      },
    ];
  }

  const firstCycle = calculateCreditCardBillingCycle({
    purchaseDate,
    closingDay: card.closingDay,
    dueDay: card.dueDay,
  });

  const installments: InstallmentDateResult[] = [];

  for (let i = 0; i < count; i++) {
    const targetMonthIndex = firstCycle.firstDueMonthIndex + i;
    const year = firstCycle.baseYear + Math.floor(targetMonthIndex / 12);
    const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;
    const day = clampDayToMonthEnd(year, normalizedMonth, card.dueDay);

    const dueDate = new Date(Date.UTC(year, normalizedMonth, day, 12, 0, 0));

    installments.push({
      installmentNumber: i + 1,
      dueDate,
      billingMonth: normalizedMonth + 1,
      billingYear: year,
    });
  }

  return installments;
}
