import * as React from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ModalSheet } from "@/shared/components/ModalSheet";
import { usePurchases } from "@/purchases/hooks/use-purchases";
import { useCreditCards } from "@/credit-cards/hooks/use-credit-cards";
import { usePeople } from "@/people/hooks/use-people";
import { PurchaseForm } from "@/purchases/components/PurchaseForm";
import { CreatePurchaseData, UpdatePurchaseData } from "@/purchases/types/purchases.types";
import { showToast } from "@/shared/utils/toast";

export default function PurchaseModalScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { purchases, createPurchase, updatePurchase, deletePurchase } = usePurchases();
  const { cards } = useCreditCards();
  const { people } = usePeople();

  const purchaseToEdit = React.useMemo(() => {
    if (!id) return null;
    return purchases.find((p) => p.id === id) || null;
  }, [id, purchases]);

  const handleSaveNew = async (data: CreatePurchaseData) => {
    try {
      await createPurchase(data);
      showToast.success("Compra registrada com sucesso!");
      router.back();
    } catch (err: unknown) {
      showToast.error("Erro ao registrar compra", err instanceof Error ? err.message : undefined);
    }
  };

  const handleSaveEdit = async (purchaseId: string, data: UpdatePurchaseData) => {
    try {
      await updatePurchase(purchaseId, data);
      showToast.success("Compra atualizada com sucesso!");
      router.back();
    } catch (err: unknown) {
      showToast.error("Erro ao atualizar compra", err instanceof Error ? err.message : undefined);
    }
  };

  const handleDelete = async (purchaseId: string) => {
    try {
      await deletePurchase(purchaseId);
      showToast.success("Compra excluída com sucesso!");
      router.back();
    } catch (err: unknown) {
      showToast.error("Erro ao excluir compra", err instanceof Error ? err.message : undefined);
    }
  };

  return (
    <ModalSheet>
      <ModalSheet.Header
        title={purchaseToEdit ? "Editar Compra" : "Nova Compra"}
        subtitle={
          purchaseToEdit
            ? "Edite descrição, data ou ajuste o rateio com pessoas"
            : "Cadastre despesas à vista ou parcele no cartão"
        }
      />
      <PurchaseForm
        purchaseToEdit={purchaseToEdit}
        cards={cards}
        people={people}
        onSaveNew={handleSaveNew}
        onSaveEdit={handleSaveEdit}
        onDelete={handleDelete}
        onCancel={() => router.back()}
      />
    </ModalSheet>
  );
}
