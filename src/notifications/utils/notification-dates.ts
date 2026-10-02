import {
  NotificationDateSchedule,
  ScheduleSplitNotificationInput,
} from "../types/notifications.types";

/**
 * Faz o parse seguro de uma data de vencimento (string ou Date)
 * retornando { year, month, day } com mês 1-indexed (1 = Janeiro, 12 = Dezembro)
 */
export function parseDueDate(dueDate: string | Date): {
  year: number;
  month: number;
  day: number;
} {
  if (dueDate instanceof Date) {
    return {
      year: dueDate.getFullYear(),
      month: dueDate.getMonth() + 1,
      day: dueDate.getDate(),
    };
  }

  // Se for string no formato YYYY-MM-DD ou ISO
  const isoMatch = dueDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return {
      year: parseInt(isoMatch[1], 10),
      month: parseInt(isoMatch[2], 10),
      day: parseInt(isoMatch[3], 10),
    };
  }

  const d = new Date(dueDate);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

/**
 * Retorna os IDs determinísticos de notificação para uma parcela/split (D-1 e D-0)
 */
export function getSplitNotificationIds(splitId: string): { d1: string; d0: string } {
  return {
    d1: `split-${splitId}-d1`,
    d0: `split-${splitId}-d0`,
  };
}

/**
 * Calcula os agendamentos de notificação locais para D-1 e D-0 às 09:00:00 da manhã.
 * Filtra automaticamente datas que já estejam no passado em relação a `now`.
 */
export function getNotificationScheduleForSplit(
  input: ScheduleSplitNotificationInput,
  now: Date = new Date(),
): NotificationDateSchedule[] {
  if (input.isPaid) {
    return [];
  }

  const { year, month, day } = parseDueDate(input.dueDate);
  const ids = getSplitNotificationIds(input.splitId);

  // Formatar valor em formato pt-BR
  const formattedAmount = input.amount.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const schedules: NotificationDateSchedule[] = [];

  // D-0: Dia do vencimento às 09:00:00 local
  const d0Date = new Date(year, month - 1, day, 9, 0, 0, 0);

  // D-1: 1 dia antes do vencimento às 09:00:00 local
  const d1Date = new Date(year, month - 1, day - 1, 9, 0, 0, 0);

  // Agendamento D-1
  if (d1Date.getTime() > now.getTime()) {
    schedules.push({
      triggerDate: d1Date,
      identifier: ids.d1,
      title: "Lembrete de Vencimento",
      body: `A parcela de "${input.purchaseDescription}" no valor de R$ ${formattedAmount} vence amanhã!`,
      data: {
        splitId: input.splitId,
        installmentId: input.installmentId,
        type: "due_d1",
      },
    });
  }

  // Agendamento D-0
  if (d0Date.getTime() > now.getTime()) {
    schedules.push({
      triggerDate: d0Date,
      identifier: ids.d0,
      title: "Vencimento Hoje!",
      body: `A parcela de "${input.purchaseDescription}" no valor de R$ ${formattedAmount} vence hoje!`,
      data: {
        splitId: input.splitId,
        installmentId: input.installmentId,
        type: "due_d0",
      },
    });
  }

  return schedules;
}
