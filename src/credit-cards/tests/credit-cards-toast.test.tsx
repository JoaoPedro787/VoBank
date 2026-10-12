import * as React from "react";
import CardModalScreen from "@/app/(modals)/card";
import CardsScreen from "@/app/(tabs)/cards";
import { router, useLocalSearchParams } from "expo-router";
import { useCreditCards } from "../hooks/use-credit-cards";
import { showToast } from "@/shared/utils/toast";
import { CreditCardFormProps } from "../components/CreditCardForm";
import { DeleteConfirmationDialogProps } from "@/shared/components/DeleteConfirmationDialog";

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
  useFocusEffect: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 40, bottom: 20, left: 0, right: 0 }),
}));

jest.mock("../hooks/use-credit-cards", () => ({
  useCreditCards: jest.fn(),
}));

jest.mock("@/shared/utils/toast", () => ({
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("Credit Cards Toast Integration (TDD & Unit)", () => {
  const mockCreateCard = jest.fn();
  const mockUpdateCard = jest.fn();
  const mockDeleteCard = jest.fn();
  const mockFetchCards = jest.fn();

  const mockCards = [
    {
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
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getCardFormProps = (element: any): CreditCardFormProps => {
    return element.props.children[1].props as CreditCardFormProps;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, "useMemo").mockImplementation(<T,>(fn: () => T): T => fn());
    jest.spyOn(React, "useCallback").mockImplementation(<T,>(fn: T): T => fn);
    (jest.spyOn(React, "useState") as jest.Mock).mockImplementation((init: unknown) => [
      typeof init === "function" ? (init as () => unknown)() : init,
      jest.fn(),
    ]);
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
    (useCreditCards as jest.Mock).mockReturnValue({
      cards: mockCards,
      isLoading: false,
      error: null,
      fetchCards: mockFetchCards,
      createCard: mockCreateCard,
      updateCard: mockUpdateCard,
      deleteCard: mockDeleteCard,
    });
  });

  describe("CardModalScreen Toast Feedback", () => {
    it("should trigger success toast and router.back on card creation", async () => {
      mockCreateCard.mockResolvedValueOnce({ id: "card-2" });

      const element = CardModalScreen();
      const formProps = getCardFormProps(element);

      const payload = {
        name: "Inter Black",
        flag: "Mastercard",
        color: "#FF7A00",
        closingDay: 10,
        dueDay: 20,
      };

      await formProps.onSave(payload);

      expect(mockCreateCard).toHaveBeenCalledWith(payload);
      expect(showToast.success).toHaveBeenCalledWith("Cartão cadastrado com sucesso!");
      expect(router.back).toHaveBeenCalledTimes(1);
    });

    it("should trigger error toast and not close modal on creation failure", async () => {
      mockCreateCard.mockRejectedValueOnce(new Error("Erro ao criar cartão no servidor"));

      const element = CardModalScreen();
      const formProps = getCardFormProps(element);

      const payload = {
        name: "Inter Black",
        flag: "Mastercard",
        color: "#FF7A00",
        closingDay: 10,
        dueDay: 20,
      };

      await formProps.onSave(payload);

      expect(mockCreateCard).toHaveBeenCalledWith(payload);
      expect(showToast.error).toHaveBeenCalledWith(
        "Erro ao cadastrar cartão",
        "Erro ao criar cartão no servidor",
      );
      expect(router.back).not.toHaveBeenCalled();
    });

    it("should trigger success toast and router.back on card update", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "card-1" });
      mockUpdateCard.mockResolvedValueOnce({ id: "card-1" });

      const element = CardModalScreen();
      const formProps = getCardFormProps(element);

      const payload = {
        name: "Nubank Ultravioleta Editado",
        flag: "Mastercard",
        color: "#820AD1",
        closingDay: 28,
        dueDay: 7,
      };

      await formProps.onSave(payload);

      expect(mockUpdateCard).toHaveBeenCalledWith("card-1", payload);
      expect(showToast.success).toHaveBeenCalledWith("Cartão atualizado com sucesso!");
      expect(router.back).toHaveBeenCalledTimes(1);
    });

    it("should trigger error toast and not close modal on update failure", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "card-1" });
      mockUpdateCard.mockRejectedValueOnce(new Error("Falha ao salvar edição"));

      const element = CardModalScreen();
      const formProps = getCardFormProps(element);

      const payload = {
        name: "Nubank Ultravioleta Editado",
        flag: "Mastercard",
        color: "#820AD1",
        closingDay: 28,
        dueDay: 7,
      };

      await formProps.onSave(payload);

      expect(mockUpdateCard).toHaveBeenCalledWith("card-1", payload);
      expect(showToast.error).toHaveBeenCalledWith(
        "Erro ao atualizar cartão",
        "Falha ao salvar edição",
      );
      expect(router.back).not.toHaveBeenCalled();
    });
  });

  describe("CardsScreen Tab Deletion Toast Feedback", () => {
    it("should open delete dialog when clicking trash button on card item", () => {
      const mockSetCardToDelete = jest.fn();
      (jest.spyOn(React, "useState") as jest.Mock)
        .mockImplementationOnce(() => [null, mockSetCardToDelete])
        .mockImplementationOnce(() => [false, jest.fn()]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element: any = CardsScreen();
      const flatList = element.props.children[2];
      const renderedCard = flatList.props.renderItem({ item: mockCards[0] });

      const cardContainer = renderedCard.props.children;
      const cardHeader = cardContainer.props.children[1];
      const actionsContainer = cardHeader.props.children[1];
      const buttonsGroup = actionsContainer.props.children[1];
      const trashPressable = buttonsGroup.props.children[1];

      trashPressable.props.onPress();

      expect(mockSetCardToDelete).toHaveBeenCalledWith(mockCards[0]);
    });

    it("should trigger success toast on card deletion", async () => {
      mockDeleteCard.mockResolvedValueOnce(undefined);

      (jest.spyOn(React, "useState") as jest.Mock)
        .mockImplementationOnce(() => [mockCards[0], jest.fn()])
        .mockImplementationOnce(() => [false, jest.fn()]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element: any = CardsScreen();
      const dialogProps = element.props.children[3].props as DeleteConfirmationDialogProps;
      expect(dialogProps.isOpen).toBe(true);
      expect(dialogProps.itemName).toBe("Nubank Ultravioleta");

      await dialogProps.onConfirm();

      expect(mockDeleteCard).toHaveBeenCalledWith("card-1");
      expect(showToast.success).toHaveBeenCalledWith("Cartão excluído com sucesso!");
    });

    it("should trigger error toast on card deletion failure", async () => {
      mockDeleteCard.mockRejectedValueOnce(new Error("Cartão possui parcelas vinculadas"));

      (jest.spyOn(React, "useState") as jest.Mock)
        .mockImplementationOnce(() => [mockCards[0], jest.fn()])
        .mockImplementationOnce(() => [false, jest.fn()]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element: any = CardsScreen();
      const dialogProps = element.props.children[3].props as DeleteConfirmationDialogProps;
      await dialogProps.onConfirm();

      expect(mockDeleteCard).toHaveBeenCalledWith("card-1");
      expect(showToast.error).toHaveBeenCalledWith(
        "Erro ao excluir cartão",
        "Cartão possui parcelas vinculadas",
      );
    });
  });
});
