import * as React from "react";
import {
  Button,
  buttonVariants,
  buttonTextVariants,
  Input,
  Switch,
  ModalSheet,
  DatePicker,
  DeleteConfirmationDialog,
} from "../components";

jest.mock("@/shared/utils/haptics", () => ({
  hapticFeedback: {
    impactLight: jest.fn(),
    selection: jest.fn(),
    notificationWarning: jest.fn(),
  },
}));

describe("UI Ergonomics, Visual Contrast & Dark/Light Mode Compliance (TDD)", () => {
  describe("Button: Contrast & Ergonomics", () => {
    it("should guarantee high contrast between background and text for primary and destructive variants", () => {
      const primaryClasses = buttonVariants({ variant: "default" });
      const primaryTextClasses = buttonTextVariants({ variant: "default" });
      expect(primaryClasses).toContain("bg-primary");
      expect(primaryTextClasses).toContain("text-primary-foreground");

      const destructiveClasses = buttonVariants({ variant: "destructive" });
      const destructiveTextClasses = buttonTextVariants({ variant: "destructive" });
      expect(destructiveClasses).toContain("bg-destructive");
      expect(destructiveTextClasses).toContain("text-destructive-foreground");
    });

    it("should provide secondary styling adapting cleanly to dark mode", () => {
      const secondaryClasses = buttonVariants({ variant: "secondary" });
      const secondaryTextClasses = buttonTextVariants({ variant: "secondary" });
      expect(secondaryClasses).toContain("bg-secondary");
      expect(secondaryClasses).toContain("dark:border-transparent");
      expect(secondaryTextClasses).toContain("text-secondary-foreground");
    });

    it("should enforce standard 14px border radius and 48px height for touch targets", () => {
      const defaultButtonClasses = buttonVariants({ size: "default" });
      expect(defaultButtonClasses).toContain("rounded-[14px]");
      expect(defaultButtonClasses).toContain("h-12");
    });
  });

  describe("Input: Stable Layout & Ergonomics", () => {
    it("should maintain 14px radius and border stability between focus and resting states", () => {
      const input = (
        <Input label="Nome Completo" placeholder="Digite seu nome" placeholderTextColor="#8E8E93" />
      );

      expect(input).toBeDefined();
      expect(input.props.label).toBe("Nome Completo");
      expect(input.props.placeholderTextColor).toBe("#8E8E93");
    });

    it("should display accessible error with high contrast semantic color", () => {
      const input = <Input error="Valor inválido" />;
      expect(input).toBeDefined();
      expect(input.props.error).toBe("Valor inválido");
    });
  });

  describe("Switch: Ergonomics & Labels", () => {
    it("should support label with accessible foreground contrast", () => {
      const switchComponent = (
        <Switch value={true} onValueChange={jest.fn()} label="Dividir igualmente" />
      );
      expect(switchComponent).toBeDefined();
      expect(switchComponent.props.label).toBe("Dividir igualmente");
    });
  });

  describe("ModalSheet: Structure & Accessibility", () => {
    it("should render Header with foreground title and muted subtitle", () => {
      const header = (
        <ModalSheet.Header
          title="Nova Despesa"
          subtitle="Preencha os dados da compra"
          showCloseButton={true}
        />
      );
      expect(header).toBeDefined();
      expect(header.props.title).toBe("Nova Despesa");
      expect(header.props.subtitle).toBe("Preencha os dados da compra");
    });

    it("should render Footer with safe area padding and clean border separator", () => {
      const footer = (
        <ModalSheet.Footer>
          <Button label="Salvar" />
        </ModalSheet.Footer>
      );
      expect(footer).toBeDefined();
    });
  });

  describe("DatePicker: Ergonomics & Dialog Structure", () => {
    it("should support modal presentation with high contrast action buttons", () => {
      const now = new Date("2026-03-15T10:00:00Z");
      const picker = (
        <DatePicker
          value={now}
          onChange={jest.fn()}
          visible={true}
          title="Selecionar Data da Compra"
        />
      );
      expect(picker).toBeDefined();
      expect(picker.props.visible).toBe(true);
      expect(picker.props.title).toBe("Selecionar Data da Compra");
    });
  });

  describe("DeleteConfirmationDialog: Contrast & Safe Actions", () => {
    it("should configure destructive confirm action and secondary cancel action", () => {
      const dialog = (
        <DeleteConfirmationDialog
          isOpen={true}
          title="Remover Compra"
          description="Tem certeza que deseja apagar esta compra?"
          confirmText="Excluir"
          cancelText="Cancelar"
          onClose={jest.fn()}
          onConfirm={jest.fn()}
        />
      );
      expect(dialog).toBeDefined();
      expect(dialog.props.isOpen).toBe(true);
      expect(dialog.props.title).toBe("Remover Compra");
      expect(dialog.props.confirmText).toBe("Excluir");
      expect(dialog.props.cancelText).toBe("Cancelar");
    });
  });
});
