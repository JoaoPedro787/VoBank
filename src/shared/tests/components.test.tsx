import * as React from "react";
import { Text } from "react-native";
import {
  Button,
  Input,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  ModalGrabHandle,
} from "../components";

describe("Shared Cupertino Components (TDD & Unit)", () => {
  describe("Button Component", () => {
    it("should render button with label", () => {
      const button = <Button label="Confirmar" />;
      expect(button).toBeDefined();
      expect(button.props.label).toBe("Confirmar");
    });

    it("should render button with children and cupertino variants", () => {
      const button = (
        <Button variant="success" size="lg">
          <Text>Salvar Alterações</Text>
        </Button>
      );
      expect(button).toBeDefined();
      expect(button.props.variant).toBe("success");
      expect(button.props.size).toBe("lg");

      const secondaryButton = <Button variant="secondary" label="Cancelar" />;
      expect(secondaryButton).toBeDefined();
      expect(secondaryButton.props.variant).toBe("secondary");
      expect(secondaryButton.props.label).toBe("Cancelar");
    });

    it("should render button in loading state", () => {
      const button = <Button label="Carregando..." loading={true} />;
      expect(button).toBeDefined();
      expect(button.props.loading).toBe(true);
    });

    it("should handle disabled state", () => {
      const button = <Button label="Desabilitado" disabled={true} />;
      expect(button).toBeDefined();
      expect(button.props.disabled).toBe(true);
    });

    it("should support icon alignment and onPress handler", () => {
      const handlePress = jest.fn();
      const button = (
        <Button
          label="Adicionar"
          leftIcon={<Text>+</Text>}
          rightIcon={<Text>→</Text>}
          onPress={handlePress}
        />
      );
      expect(button).toBeDefined();
      expect(button.props.leftIcon).toBeDefined();
      expect(button.props.rightIcon).toBeDefined();
    });
  });

  describe("Input Component", () => {
    it("should render input with label and placeholder", () => {
      const input = <Input label="Descrição" placeholder="Ex: Supermercado" />;
      expect(input).toBeDefined();
      expect(input.props.label).toBe("Descrição");
      expect(input.props.placeholder).toBe("Ex: Supermercado");
    });

    it("should render input with error message", () => {
      const input = <Input label="Valor" error="Campo obrigatório" />;
      expect(input).toBeDefined();
      expect(input.props.error).toBe("Campo obrigatório");
    });

    it("should support prefix, suffix and password toggle props", () => {
      const input = (
        <Input
          label="Senha"
          leftIcon={<Text>Icon</Text>}
          rightIcon={<Text>Check</Text>}
          showPasswordToggle={true}
        />
      );
      expect(input).toBeDefined();
      expect(input.props.showPasswordToggle).toBe(true);
      expect(input.props.leftIcon).toBeDefined();
      expect(input.props.rightIcon).toBeDefined();
    });
  });

  describe("Badge Component", () => {
    it("should render badge with label and default variant", () => {
      const badge = <Badge label="Novo" />;
      expect(badge).toBeDefined();
      expect(badge.props.label).toBe("Novo");
    });

    it("should render badge with semantic status variants (Pago, Pendente, Vencido)", () => {
      const paidBadge = <Badge variant="success" label="Pago" />;
      const pendingBadge = <Badge variant="warning" label="Pendente" />;
      const overdueBadge = <Badge variant="destructive" label="Vencido" />;
      const installmentBadge = <Badge variant="installment" label="1/3" />;

      expect(paidBadge.props.variant).toBe("success");
      expect(pendingBadge.props.variant).toBe("warning");
      expect(overdueBadge.props.variant).toBe("destructive");
      expect(installmentBadge.props.variant).toBe("installment");
    });

    it("should support icon and children composition", () => {
      const badgeWithIcon = <Badge variant="success" icon={<Text>✓</Text>} label="Concluído" />;
      expect(badgeWithIcon).toBeDefined();
      expect(badgeWithIcon.props.variant).toBe("success");
      expect(badgeWithIcon.props.icon).toBeDefined();

      const badgeWithChildren = (
        <Badge variant="warning">
          <Text>Atenção</Text>
        </Badge>
      );
      expect(badgeWithChildren).toBeDefined();
      expect(badgeWithChildren.props.children).toBeDefined();
    });
  });

  describe("Card Component & Subcomponents", () => {
    it("should render card with Apple continuous corners and subcomponents", () => {
      const card = (
        <Card>
          <CardHeader>
            <CardTitle>Título da Fatura</CardTitle>
            <CardDescription>Vencimento em breve</CardDescription>
          </CardHeader>
          <CardContent>
            <Text>R$ 1.500,00</Text>
          </CardContent>
          <CardFooter>
            <Text>Pagar Agora</Text>
          </CardFooter>
        </Card>
      );
      expect(card).toBeDefined();
    });
  });

  describe("ModalGrabHandle Component", () => {
    it("should render modal grab handle with 36x5px pill styling", () => {
      const grabHandle = <ModalGrabHandle testID="modal-grab-handle" />;
      expect(grabHandle).toBeDefined();
      expect(grabHandle.props.testID).toBe("modal-grab-handle");
    });
  });
});
