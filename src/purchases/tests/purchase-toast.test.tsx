import * as React from "react";
import PurchaseModalScreen from "@/app/(modals)/purchase";
import { router, useLocalSearchParams } from "expo-router";
import { usePurchases } from "../hooks/use-purchases";
import { showToast } from "@/shared/utils/toast";
import { PurchaseFormProps } from "../components/PurchaseForm";

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
}));

jest.mock("../hooks/use-purchases", () => ({
  usePurchases: jest.fn(),
}));

jest.mock("@/credit-cards/hooks/use-credit-cards", () => ({
  useCreditCards: jest.fn(() => ({ cards: [] })),
}));

jest.mock("@/people/hooks/use-people", () => ({
  usePeople: jest.fn(() => ({ people: [] })),
}));

jest.mock("@/shared/utils/toast", () => ({
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("Purchase Modal Toast Integration (TDD)", () => {
  const mockCreatePurchase = jest.fn();
  const mockUpdatePurchase = jest.fn();
  const mockDeletePurchase = jest.fn();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getFormProps = (element: any): PurchaseFormProps => {
    return element.props.children[1].props as PurchaseFormProps;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, "useMemo").mockImplementation(<T,>(fn: () => T): T => fn());
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
    (usePurchases as jest.Mock).mockReturnValue({
      purchases: [
        {
          id: "purchase-123",
          description: "Compras do Mês",
          totalAmount: "300.00",
          purchaseDate: "2026-03-10T12:00:00Z",
          paymentMethod: "credit",
          totalInstallments: 3,
          creditCardId: "card-1",
          createdAt: "",
          updatedAt: "",
          installments: [],
        },
      ],
      createPurchase: mockCreatePurchase,
      updatePurchase: mockUpdatePurchase,
      deletePurchase: mockDeletePurchase,
    });
  });

  it("should trigger success toast and router.back on successful creation", async () => {
    mockCreatePurchase.mockResolvedValueOnce({ id: "new-purchase" });

    const element = PurchaseModalScreen();
    const formProps = getFormProps(element);

    const payload = {
      description: "Nova Compra",
      totalAmount: 150,
      purchaseDate: new Date(),
      paymentMethod: "credit" as const,
      totalInstallments: 1,
      creditCardId: "card-1",
      splits: [],
    };

    await formProps.onSaveNew!(payload);

    expect(mockCreatePurchase).toHaveBeenCalledWith(payload);
    expect(showToast.success).toHaveBeenCalledWith("Compra registrada com sucesso!");
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it("should trigger error toast and not close modal when creation fails", async () => {
    mockCreatePurchase.mockRejectedValueOnce(new Error("Falha na conexão"));

    const element = PurchaseModalScreen();
    const formProps = getFormProps(element);

    const payload = {
      description: "Nova Compra",
      totalAmount: 150,
      purchaseDate: new Date(),
      paymentMethod: "credit" as const,
      totalInstallments: 1,
      creditCardId: "card-1",
      splits: [],
    };

    await formProps.onSaveNew!(payload);

    expect(mockCreatePurchase).toHaveBeenCalledWith(payload);
    expect(showToast.error).toHaveBeenCalledWith("Erro ao registrar compra", "Falha na conexão");
    expect(router.back).not.toHaveBeenCalled();
  });

  it("should trigger success toast and router.back on successful update", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "purchase-123" });
    mockUpdatePurchase.mockResolvedValueOnce({ id: "purchase-123" });

    const element = PurchaseModalScreen();
    const formProps = getFormProps(element);

    const payload = {
      description: "Compra Editada",
      purchaseDate: new Date(),
      splits: [],
    };

    await formProps.onSaveEdit!("purchase-123", payload);

    expect(mockUpdatePurchase).toHaveBeenCalledWith("purchase-123", payload);
    expect(showToast.success).toHaveBeenCalledWith("Compra atualizada com sucesso!");
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it("should trigger error toast and not close modal when update fails", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "purchase-123" });
    mockUpdatePurchase.mockRejectedValueOnce(new Error("Erro ao atualizar"));

    const element = PurchaseModalScreen();
    const formProps = getFormProps(element);

    const payload = {
      description: "Compra Editada",
      purchaseDate: new Date(),
      splits: [],
    };

    await formProps.onSaveEdit!("purchase-123", payload);

    expect(mockUpdatePurchase).toHaveBeenCalledWith("purchase-123", payload);
    expect(showToast.error).toHaveBeenCalledWith("Erro ao atualizar compra", "Erro ao atualizar");
    expect(router.back).not.toHaveBeenCalled();
  });

  it("should trigger success toast and router.back on successful deletion", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "purchase-123" });
    mockDeletePurchase.mockResolvedValueOnce(undefined);

    const element = PurchaseModalScreen();
    const formProps = getFormProps(element);

    await formProps.onDelete!("purchase-123");

    expect(mockDeletePurchase).toHaveBeenCalledWith("purchase-123");
    expect(showToast.success).toHaveBeenCalledWith("Compra excluída com sucesso!");
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it("should trigger error toast and not close modal when deletion fails", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "purchase-123" });
    mockDeletePurchase.mockRejectedValueOnce(new Error("Erro ao excluir"));

    const element = PurchaseModalScreen();
    const formProps = getFormProps(element);

    await formProps.onDelete!("purchase-123");

    expect(mockDeletePurchase).toHaveBeenCalledWith("purchase-123");
    expect(showToast.error).toHaveBeenCalledWith("Erro ao excluir compra", "Erro ao excluir");
    expect(router.back).not.toHaveBeenCalled();
  });
});
