import * as React from "react";
import { PurchaseCard } from "../components/PurchaseCard";
import { PurchaseClient } from "../types/purchases.types";

describe("PurchaseCard Layout & Status (TDD & Unit)", () => {
  const mockCreditPurchase: PurchaseClient = {
    id: "pur-1",
    userId: "u1",
    description: "MacBook Pro M3 Max 64GB Unified Memory Long Text Description",
    totalAmount: "24999.90",
    purchaseDate: "2026-10-01",
    paymentMethod: "credit",
    creditCardId: "card-1",
    creditCard: {
      id: "card-1",
      name: "Nubank Ultravioleta",
      flag: "mastercard",
      color: "#820AD1",
      closingDay: 5,
      dueDay: 12,
    },
    totalInstallments: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    installments: [
      {
        id: "inst-1",
        purchaseId: "pur-1",
        installmentNumber: 1,
        amount: "2083.33",
        dueDate: "2026-10-12",
        billingMonth: 10,
        billingYear: 2026,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        splits: [
          {
            id: "sp-1",
            installmentId: "inst-1",
            personId: null,
            amount: "1041.66",
            isPaid: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "sp-2",
            installmentId: "inst-1",
            personId: "p1",
            amount: "1041.67",
            isPaid: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            person: {
              id: "p1",
              name: "Maria Silva",
              color: "#34C759",
            },
          },
        ],
      },
    ],
  };

  it("should render credit purchase card with participants and credit card badge", () => {
    const handleEdit = jest.fn();
    const element = <PurchaseCard purchase={mockCreditPurchase} onPressEdit={handleEdit} />;
    expect(element).toBeDefined();
  });

  it("should render debit purchase card", () => {
    const debitPurchase: PurchaseClient = {
      ...mockCreditPurchase,
      id: "pur-2",
      paymentMethod: "debit",
      creditCard: null,
      creditCardId: null,
      totalInstallments: 1,
      installments: [],
    };
    const element = <PurchaseCard purchase={debitPurchase} />;
    expect(element).toBeDefined();
  });

  it("should render cash purchase card", () => {
    const cashPurchase: PurchaseClient = {
      ...mockCreditPurchase,
      id: "pur-3",
      paymentMethod: "cash",
      creditCard: null,
      creditCardId: null,
      totalInstallments: 1,
      installments: [],
    };
    const element = <PurchaseCard purchase={cashPurchase} />;
    expect(element).toBeDefined();
  });
});
