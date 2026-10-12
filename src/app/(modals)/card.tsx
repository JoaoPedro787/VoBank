import * as React from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ModalSheet } from "@/shared/components/ModalSheet";
import { useCreditCards } from "@/credit-cards/hooks/use-credit-cards";
import { CreditCardForm } from "@/credit-cards/components/CreditCardForm";
import { CreateCreditCardData } from "@/credit-cards/types/credit-cards.types";
import { showToast } from "@/shared/utils/toast";

export default function CardModalScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { cards, createCard, updateCard } = useCreditCards();

  const cardToEdit = React.useMemo(() => {
    if (!id) return null;
    return cards.find((c) => c.id === id) || null;
  }, [id, cards]);

  const handleSave = async (data: CreateCreditCardData) => {
    try {
      if (cardToEdit) {
        await updateCard(cardToEdit.id, data);
        showToast.success("Cartão atualizado com sucesso!");
      } else {
        await createCard(data);
        showToast.success("Cartão cadastrado com sucesso!");
      }
      router.back();
    } catch (err: unknown) {
      showToast.error(
        cardToEdit ? "Erro ao atualizar cartão" : "Erro ao cadastrar cartão",
        err instanceof Error ? err.message : undefined,
      );
    }
  };

  return (
    <ModalSheet>
      <ModalSheet.Header
        title={cardToEdit ? "Editar Cartão" : "Novo Cartão"}
        subtitle="Configure datas de fatura e limites"
      />
      <CreditCardForm cardToEdit={cardToEdit} onSave={handleSave} onCancel={() => router.back()} />
    </ModalSheet>
  );
}
