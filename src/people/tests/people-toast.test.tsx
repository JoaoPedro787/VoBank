import * as React from "react";
import PersonModalScreen from "@/app/(modals)/person";
import PeopleScreen from "@/app/(tabs)/people";
import { router, useLocalSearchParams } from "expo-router";
import { usePeople } from "../hooks/use-people";
import { showToast } from "@/shared/utils/toast";
import { PersonFormProps } from "../components/PersonForm";
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

jest.mock("../hooks/use-people", () => ({
  usePeople: jest.fn(),
}));

jest.mock("@/shared/utils/toast", () => ({
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("People Toast Integration (TDD & Unit)", () => {
  const mockCreatePerson = jest.fn();
  const mockUpdatePerson = jest.fn();
  const mockDeletePerson = jest.fn();
  const mockFetchPeople = jest.fn();

  const mockPeople = [
    {
      id: "person-1",
      userId: "user-1",
      name: "Mariana Silva",
      color: "#FF2D55",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getPersonFormProps = (element: any): PersonFormProps => {
    return element.props.children[1].props as PersonFormProps;
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
    (usePeople as jest.Mock).mockReturnValue({
      people: mockPeople,
      isLoading: false,
      error: null,
      fetchPeople: mockFetchPeople,
      createPerson: mockCreatePerson,
      updatePerson: mockUpdatePerson,
      deletePerson: mockDeletePerson,
    });
  });

  describe("PersonModalScreen Toast Feedback", () => {
    it("should trigger success toast and router.back on person creation", async () => {
      mockCreatePerson.mockResolvedValueOnce({ id: "person-2" });

      const element = PersonModalScreen();
      const formProps = getPersonFormProps(element);

      const payload = {
        name: "Carlos Eduardo",
        color: "#34C759",
      };

      await formProps.onSave(payload);

      expect(mockCreatePerson).toHaveBeenCalledWith(payload);
      expect(showToast.success).toHaveBeenCalledWith("Pessoa cadastrada com sucesso!");
      expect(router.back).toHaveBeenCalledTimes(1);
    });

    it("should trigger error toast and not close modal on creation failure", async () => {
      mockCreatePerson.mockRejectedValueOnce(new Error("Erro ao salvar pessoa no servidor"));

      const element = PersonModalScreen();
      const formProps = getPersonFormProps(element);

      const payload = {
        name: "Carlos Eduardo",
        color: "#34C759",
      };

      await formProps.onSave(payload);

      expect(mockCreatePerson).toHaveBeenCalledWith(payload);
      expect(showToast.error).toHaveBeenCalledWith(
        "Erro ao cadastrar pessoa",
        "Erro ao salvar pessoa no servidor",
      );
      expect(router.back).not.toHaveBeenCalled();
    });

    it("should trigger success toast and router.back on person update", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "person-1" });
      mockUpdatePerson.mockResolvedValueOnce({ id: "person-1" });

      const element = PersonModalScreen();
      const formProps = getPersonFormProps(element);

      const payload = {
        name: "Mariana Silva Atualizada",
        color: "#AF52DE",
      };

      await formProps.onSave(payload);

      expect(mockUpdatePerson).toHaveBeenCalledWith("person-1", payload);
      expect(showToast.success).toHaveBeenCalledWith("Pessoa atualizada com sucesso!");
      expect(router.back).toHaveBeenCalledTimes(1);
    });

    it("should trigger error toast and not close modal on update failure", async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "person-1" });
      mockUpdatePerson.mockRejectedValueOnce(new Error("Falha ao atualizar dados"));

      const element = PersonModalScreen();
      const formProps = getPersonFormProps(element);

      const payload = {
        name: "Mariana Silva Atualizada",
        color: "#AF52DE",
      };

      await formProps.onSave(payload);

      expect(mockUpdatePerson).toHaveBeenCalledWith("person-1", payload);
      expect(showToast.error).toHaveBeenCalledWith(
        "Erro ao atualizar pessoa",
        "Falha ao atualizar dados",
      );
      expect(router.back).not.toHaveBeenCalled();
    });
  });

  describe("PeopleScreen Tab Deletion Toast Feedback", () => {
    it("should open delete dialog when clicking trash button on person card", () => {
      const mockSetPersonToDelete = jest.fn();
      (jest.spyOn(React, "useState") as jest.Mock)
        .mockImplementationOnce(() => [null, mockSetPersonToDelete])
        .mockImplementationOnce(() => [false, jest.fn()]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element: any = PeopleScreen();
      const flatList = element.props.children[2];
      const renderedCard = flatList.props.renderItem({ item: mockPeople[0] });

      // Inside Card -> children[1] is action buttons row -> children[1] is trash Pressable
      const actionButtons = renderedCard.props.children[1];
      const trashPressable = actionButtons.props.children[1];

      trashPressable.props.onPress();

      expect(mockSetPersonToDelete).toHaveBeenCalledWith(mockPeople[0]);
    });

    it("should trigger success toast on person deletion", async () => {
      mockDeletePerson.mockResolvedValueOnce(undefined);

      (jest.spyOn(React, "useState") as jest.Mock)
        .mockImplementationOnce(() => [mockPeople[0], jest.fn()])
        .mockImplementationOnce(() => [false, jest.fn()]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element: any = PeopleScreen();
      const dialogProps = element.props.children[3].props as DeleteConfirmationDialogProps;
      expect(dialogProps.isOpen).toBe(true);
      expect(dialogProps.itemName).toBe("Mariana Silva");

      await dialogProps.onConfirm();

      expect(mockDeletePerson).toHaveBeenCalledWith("person-1");
      expect(showToast.success).toHaveBeenCalledWith("Pessoa excluída com sucesso!");
    });

    it("should trigger error toast on person deletion failure", async () => {
      mockDeletePerson.mockRejectedValueOnce(new Error("Pessoa possui rateios pendentes"));

      (jest.spyOn(React, "useState") as jest.Mock)
        .mockImplementationOnce(() => [mockPeople[0], jest.fn()])
        .mockImplementationOnce(() => [false, jest.fn()]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element: any = PeopleScreen();
      const dialogProps = element.props.children[3].props as DeleteConfirmationDialogProps;
      await dialogProps.onConfirm();

      expect(mockDeletePerson).toHaveBeenCalledWith("person-1");
      expect(showToast.error).toHaveBeenCalledWith(
        "Erro ao excluir pessoa",
        "Pessoa possui rateios pendentes",
      );
    });
  });
});
