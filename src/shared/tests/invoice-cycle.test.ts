import {
  clampDayToMonthEnd,
  calculateCreditCardBillingCycle,
  calculateInstallmentDates,
} from "../utils/invoice-cycle";

describe("Invoice Cycle & Billing Dates Calculation (TDD)", () => {
  describe("clampDayToMonthEnd", () => {
    it("should clamp day to 28 for February in a non-leap year (2025)", () => {
      // Month 1 is February (0-indexed)
      expect(clampDayToMonthEnd(2025, 1, 31)).toBe(28);
      expect(clampDayToMonthEnd(2025, 1, 29)).toBe(28);
      expect(clampDayToMonthEnd(2025, 1, 15)).toBe(15);
    });

    it("should clamp day to 29 for February in a leap year (2024)", () => {
      expect(clampDayToMonthEnd(2024, 1, 31)).toBe(29);
      expect(clampDayToMonthEnd(2024, 1, 29)).toBe(29);
      expect(clampDayToMonthEnd(2024, 1, 10)).toBe(10);
    });

    it("should clamp day to 30 for 30-day months (April, June, Sept, Nov)", () => {
      expect(clampDayToMonthEnd(2025, 3, 31)).toBe(30); // April
      expect(clampDayToMonthEnd(2025, 5, 31)).toBe(30); // June
      expect(clampDayToMonthEnd(2025, 8, 31)).toBe(30); // September
      expect(clampDayToMonthEnd(2025, 10, 31)).toBe(30); // November
    });

    it("should keep day 31 for 31-day months (Jan, Mar, May, Jul, Aug, Oct, Dec)", () => {
      expect(clampDayToMonthEnd(2025, 0, 31)).toBe(31); // January
      expect(clampDayToMonthEnd(2025, 2, 31)).toBe(31); // March
      expect(clampDayToMonthEnd(2025, 4, 31)).toBe(31); // May
      expect(clampDayToMonthEnd(2025, 6, 31)).toBe(31); // July
      expect(clampDayToMonthEnd(2025, 7, 31)).toBe(31); // August
      expect(clampDayToMonthEnd(2025, 9, 31)).toBe(31); // October
      expect(clampDayToMonthEnd(2025, 11, 31)).toBe(31); // December
    });
  });

  describe("calculateCreditCardBillingCycle", () => {
    it("Scenario: Purchase before closing day (dueDay <= closingDay)", () => {
      // Purchase: 20/03/2025 (March = month index 2)
      // Closing: 25, Due: 05
      // Since 20 <= 25, invoice closes 25/03/2025, due 05/04/2025 (next month)
      const purchaseDate = new Date(Date.UTC(2025, 2, 20));
      const firstDue = calculateCreditCardBillingCycle({
        purchaseDate,
        closingDay: 25,
        dueDay: 5,
      });

      expect(firstDue.billingMonth).toBe(4);
      expect(firstDue.billingYear).toBe(2025);
      expect(firstDue.dueDate.getUTCDate()).toBe(5);
      expect(firstDue.dueDate.getUTCMonth()).toBe(3); // April
      expect(firstDue.dueDate.getUTCFullYear()).toBe(2025);
    });

    it("Scenario: Purchase exactly on closing day (dueDay <= closingDay)", () => {
      // Purchase: 25/03/2025
      // Closing: 25, Due: 05
      // 25 <= 25 -> closes on 25/03/2025, due on 05/04/2025
      const purchaseDate = new Date(Date.UTC(2025, 2, 25));
      const firstDue = calculateCreditCardBillingCycle({
        purchaseDate,
        closingDay: 25,
        dueDay: 5,
      });

      expect(firstDue.billingMonth).toBe(4);
      expect(firstDue.billingYear).toBe(2025);
      expect(firstDue.dueDate.getUTCDate()).toBe(5);
    });

    it("Scenario: Purchase after closing day (dueDay <= closingDay)", () => {
      // Purchase: 26/03/2025
      // Closing: 25, Due: 05
      // Since 26 > 25, closes on 25/04/2025, due on 05/05/2025 (May)
      const purchaseDate = new Date(Date.UTC(2025, 2, 26));
      const firstDue = calculateCreditCardBillingCycle({
        purchaseDate,
        closingDay: 25,
        dueDay: 5,
      });

      expect(firstDue.billingMonth).toBe(5);
      expect(firstDue.billingYear).toBe(2025);
      expect(firstDue.dueDate.getUTCDate()).toBe(5);
      expect(firstDue.dueDate.getUTCMonth()).toBe(4); // May
      expect(firstDue.dueDate.getUTCFullYear()).toBe(2025);
    });

    it("Scenario: dueDay > closingDay (due date falls in the same month as closing)", () => {
      // Closing: 05, Due: 15
      // Purchase: 02/05/2025 (<= 5) -> closes 05/05/2025, due 15/05/2025
      const purchaseDate1 = new Date(Date.UTC(2025, 4, 2));
      const due1 = calculateCreditCardBillingCycle({
        purchaseDate: purchaseDate1,
        closingDay: 5,
        dueDay: 15,
      });
      expect(due1.billingMonth).toBe(5);
      expect(due1.billingYear).toBe(2025);
      expect(due1.dueDate.getUTCDate()).toBe(15);
      expect(due1.dueDate.getUTCMonth()).toBe(4);

      // Purchase: 06/05/2025 (> 5) -> closes 05/06/2025, due 15/06/2025
      const purchaseDate2 = new Date(Date.UTC(2025, 4, 6));
      const due2 = calculateCreditCardBillingCycle({
        purchaseDate: purchaseDate2,
        closingDay: 5,
        dueDay: 15,
      });
      expect(due2.billingMonth).toBe(6);
      expect(due2.billingYear).toBe(2025);
      expect(due2.dueDate.getUTCDate()).toBe(15);
      expect(due2.dueDate.getUTCMonth()).toBe(5);
    });

    it("Scenario: Purchase in December transitioning into next year", () => {
      // Purchase: 28/12/2025 (> 25 closing)
      // Closes in Jan 2026, due in Feb 2026
      const purchaseDate = new Date(Date.UTC(2025, 11, 28));
      const due = calculateCreditCardBillingCycle({
        purchaseDate,
        closingDay: 25,
        dueDay: 10,
      });

      expect(due.billingMonth).toBe(2);
      expect(due.billingYear).toBe(2026);
      expect(due.dueDate.getUTCFullYear()).toBe(2026);
      expect(due.dueDate.getUTCMonth()).toBe(1); // Feb
      expect(due.dueDate.getUTCDate()).toBe(10);
    });
  });

  describe("calculateInstallmentDates", () => {
    it("should generate correct sequence of installments for credit purchase", () => {
      // 3 installments, purchase 20/01/2025, closing 25, due 31
      // Installment 1: Jan 20 <= 25 -> Closes Jan 25. Since dueDay (31) > closingDay (25), due Jan 31
      // Installment 2: Feb 28 (2025 non-leap)
      // Installment 3: Mar 31
      const result = calculateInstallmentDates({
        purchaseDate: new Date(Date.UTC(2025, 0, 20)),
        paymentMethod: "credit",
        totalInstallments: 3,
        card: {
          closingDay: 25,
          dueDay: 31,
        },
      });

      expect(result).toHaveLength(3);

      expect(result[0].installmentNumber).toBe(1);
      expect(result[0].billingMonth).toBe(1);
      expect(result[0].billingYear).toBe(2025);
      expect(result[0].dueDate.getUTCDate()).toBe(31);

      expect(result[1].installmentNumber).toBe(2);
      expect(result[1].billingMonth).toBe(2);
      expect(result[1].billingYear).toBe(2025);
      expect(result[1].dueDate.getUTCDate()).toBe(28); // clamped!

      expect(result[2].installmentNumber).toBe(3);
      expect(result[2].billingMonth).toBe(3);
      expect(result[2].billingYear).toBe(2025);
      expect(result[2].dueDate.getUTCDate()).toBe(31);
    });

    it("should properly handle leap year (2024) across February for installments due on day 30", () => {
      // Purchase: 15/01/2024, closing 20, due 30
      // 1: Jan 30, 2024
      // 2: Feb 29, 2024 (leap year clamped to 29)
      // 3: Mar 30, 2024
      // 4: Apr 30, 2024
      const result = calculateInstallmentDates({
        purchaseDate: new Date(Date.UTC(2024, 0, 15)),
        paymentMethod: "credit",
        totalInstallments: 4,
        card: {
          closingDay: 20,
          dueDay: 30,
        },
      });

      expect(result[0].dueDate.getUTCDate()).toBe(30);
      expect(result[0].billingMonth).toBe(1);

      expect(result[1].dueDate.getUTCDate()).toBe(29);
      expect(result[1].billingMonth).toBe(2);

      expect(result[2].dueDate.getUTCDate()).toBe(30);
      expect(result[2].billingMonth).toBe(3);

      expect(result[3].dueDate.getUTCDate()).toBe(30);
      expect(result[3].billingMonth).toBe(4);
    });

    it("should handle cash and debit purchases as 1 installment due on purchase date", () => {
      const purchaseDate = new Date(Date.UTC(2025, 5, 12));
      const cashResult = calculateInstallmentDates({
        purchaseDate,
        paymentMethod: "cash",
        totalInstallments: 1,
      });

      expect(cashResult).toHaveLength(1);
      expect(cashResult[0].installmentNumber).toBe(1);
      expect(cashResult[0].billingMonth).toBe(6);
      expect(cashResult[0].billingYear).toBe(2025);
      expect(cashResult[0].dueDate.getUTCDate()).toBe(12);

      const debitResult = calculateInstallmentDates({
        purchaseDate,
        paymentMethod: "debit",
        totalInstallments: 1,
      });

      expect(debitResult).toHaveLength(1);
      expect(debitResult[0].dueDate.getUTCDate()).toBe(12);
    });
  });
});
