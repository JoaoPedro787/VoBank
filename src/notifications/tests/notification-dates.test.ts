import {
  getNotificationScheduleForSplit,
  getSplitNotificationIds,
  parseDueDate,
} from "../utils/notification-dates";

describe("Notification Dates & Schedule Logic (TDD)", () => {
  describe("parseDueDate", () => {
    it("should parse string in YYYY-MM-DD format correctly", () => {
      const parsed = parseDueDate("2026-10-15");
      expect(parsed).toEqual({ year: 2026, month: 10, day: 15 });
    });

    it("should parse ISO date string format correctly", () => {
      const parsed = parseDueDate("2026-03-01T00:00:00.000Z");
      expect(parsed).toEqual({ year: 2026, month: 3, day: 1 });
    });

    it("should parse Date instance correctly", () => {
      const date = new Date(2026, 11, 25); // 25 de Dezembro de 2026
      const parsed = parseDueDate(date);
      expect(parsed).toEqual({ year: 2026, month: 12, day: 25 });
    });
  });

  describe("getSplitNotificationIds", () => {
    it("should return consistent identifier keys for D-1 and D-0", () => {
      const ids = getSplitNotificationIds("split-123");
      expect(ids).toEqual({
        d1: "split-split-123-d1",
        d0: "split-split-123-d0",
      });
    });
  });

  describe("getNotificationScheduleForSplit", () => {
    it("should return empty array if split is already marked as paid", () => {
      const schedules = getNotificationScheduleForSplit({
        splitId: "split-1",
        installmentId: "inst-1",
        purchaseDescription: "Supermercado",
        amount: 150.5,
        dueDate: "2026-10-20",
        isPaid: true,
      });

      expect(schedules).toEqual([]);
    });

    it("should schedule D-1 and D-0 at 09:00:00 when both are in the future", () => {
      // Data de referência: 10 de Outubro de 2026 às 12:00
      const now = new Date(2026, 9, 10, 12, 0, 0);
      const dueDate = "2026-10-15"; // Vencimento em 15 de Outubro

      const schedules = getNotificationScheduleForSplit(
        {
          splitId: "split-10",
          installmentId: "inst-10",
          purchaseDescription: "Supermercado",
          amount: 250,
          dueDate,
        },
        now,
      );

      expect(schedules).toHaveLength(2);

      const d1Schedule = schedules.find((s) => s.data.type === "due_d1")!;
      expect(d1Schedule).toBeDefined();
      expect(d1Schedule.identifier).toBe("split-split-10-d1");
      expect(d1Schedule.title).toBe("Lembrete de Vencimento");
      expect(d1Schedule.body).toContain("Supermercado");
      expect(d1Schedule.body).toContain("250,00");
      expect(d1Schedule.body).toContain("amanhã");
      // D-1 deve ser 14 de Outubro às 09:00:00
      expect(d1Schedule.triggerDate.getFullYear()).toBe(2026);
      expect(d1Schedule.triggerDate.getMonth()).toBe(9); // Outubro (0-indexed: 9)
      expect(d1Schedule.triggerDate.getDate()).toBe(14);
      expect(d1Schedule.triggerDate.getHours()).toBe(9);
      expect(d1Schedule.triggerDate.getMinutes()).toBe(0);

      const d0Schedule = schedules.find((s) => s.data.type === "due_d0")!;
      expect(d0Schedule).toBeDefined();
      expect(d0Schedule.identifier).toBe("split-split-10-d0");
      expect(d0Schedule.title).toBe("Vencimento Hoje!");
      expect(d0Schedule.body).toContain("Supermercado");
      expect(d0Schedule.body).toContain("hoje");
      // D-0 deve ser 15 de Outubro às 09:00:00
      expect(d0Schedule.triggerDate.getFullYear()).toBe(2026);
      expect(d0Schedule.triggerDate.getMonth()).toBe(9);
      expect(d0Schedule.triggerDate.getDate()).toBe(15);
      expect(d0Schedule.triggerDate.getHours()).toBe(9);
      expect(d0Schedule.triggerDate.getMinutes()).toBe(0);
    });

    it("should omit D-1 if D-1 is already in the past, but keep D-0 if D-0 is in the future", () => {
      // Now: 14 de Outubro às 10:00 (depois de D-1 às 09:00)
      const now = new Date(2026, 9, 14, 10, 0, 0);
      const dueDate = "2026-10-15";

      const schedules = getNotificationScheduleForSplit(
        {
          splitId: "split-11",
          installmentId: "inst-11",
          purchaseDescription: "Academia",
          amount: 110,
          dueDate,
        },
        now,
      );

      expect(schedules).toHaveLength(1);
      expect(schedules[0].data.type).toBe("due_d0");
      expect(schedules[0].identifier).toBe("split-split-11-d0");
    });

    it("should return empty array if both D-1 and D-0 are already in the past", () => {
      // Now: 15 de Outubro às 15:00
      const now = new Date(2026, 9, 15, 15, 0, 0);
      const dueDate = "2026-10-15";

      const schedules = getNotificationScheduleForSplit(
        {
          splitId: "split-12",
          installmentId: "inst-12",
          purchaseDescription: "Cinema",
          amount: 50,
          dueDate,
        },
        now,
      );

      expect(schedules).toEqual([]);
    });

    it("should handle month boundary correctly (e.g. 1st of March)", () => {
      // Vencimento em 01 de Março de 2026 -> D-1 deve ser 28 de Fevereiro (2026 não é bissexto)
      const now = new Date(2026, 1, 20, 10, 0, 0);
      const dueDate = "2026-03-01";

      const schedules = getNotificationScheduleForSplit(
        {
          splitId: "split-mar",
          installmentId: "inst-mar",
          purchaseDescription: "Aluguel",
          amount: 1200,
          dueDate,
        },
        now,
      );

      expect(schedules).toHaveLength(2);
      const d1Schedule = schedules.find((s) => s.data.type === "due_d1")!;
      expect(d1Schedule.triggerDate.getMonth()).toBe(1); // Fevereiro
      expect(d1Schedule.triggerDate.getDate()).toBe(28);
    });
  });
});
