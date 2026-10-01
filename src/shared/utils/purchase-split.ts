import { InstallmentDateResult } from "./invoice-cycle";

export interface SplitInput {
  personId?: string | null;
  percentage?: number;
  amount?: number;
}

export interface CalculatedInstallmentSplit {
  personId: string | null;
  amount: number;
  percentage?: number;
}

export interface CalculatedInstallment {
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  billingMonth: number;
  billingYear: number;
  splits: CalculatedInstallmentSplit[];
}

export interface CalculatePurchaseSplitsOptions {
  totalAmount: number;
  totalInstallments: number;
  installmentDates: InstallmentDateResult[];
  splits?: SplitInput[];
}

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

/**
 * Divide o valor total da compra em parcelas e rateia cada parcela
 * entre as pessoas envolvidas (titular e amigos), garantindo precisão
 * matemática de centavos tanto na soma das parcelas quanto nos rateios.
 */
export function calculatePurchaseSplitsAndInstallments({
  totalAmount,
  totalInstallments,
  installmentDates,
  splits,
}: CalculatePurchaseSplitsOptions): CalculatedInstallment[] {
  const installmentsCount = Math.max(1, totalInstallments);
  const roundedTotal = round2(totalAmount);

  if (roundedTotal <= 0) {
    throw new Error("O valor total da compra deve ser maior que zero.");
  }

  // 1. Normalizar pessoas e definir o total alvo de cada pessoa na compra
  interface PersonTarget {
    personId: string | null;
    targetTotal: number;
    percentage: number;
  }

  let personTargets: PersonTarget[];

  if (!splits || splits.length === 0) {
    personTargets = [
      {
        personId: null,
        targetTotal: roundedTotal,
        percentage: 100,
      },
    ];
  } else {
    // Determinar se a divisão foi por valor fixo ou percentual
    const hasFixedAmount = splits.some((s) => s.amount != null);

    if (hasFixedAmount) {
      let sumFixed = 0;
      const parsedSplits: PersonTarget[] = [];

      for (const s of splits) {
        if (s.amount != null) {
          const amt = round2(s.amount);
          sumFixed += amt;
          parsedSplits.push({
            personId: s.personId ?? null,
            targetTotal: amt,
            percentage: round2((amt / roundedTotal) * 100),
          });
        }
      }

      if (round2(sumFixed) > roundedTotal) {
        throw new Error("A soma dos valores de divisão excede o valor total da compra.");
      }

      const remainder = round2(roundedTotal - sumFixed);
      if (remainder > 0) {
        const ownerIndex = parsedSplits.findIndex((p) => p.personId === null);
        if (ownerIndex >= 0) {
          parsedSplits[ownerIndex].targetTotal = round2(
            parsedSplits[ownerIndex].targetTotal + remainder,
          );
          parsedSplits[ownerIndex].percentage = round2(
            (parsedSplits[ownerIndex].targetTotal / roundedTotal) * 100,
          );
        } else {
          parsedSplits.push({
            personId: null,
            targetTotal: remainder,
            percentage: round2((remainder / roundedTotal) * 100),
          });
        }
      }

      personTargets = parsedSplits;
    } else {
      // Divisão por porcentagem
      let sumPercentage = 0;
      const parsedSplits: PersonTarget[] = [];

      for (const s of splits) {
        if (s.percentage != null) {
          sumPercentage += s.percentage;
          const target = round2((roundedTotal * s.percentage) / 100);
          parsedSplits.push({
            personId: s.personId ?? null,
            targetTotal: target,
            percentage: s.percentage,
          });
        }
      }

      if (round2(sumPercentage) > 100) {
        throw new Error("A soma das porcentagens de divisão não pode ser superior a 100%.");
      }

      const remainderPct = round2(100 - sumPercentage);
      if (remainderPct > 0) {
        const ownerIndex = parsedSplits.findIndex((p) => p.personId === null);
        if (ownerIndex >= 0) {
          parsedSplits[ownerIndex].percentage = round2(
            parsedSplits[ownerIndex].percentage + remainderPct,
          );
          parsedSplits[ownerIndex].targetTotal = round2(
            (roundedTotal * parsedSplits[ownerIndex].percentage) / 100,
          );
        } else {
          const target = round2((roundedTotal * remainderPct) / 100);
          parsedSplits.push({
            personId: null,
            targetTotal: target,
            percentage: remainderPct,
          });
        }
      }

      // Ajustar centavos para garantir que a soma dos targetTotals seja exatamente roundedTotal
      const totalAllocated = round2(parsedSplits.reduce((acc, p) => acc + p.targetTotal, 0));
      const diff = round2(roundedTotal - totalAllocated);
      if (diff !== 0 && parsedSplits.length > 0) {
        parsedSplits[0].targetTotal = round2(parsedSplits[0].targetTotal + diff);
      }

      personTargets = parsedSplits;
    }
  }

  // 2. Calcular o valor de cada parcela da compra
  const baseInstallment = Math.floor((roundedTotal * 100) / installmentsCount) / 100;
  const installmentRemainderCents = Math.round(
    (roundedTotal - baseInstallment * installmentsCount) * 100,
  );

  const installmentAmounts: number[] = [];
  for (let i = 0; i < installmentsCount; i++) {
    const extraCent = i < installmentRemainderCents ? 0.01 : 0;
    installmentAmounts.push(round2(baseInstallment + extraCent));
  }

  // 3. Para cada pessoa, calcular a divisão em cada parcela
  // matriz: personSplitsPerInstallment[installmentIndex][personIndex]
  const personSplitsMatrix: Array<
    Array<{ personId: string | null; amount: number; percentage: number }>
  > = Array.from({ length: installmentsCount }, () => []);

  for (const person of personTargets) {
    const pBase = Math.floor((person.targetTotal * 100) / installmentsCount) / 100;
    const pRemainderCents = Math.round((person.targetTotal - pBase * installmentsCount) * 100);

    for (let i = 0; i < installmentsCount; i++) {
      const extra = i < pRemainderCents ? 0.01 : 0;
      personSplitsMatrix[i].push({
        personId: person.personId,
        amount: round2(pBase + extra),
        percentage: person.percentage,
      });
    }
  }

  // 4. Garantir que a soma dos splits em cada parcela fecha exatamente o valor da parcela
  for (let i = 0; i < installmentsCount; i++) {
    const currentInstAmount = installmentAmounts[i];
    const splitsSum = round2(personSplitsMatrix[i].reduce((acc, s) => acc + s.amount, 0));
    const discrepancy = round2(currentInstAmount - splitsSum);

    if (discrepancy !== 0 && personSplitsMatrix[i].length > 0) {
      // Ajusta o titular (personId === null) ou o primeiro split
      const targetIndex = personSplitsMatrix[i].findIndex((s) => s.personId === null);
      const indexToAdjust = targetIndex >= 0 ? targetIndex : 0;
      personSplitsMatrix[i][indexToAdjust].amount = round2(
        personSplitsMatrix[i][indexToAdjust].amount + discrepancy,
      );
    }
  }

  // 5. Montar resultado final
  return installmentAmounts.map((instAmt, idx) => {
    const dateInfo = installmentDates[idx] || {
      dueDate: new Date(),
      billingMonth: new Date().getUTCMonth() + 1,
      billingYear: new Date().getUTCFullYear(),
    };

    return {
      installmentNumber: idx + 1,
      amount: instAmt,
      dueDate: dateInfo.dueDate,
      billingMonth: dateInfo.billingMonth,
      billingYear: dateInfo.billingYear,
      splits: personSplitsMatrix[idx].map((s) => ({
        personId: s.personId,
        amount: s.amount,
        percentage: s.percentage,
      })),
    };
  });
}
