import * as React from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ModalSheet } from "@/shared/components/ModalSheet";
import { useCreditCards } from "@/credit-cards/hooks/use-credit-cards";
import { CreditCardForm } from "@/credit-cards/components/CreditCardForm";
import { CreateCreditCardData } from "@/credit-cards/types/credit-cards.types";

export default function CardModalScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { cards, createCard, updateCard } = useCreditCards();

  const cardToEdit = React.useMemo(() => {
    if (!id) return null;
    return cards.find((c) => c.id === id) || null;
  }, [id, cards]);

  const handleSave = async (data: CreateCreditCardData) => {
    if (cardToEdit) {
      await updateCard(cardToEdit.id, data);
    } else {
      await createCard(data);
    }
    router.back();
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
