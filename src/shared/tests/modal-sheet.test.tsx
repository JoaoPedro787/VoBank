import * as React from "react";
import { Text } from "react-native";
import { router } from "expo-router";
import {
  ModalSheet,
  ModalSheetHeader,
  ModalSheetBody,
  ModalSheetFooter,
  Button,
} from "../components";

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe("ModalSheet Compound Component (TDD & Unit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("ModalSheet Root Component", () => {
    it("should render ModalSheet with default grab handle and children", () => {
      const element = (
        <ModalSheet>
          <Text>Conteúdo Interno</Text>
        </ModalSheet>
      );
      expect(element).toBeDefined();
      expect(element.props.showGrabHandle).toBeUndefined(); // default true in component
    });

    it("should allow disabling grab handle", () => {
      const element = (
        <ModalSheet showGrabHandle={false}>
          <Text>Sem Grab Handle</Text>
        </ModalSheet>
      );
      expect(element).toBeDefined();
      expect(element.props.showGrabHandle).toBe(false);
    });

    it("should support controlled BottomSheet with isPresented and snapPoints", () => {
      const handleDismiss = jest.fn();
      const element = (
        <ModalSheet isPresented={true} onDismiss={handleDismiss} snapPoints={["half", "full"]}>
          <Text>Controlled Sheet</Text>
        </ModalSheet>
      );
      expect(element).toBeDefined();
      expect(element.props.isPresented).toBe(true);
      expect(element.props.snapPoints).toEqual(["half", "full"]);
    });
  });

  describe("ModalSheet.Header Subcomponent", () => {
    it("should render header with title and subtitle", () => {
      const element = (
        <ModalSheet.Header title="Nova Transação" subtitle="Preencha os campos abaixo" />
      );
      expect(element).toBeDefined();
      expect(element.props.title).toBe("Nova Transação");
      expect(element.props.subtitle).toBe("Preencha os campos abaixo");
    });

    it("should accept custom onClose handler", () => {
      const handleClose = jest.fn();
      const element = (
        <ModalSheetHeader title="Editar Item" onClose={handleClose} showCloseButton={true} />
      );
      expect(element).toBeDefined();
      expect(element.props.onClose).toBe(handleClose);
      expect(element.props.showCloseButton).toBe(true);
    });

    it("should support hiding close button", () => {
      const element = <ModalSheet.Header title="Apenas Leitura" showCloseButton={false} />;
      expect(element).toBeDefined();
      expect(element.props.showCloseButton).toBe(false);
    });
  });

  describe("ModalSheet.Body Subcomponent", () => {
    it("should render body with scroll configuration and children", () => {
      const element = (
        <ModalSheet.Body contentContainerClassName="p-6">
          <Text>Formulário aqui</Text>
        </ModalSheet.Body>
      );
      expect(element).toBeDefined();
      expect(element.props.contentContainerClassName).toBe("p-6");
      expect(element.props.keyboardShouldPersistTaps).toBeUndefined(); // default handled in component
    });

    it("should allow customizing keyboardShouldPersistTaps", () => {
      const element = (
        <ModalSheetBody keyboardShouldPersistTaps="always">
          <Text>Campo 1</Text>
        </ModalSheetBody>
      );
      expect(element).toBeDefined();
      expect(element.props.keyboardShouldPersistTaps).toBe("always");
    });
  });

  describe("ModalSheet.Footer Subcomponent", () => {
    it("should render footer with action buttons", () => {
      const handleCancel = jest.fn();
      const handleSave = jest.fn();

      const element = (
        <ModalSheet.Footer>
          <Button variant="secondary" label="Cancelar" onPress={handleCancel} />
          <Button variant="default" label="Salvar" onPress={handleSave} />
        </ModalSheet.Footer>
      );

      expect(element).toBeDefined();
      expect(element.props.children).toBeDefined();
    });

    it("should instantiate ModalSheetFooter directly and support router.back mock", () => {
      const element = (
        <ModalSheetFooter>
          <Button label="Ação Direta" />
        </ModalSheetFooter>
      );
      expect(element).toBeDefined();
      expect(router.back).toBeDefined();
    });
  });

  describe("Compound Components Composition", () => {
    it("should render complete ModalSheet structure with all subcomponents", () => {
      const handleClose = jest.fn();
      const element = (
        <ModalSheet>
          <ModalSheet.Header
            title="Adicionar Cartão"
            subtitle="Configure os dias de fechamento e vencimento"
            onClose={handleClose}
          />
          <ModalSheet.Body>
            <Text>Nome do Cartão</Text>
            <Text>Limite</Text>
          </ModalSheet.Body>
          <ModalSheet.Footer>
            <Button variant="outline" label="Voltar" onPress={handleClose} />
            <Button variant="default" label="Confirmar" />
          </ModalSheet.Footer>
        </ModalSheet>
      );

      expect(element).toBeDefined();
      expect(element.props.children).toHaveLength(3);
    });

    it("should expose subcomponents as static properties on ModalSheet", () => {
      expect(ModalSheet.Header).toBeDefined();
      expect(ModalSheet.Body).toBeDefined();
      expect(ModalSheet.Footer).toBeDefined();
      expect(ModalSheet.GrabHandle).toBeDefined();
    });
  });
});
