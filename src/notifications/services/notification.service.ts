import * as Notifications from "expo-notifications";
import { ScheduleSplitNotificationInput } from "../types/notifications.types";
import {
  getNotificationScheduleForSplit,
  getSplitNotificationIds,
} from "../utils/notification-dates";
import { PurchaseClient } from "@/purchases/types/purchases.types";

export class NotificationService {
  /**
   * Inicializa a configuração de exibição das notificações em primeiro plano e solicita permissões
   */
  async initNotifications(): Promise<boolean> {
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldPresentAlert: true,
          shouldPresentBadge: false,
          shouldPresentSound: true,
        }),
      });

      const { status } = await Notifications.requestPermissionsAsync();
      return status === "granted";
    } catch {
      return false;
    }
  }

  /**
   * Agenda os alertas locais para 1 dia antes (D-1) e no próprio dia (D-0) de vencimento de um split/parcela
   */
  async scheduleSplitNotifications(
    input: ScheduleSplitNotificationInput,
    now: Date = new Date(),
  ): Promise<string[]> {
    if (input.isPaid) {
      return [];
    }

    const schedules = getNotificationScheduleForSplit(input, now);
    const scheduledIds: string[] = [];

    for (const schedule of schedules) {
      try {
        await Notifications.scheduleNotificationAsync({
          identifier: schedule.identifier,
          content: {
            title: schedule.title,
            body: schedule.body,
            data: schedule.data,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: schedule.triggerDate,
          },
        });
        scheduledIds.push(schedule.identifier);
      } catch (err: unknown) {
        // Falha no agendamento individual não deve quebrar o fluxo
        console.warn(`Erro ao agendar notificação ${schedule.identifier}:`, err);
      }
    }

    return scheduledIds;
  }

  /**
   * Agenda notificações locais para todas as parcelas e splits pendentes de uma compra
   */
  async schedulePurchaseNotifications(
    purchase: PurchaseClient,
    now: Date = new Date(),
  ): Promise<string[]> {
    const scheduledIds: string[] = [];

    if (!purchase.installments || purchase.installments.length === 0) {
      return scheduledIds;
    }

    for (const installment of purchase.installments) {
      if (!installment.splits || installment.splits.length === 0) {
        continue;
      }

      for (const split of installment.splits) {
        if (split.isPaid) continue;

        const amountNum = parseFloat(split.amount);
        const splitScheduled = await this.scheduleSplitNotifications(
          {
            splitId: split.id,
            installmentId: installment.id,
            purchaseDescription: purchase.description,
            amount: isNaN(amountNum) ? 0 : amountNum,
            dueDate: installment.dueDate,
            isPaid: split.isPaid,
          },
          now,
        );

        scheduledIds.push(...splitScheduled);
      }
    }

    return scheduledIds;
  }

  /**
   * Cancela os agendamentos de notificação locais vinculados a uma parcela específica
   */
  async cancelSplitNotifications(splitId: string): Promise<void> {
    const ids = getSplitNotificationIds(splitId);
    try {
      await Notifications.cancelScheduledNotificationAsync(ids.d1);
    } catch {
      // Ignorar caso já tenha sido disparada ou cancelada
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(ids.d0);
    } catch {
      // Ignorar
    }
  }

  /**
   * Cancela todas as notificações locais agendadas
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {
      // Ignorar
    }
  }
}

export const notificationService = new NotificationService();
