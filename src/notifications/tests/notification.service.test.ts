import * as Notifications from "expo-notifications";
import { notificationService } from "../services/notification.service";
import { PurchaseClient } from "@/purchases/types/purchases.types";

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  SchedulableTriggerInputTypes: {
    DATE: "date",
    TIME_INTERVAL: "timeInterval",
    DAILY: "daily",
    WEEKLY: "weekly",
    MONTHLY: "monthly",
    YEARLY: "yearly",
  },
}));

describe("notificationService (TDD)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initNotifications", () => {
    it("should set notification handler and request permissions", async () => {
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });

      await notificationService.initNotifications();

      expect(Notifications.setNotificationHandler).toHaveBeenCalled();
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });
  });

  describe("scheduleSplitNotifications", () => {
    it("should schedule notifications for D-1 and D-0 when both are in the future", async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue("id-123");

      const now = new Date(2026, 9, 10, 12, 0, 0); // 10 de Outubro
      const scheduledIds = await notificationService.scheduleSplitNotifications(
        {
          splitId: "sp-1",
          installmentId: "inst-1",
          purchaseDescription: "Supermercado",
          amount: 150,
          dueDate: "2026-10-15",
        },
        now,
      );

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
      expect(scheduledIds).toEqual(["split-sp-1-d1", "split-sp-1-d0"]);

      // Verifica primeira chamada (D-1)
      expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(1, {
        identifier: "split-sp-1-d1",
        content: {
          title: "Lembrete de Vencimento",
          body: expect.stringContaining("amanhã"),
          data: { splitId: "sp-1", installmentId: "inst-1", type: "due_d1" },
        },
        trigger: {
          type: "date",
          date: expect.any(Date),
        },
      });

      // Verifica segunda chamada (D-0)
      expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(2, {
        identifier: "split-sp-1-d0",
        content: {
          title: "Vencimento Hoje!",
          body: expect.stringContaining("hoje"),
          data: { splitId: "sp-1", installmentId: "inst-1", type: "due_d0" },
        },
        trigger: {
          type: "date",
          date: expect.any(Date),
        },
      });
    });

    it("should not schedule any notifications if split is already paid", async () => {
      const scheduledIds = await notificationService.scheduleSplitNotifications({
        splitId: "sp-2",
        installmentId: "inst-2",
        purchaseDescription: "Restaurante",
        amount: 80,
        dueDate: "2026-10-15",
        isPaid: true,
      });

      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
      expect(scheduledIds).toEqual([]);
    });
  });

  describe("cancelSplitNotifications", () => {
    it("should cancel both D-1 and D-0 notifications for the given splitId", async () => {
      (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockResolvedValue(undefined);

      await notificationService.cancelSplitNotifications("sp-99");

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith("split-sp-99-d1");
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith("split-sp-99-d0");
    });
  });

  describe("schedulePurchaseNotifications", () => {
    it("should schedule notifications for all unpaid splits in a purchase", async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue("notif-id");

      const mockPurchase: PurchaseClient = {
        id: "purch-1",
        userId: "user-1",
        description: "Notebook",
        totalAmount: "3000.00",
        purchaseDate: "2026-10-01",
        paymentMethod: "credit",
        totalInstallments: 2,
        createdAt: "2026-10-01T00:00:00Z",
        updatedAt: "2026-10-01T00:00:00Z",
        installments: [
          {
            id: "inst-1",
            purchaseId: "purch-1",
            installmentNumber: 1,
            amount: "1500.00",
            dueDate: "2026-10-20",
            billingMonth: 10,
            billingYear: 2026,
            createdAt: "2026-10-01T00:00:00Z",
            updatedAt: "2026-10-01T00:00:00Z",
            splits: [
              {
                id: "sp-1-titular",
                installmentId: "inst-1",
                personId: null,
                amount: "1000.00",
                isPaid: true, // Já pago
                createdAt: "2026-10-01T00:00:00Z",
                updatedAt: "2026-10-01T00:00:00Z",
              },
              {
                id: "sp-1-amigo",
                installmentId: "inst-1",
                personId: "person-2",
                amount: "500.00",
                isPaid: false, // Pendente
                createdAt: "2026-10-01T00:00:00Z",
                updatedAt: "2026-10-01T00:00:00Z",
              },
            ],
          },
          {
            id: "inst-2",
            purchaseId: "purch-1",
            installmentNumber: 2,
            amount: "1500.00",
            dueDate: "2026-11-20",
            billingMonth: 11,
            billingYear: 2026,
            createdAt: "2026-10-01T00:00:00Z",
            updatedAt: "2026-10-01T00:00:00Z",
            splits: [
              {
                id: "sp-2-titular",
                installmentId: "inst-2",
                personId: null,
                amount: "1000.00",
                isPaid: false, // Pendente
                createdAt: "2026-10-01T00:00:00Z",
                updatedAt: "2026-10-01T00:00:00Z",
              },
              {
                id: "sp-2-amigo",
                installmentId: "inst-2",
                personId: "person-2",
                amount: "500.00",
                isPaid: false, // Pendente
                createdAt: "2026-10-01T00:00:00Z",
                updatedAt: "2026-10-01T00:00:00Z",
              },
            ],
          },
        ],
      };

      const now = new Date(2026, 9, 1, 10, 0, 0); // 1 de Outubro
      const scheduledIds = await notificationService.schedulePurchaseNotifications(
        mockPurchase,
        now,
      );

      // 3 splits pendentes * 2 alertas cada (D-1 e D-0) = 6 notificações
      expect(scheduledIds).toHaveLength(6);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(6);
    });
  });

  describe("cancelAllNotifications", () => {
    it("should cancel all scheduled notifications", async () => {
      (Notifications.cancelAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(
        undefined,
      );

      await notificationService.cancelAllNotifications();

      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });
  });
});
