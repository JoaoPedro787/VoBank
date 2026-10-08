import * as React from "react";
import { CreditCardModal } from "../components/CreditCardModal";
import { CreditCard } from "../types/credit-cards.types";

describe("CreditCardModal Bottom Sheet (TDD & Unit)", () => {
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

  it("should instantiate CreditCardModal in create mode", () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const element = <CreditCardModal visible={true} onClose={handleClose} onSave={handleSave} />;

    expect(element).toBeDefined();
    expect(element.props.visible).toBe(true);
    expect(element.props.cardToEdit).toBeUndefined();
  });

  it("should instantiate CreditCardModal in edit mode with existing card", () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const element = (
      <CreditCardModal
        visible={true}
        onClose={handleClose}
        onSave={handleSave}
        cardToEdit={mockCard}
      />
    );

    expect(element).toBeDefined();
    expect(element.props.visible).toBe(true);
    expect(element.props.cardToEdit?.name).toBe("Nubank Ultravioleta");
    expect(element.props.cardToEdit?.closingDay).toBe(25);
  });
});
