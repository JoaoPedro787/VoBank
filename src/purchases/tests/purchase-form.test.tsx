import * as React from "react";
import { NewPurchaseForm } from "../components/NewPurchaseForm";
import { EditPurchaseForm } from "../components/EditPurchaseForm";
import { PurchaseForm } from "../components/PurchaseForm";
import { PurchaseClient } from "../types/purchases.types";
import { Person } from "@/people/types/people.types";
import { CreditCard } from "@/credit-cards/types/credit-cards.types";

describe("Purchase Forms (TDD & Unit)", () => {
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

  const mockPurchase: PurchaseClient = {
    id: "purchase-1",
    userId: "u1",
    description: "Jantar Especial",
    totalAmount: "180.00",
    purchaseDate: "2026-03-10T12:00:00Z",
    paymentMethod: "credit",
    totalInstallments: 2,
    creditCardId: "c1",
    createdAt: "",
    updatedAt: "",
    creditCard: mockCards[0],
    installments: [],
  };

  it("should instantiate NewPurchaseForm with expected props", () => {
    const handleSave = jest.fn();
    const handleCancel = jest.fn();

    const element = (
      <NewPurchaseForm
        cards={mockCards}
        people={mockPeople}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );

    expect(element).toBeDefined();
    expect(element.props.cards.length).toBe(1);
    expect(element.props.people.length).toBe(2);
  });

  it("should instantiate EditPurchaseForm with expected props", () => {
    const handleSave = jest.fn();
    const handleDelete = jest.fn();
    const handleCancel = jest.fn();

    const element = (
      <EditPurchaseForm
        purchase={mockPurchase}
        cards={mockCards}
        people={mockPeople}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={handleCancel}
      />
    );

    expect(element).toBeDefined();
    expect(element.props.purchase.description).toBe("Jantar Especial");
    expect(element.props.onDelete).toBeDefined();
  });

  it("should instantiate PurchaseForm routing to creation when purchaseToEdit is undefined", () => {
    const handleSaveNew = jest.fn();

    const element = (
      <PurchaseForm cards={mockCards} people={mockPeople} onSaveNew={handleSaveNew} />
    );

    expect(element).toBeDefined();
    expect(element.props.purchaseToEdit).toBeUndefined();
  });

  it("should instantiate PurchaseForm routing to edition when purchaseToEdit is provided", () => {
    const handleSaveEdit = jest.fn();

    const element = (
      <PurchaseForm
        purchaseToEdit={mockPurchase}
        cards={mockCards}
        people={mockPeople}
        onSaveEdit={handleSaveEdit}
      />
    );

    expect(element).toBeDefined();
    expect(element.props.purchaseToEdit?.id).toBe("purchase-1");
  });
});
