import * as React from "react";
import { CreditCard } from "@/credit-cards/types/credit-cards.types";
import { Person } from "@/people/types/people.types";
import { PurchaseClient, CreatePurchaseData, UpdatePurchaseData } from "../types/purchases.types";
import { NewPurchaseForm } from "./NewPurchaseForm";
import { EditPurchaseForm } from "./EditPurchaseForm";

export interface PurchaseFormProps {
  purchaseToEdit?: PurchaseClient | null;
  cards: CreditCard[];
  people: Person[];
  onSaveNew?: (data: CreatePurchaseData) => Promise<void>;
  onSaveEdit?: (id: string, data: UpdatePurchaseData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onCancel?: () => void;
}

export function PurchaseForm({
  purchaseToEdit,
  cards,
  people,
  onSaveNew,
  onSaveEdit,
  onDelete,
  onCancel,
}: PurchaseFormProps) {
  if (purchaseToEdit && onSaveEdit) {
    return (
      <EditPurchaseForm
        purchase={purchaseToEdit}
        cards={cards}
        people={people}
        onSave={onSaveEdit}
        onDelete={onDelete}
        onCancel={onCancel}
      />
    );
  }

  if (onSaveNew) {
    return <NewPurchaseForm cards={cards} people={people} onSave={onSaveNew} onCancel={onCancel} />;
  }

  return null;
}
