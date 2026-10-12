import * as React from "react";
import { DeleteConfirmationDialog } from "../components/DeleteConfirmationDialog";

describe("DeleteConfirmationDialog (Unit & TDD)", () => {
  it("should return null when isOpen is false", () => {
    const handleClose = jest.fn();
    const handleConfirm = jest.fn();

    const element = (
      <DeleteConfirmationDialog
        isOpen={false}
        title="Excluir Item"
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    );

    expect(element.type(element.props)).toBeNull();
  });

  it("should instantiate with title, description and callbacks when isOpen is true", () => {
    const handleClose = jest.fn();
    const handleConfirm = jest.fn();

    const element = (
      <DeleteConfirmationDialog
        isOpen={true}
        title="Excluir Cartão"
        description="Esta ação não pode ser desfeita."
        confirmText="Sim, excluir"
        cancelText="Voltar"
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    );

    expect(element).toBeDefined();
    expect(element.props.isOpen).toBe(true);
    expect(element.props.title).toBe("Excluir Cartão");
    expect(element.props.description).toBe("Esta ação não pode ser desfeita.");
    expect(element.props.confirmText).toBe("Sim, excluir");
    expect(element.props.cancelText).toBe("Voltar");
  });

  it("should support confirmLabel and itemName fallback props", () => {
    const handleClose = jest.fn();
    const handleConfirm = jest.fn();

    const element = (
      <DeleteConfirmationDialog
        isOpen={true}
        title="Excluir Pessoa"
        itemName="João"
        confirmLabel="Excluir"
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    );

    expect(element).toBeDefined();
    expect(element.props.title).toBe("Excluir Pessoa");
    expect(element.props.itemName).toBe("João");
    expect(element.props.confirmLabel).toBe("Excluir");
  });
});
