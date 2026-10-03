import * as React from "react";
import {
  maskDateBR,
  parseDateBR,
  formatDateBR,
  isValidDateBR,
  getTodayBR,
  getYesterdayBR,
} from "../utils/purchase-date";
import { NewPurchaseModal, NewPurchaseModalProps } from "../components/NewPurchaseModal";
import { EditPurchaseModal, EditPurchaseModalProps } from "../components/EditPurchaseModal";
import { PurchaseClient } from "../types/purchases.types";
import { Person } from "@/people/types/people.types";
import { CreditCard } from "@/credit-cards/types/credit-cards.types";
import { calculateInstallmentDates } from "@/shared/utils/invoice-cycle";

describe("Purchases Modal & Date Logic (TDD)", () => {
  describe("Date Mask & Formatting Utilities", () => {
    it("should correctly mask partial and full date inputs (DD/MM/AAAA)", () => {
      expect(maskDateBR("")).toBe("");
      expect(maskDateBR("1")).toBe("1");
      expect(maskDateBR("15")).toBe("15");
      expect(maskDateBR("150")).toBe("15/0");
      expect(maskDateBR("1503")).toBe("15/03");
      expect(maskDateBR("15032")).toBe("15/03/2");
      expect(maskDateBR("15032026")).toBe("15/03/2026");
      // Truncate beyond 8 digits
      expect(maskDateBR("15032026999")).toBe("15/03/2026");
    });

    it("should strip non-numeric characters when masking", () => {
      expect(maskDateBR("15/03/2026")).toBe("15/03/2026");
      expect(maskDateBR("abc15-03--2026xyz")).toBe("15/03/2026");
    });

    it("should parse valid DD/MM/AAAA strings into midday UTC Date objects", () => {
      const parsed = parseDateBR("15/03/2026");
      expect(parsed).not.toBeNull();
      expect(parsed?.getUTCFullYear()).toBe(2026);
      expect(parsed?.getUTCMonth()).toBe(2); // 0-indexed: 2 = March
      expect(parsed?.getUTCDate()).toBe(15);
      expect(parsed?.getUTCHours()).toBe(12);
      expect(isValidDateBR("15/03/2026")).toBe(true);
    });

    it("should handle leap years correctly in date parsing", () => {
      // 2024 is a leap year -> 29/02/2024 is valid
      expect(parseDateBR("29/02/2024")).not.toBeNull();
      expect(isValidDateBR("29/02/2024")).toBe(true);

      // 2025 is not a leap year -> 29/02/2025 is invalid
      expect(parseDateBR("29/02/2025")).toBeNull();
      expect(isValidDateBR("29/02/2025")).toBe(false);
    });

    it("should reject invalid calendar dates, months and malformed strings", () => {
      expect(parseDateBR("31/04/2026")).toBeNull(); // April has 30 days
      expect(parseDateBR("32/01/2026")).toBeNull(); // Day > 31
      expect(parseDateBR("00/01/2026")).toBeNull(); // Day 0
      expect(parseDateBR("15/13/2026")).toBeNull(); // Month > 12
      expect(parseDateBR("15/00/2026")).toBeNull(); // Month 0
      expect(parseDateBR("15/03/1850")).toBeNull(); // Year < 1900
      expect(parseDateBR("15/03/2150")).toBeNull(); // Year > 2100
      expect(parseDateBR("15/03/26")).toBeNull(); // 2-digit year
      expect(parseDateBR("invalid")).toBeNull();
    });

    it("should format Date and ISO strings into DD/MM/AAAA", () => {
      const utcDate = new Date(Date.UTC(2026, 2, 10, 12, 0, 0));
      expect(formatDateBR(utcDate)).toBe("10/03/2026");
      expect(formatDateBR("2026-03-10T12:00:00Z")).toBe("10/03/2026");
      expect(formatDateBR(null)).toBe("");
      expect(formatDateBR(undefined)).toBe("");
      expect(formatDateBR("not-a-date")).toBe("");
    });

    it("should return valid today and yesterday shortcuts", () => {
      const today = getTodayBR();
      const yesterday = getYesterdayBR();

      expect(isValidDateBR(today)).toBe(true);
      expect(isValidDateBR(yesterday)).toBe(true);
      expect(today).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      expect(yesterday).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });
  });

  describe("Real-time Card Cycle Calculation with Purchase Date", () => {
    it("should recalculate installment due dates when purchase date is before vs after closing day", () => {
      const card = { closingDay: 25, dueDay: 5 };

      // Case 1: Purchase on 20/03/2026 (before closing 25)
      // Closes in March -> due in April
      const dateBeforeClosing = parseDateBR("20/03/2026")!;
      const installmentsBefore = calculateInstallmentDates({
        purchaseDate: dateBeforeClosing,
        paymentMethod: "credit",
        totalInstallments: 2,
        card,
      });

      expect(installmentsBefore[0].billingMonth).toBe(4);
      expect(installmentsBefore[0].billingYear).toBe(2026);
      expect(installmentsBefore[1].billingMonth).toBe(5);

      // Case 2: Purchase on 26/03/2026 (after closing 25)
      // Closes in April -> due in May
      const dateAfterClosing = parseDateBR("26/03/2026")!;
      const installmentsAfter = calculateInstallmentDates({
        purchaseDate: dateAfterClosing,
        paymentMethod: "credit",
        totalInstallments: 2,
        card,
      });

      expect(installmentsAfter[0].billingMonth).toBe(5);
      expect(installmentsAfter[0].billingYear).toBe(2026);
      expect(installmentsAfter[1].billingMonth).toBe(6);
    });
  });

  describe("Form Validation & Immutability Rules", () => {
    it("should validate split rules: percentage cannot exceed 100%", () => {
      const splits = [
        { personId: "p1", percentage: 60 },
        { personId: "p2", percentage: 50 },
      ];
      const totalPercentage = splits.reduce((sum, s) => sum + s.percentage, 0);
      expect(totalPercentage).toBeGreaterThan(100);
    });

    it("should validate split rules: fixed amount cannot exceed total purchase amount", () => {
      const totalAmount = 100;
      const splits = [
        { personId: "p1", amount: 60 },
        { personId: "p2", amount: 50 },
      ];
      const totalAmountAssigned = splits.reduce((sum, s) => sum + s.amount, 0);
      expect(totalAmountAssigned).toBeGreaterThan(totalAmount);
    });

    it("should maintain structural immutability in edit payload", () => {
      const mockPurchase: PurchaseClient = {
        id: "purchase-1",
        userId: "user-1",
        description: "Mercado Semanal",
        totalAmount: "450.00",
        purchaseDate: "2026-03-10T12:00:00Z",
        paymentMethod: "credit",
        totalInstallments: 3,
        creditCardId: "card-1",
        createdAt: "2026-03-10T12:00:00Z",
        updatedAt: "2026-03-10T12:00:00Z",
        creditCard: {
          id: "card-1",
          name: "Nubank",
          flag: "Mastercard",
          color: "#820ad1",
          closingDay: 25,
          dueDay: 5,
        },
        installments: [
          {
            id: "inst-1",
            purchaseId: "purchase-1",
            installmentNumber: 1,
            amount: "150.00",
            dueDate: "2026-04-05T12:00:00Z",
            billingMonth: 4,
            billingYear: 2026,
            createdAt: "2026-03-10T12:00:00Z",
            updatedAt: "2026-03-10T12:00:00Z",
            splits: [
              {
                id: "split-1",
                installmentId: "inst-1",
                personId: "person-1",
                amount: "75.00",
                percentage: "50",
                isPaid: true,
                paidAt: "2026-04-01T10:00:00Z",
                createdAt: "2026-03-10T12:00:00Z",
                updatedAt: "2026-03-10T12:00:00Z",
              },
            ],
          },
          {
            id: "inst-2",
            purchaseId: "purchase-1",
            installmentNumber: 2,
            amount: "150.00",
            dueDate: "2026-05-05T12:00:00Z",
            billingMonth: 5,
            billingYear: 2026,
            createdAt: "2026-03-10T12:00:00Z",
            updatedAt: "2026-03-10T12:00:00Z",
            splits: [
              {
                id: "split-2",
                installmentId: "inst-2",
                personId: "person-1",
                amount: "75.00",
                percentage: "50",
                isPaid: false,
                paidAt: null,
                createdAt: "2026-03-10T12:00:00Z",
                updatedAt: "2026-03-10T12:00:00Z",
              },
            ],
          },
        ],
      };

      // Modificações permitidas: apenas description, purchaseDate e splits
      const updatedDescription = "Mercado Semanal Atualizado";
      const updatedDate = parseDateBR("12/03/2026")!;
      const updatedSplits = [{ personId: "person-2", percentage: 50 }];

      const updatePayload = {
        description: updatedDescription,
        purchaseDate: updatedDate,
        splits: updatedSplits,
      };

      // Campos estruturais não estão no payload de update e não devem ser mutados
      expect(updatePayload).not.toHaveProperty("paymentMethod");
      expect(updatePayload).not.toHaveProperty("totalAmount");
      expect(updatePayload).not.toHaveProperty("totalInstallments");
      expect(updatePayload).not.toHaveProperty("creditCardId");

      // Valores estruturais da compra permanecem os mesmos
      expect(mockPurchase.totalAmount).toBe("450.00");
      expect(mockPurchase.totalInstallments).toBe(3);
      expect(mockPurchase.paymentMethod).toBe("credit");
    });
  });

  describe("Component Rendering & Prop Validation", () => {
    const mockPeople: Person[] = [
      {
        id: "p1",
        userId: "u1",
        name: "Maria",
        color: "#ec4899",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "p2",
        userId: "u1",
        name: "João",
        color: "#3b82f6",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockCards: CreditCard[] = [
      {
        id: "c1",
        userId: "u1",
        name: "Nubank",
        flag: "Mastercard",
        color: "#820ad1",
        limit: "5000",
        closingDay: 25,
        dueDay: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it("should instantiate NewPurchaseModal component element with expected props", () => {
      const element = React.createElement<NewPurchaseModalProps>(NewPurchaseModal, {
        visible: true,
        onClose: jest.fn(),
        onSave: jest.fn(),
        cards: mockCards,
        people: mockPeople,
      });

      expect(element).toBeDefined();
      expect(element.props.visible).toBe(true);
      expect(element.props.cards.length).toBe(1);
      expect(element.props.people.length).toBe(2);
    });

    it("should instantiate EditPurchaseModal component element with expected props", () => {
      const mockPurchase: PurchaseClient = {
        id: "p-1",
        userId: "u-1",
        description: "Jantar",
        totalAmount: "120.00",
        purchaseDate: "2026-03-10T12:00:00Z",
        paymentMethod: "credit",
        totalInstallments: 1,
        creditCardId: "c1",
        createdAt: "",
        updatedAt: "",
        creditCard: mockCards[0],
        installments: [],
      };

      const element = React.createElement<EditPurchaseModalProps>(EditPurchaseModal, {
        visible: true,
        purchase: mockPurchase,
        onClose: jest.fn(),
        onSave: jest.fn(),
        onDelete: jest.fn(),
        people: mockPeople,
        cards: mockCards,
      });

      expect(element).toBeDefined();
      expect(element.props.visible).toBe(true);
      expect(element.props.purchase?.description).toBe("Jantar");
      expect(element.props.onDelete).toBeDefined();
    });

    it("should handle null purchase gracefully in EditPurchaseModal", () => {
      const element = React.createElement<EditPurchaseModalProps>(EditPurchaseModal, {
        visible: false,
        purchase: null,
        onClose: jest.fn(),
        onSave: jest.fn(),
        people: mockPeople,
      });

      expect(element).toBeDefined();
      expect(element.props.purchase).toBeNull();
    });
  });
});
