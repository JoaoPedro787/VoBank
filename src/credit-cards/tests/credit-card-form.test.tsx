import * as React from "react";
import { CreditCardForm } from "../components/CreditCardForm";
import { CreditCard } from "../types/credit-cards.types";

describe("CreditCardForm (TDD & Unit)", () => {
  const mockCard: CreditCard = {
    id: "card-1",
    userId: "user-1",
    name: "Nubank Ultravioleta",
    flag: "Mastercard",
    color: "#820AD1",
    limit: "15000",
    closingDay: 25,
    dueDay: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should instantiate CreditCardForm in create mode", () => {
    const handleSave = jest.fn();
    const handleCancel = jest.fn();

    const element = <CreditCardForm onSave={handleSave} onCancel={handleCancel} />;

    expect(element).toBeDefined();
    expect(element.props.cardToEdit).toBeUndefined();
  });

  it("should instantiate CreditCardForm in edit mode with existing card", () => {
    const handleSave = jest.fn();
    const handleCancel = jest.fn();

    const element = (
      <CreditCardForm cardToEdit={mockCard} onSave={handleSave} onCancel={handleCancel} />
    );

    expect(element).toBeDefined();
    expect(element.props.cardToEdit?.name).toBe("Nubank Ultravioleta");
    expect(element.props.cardToEdit?.closingDay).toBe(25);
    expect(element.props.cardToEdit?.dueDay).toBe(5);
  });
});
