import * as React from "react";
import { useAuth } from "@/auth/hooks/use-auth";
import { creditCardsApiService } from "../services/credit-cards-api.service";
import {
  CreditCard,
  CreateCreditCardData,
  UpdateCreditCardData,
} from "../types/credit-cards.types";

export function useCreditCards() {
  const { token } = useAuth();
  const [cards, setCards] = React.useState<CreditCard[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCards = React.useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await creditCardsApiService.list(token);
      setCards(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar cartões";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const createCard = React.useCallback(
    async (data: CreateCreditCardData): Promise<CreditCard> => {
      if (!token) throw new Error("Usuário não autenticado");
      setError(null);
      const created = await creditCardsApiService.create(token, data);
      setCards((prev) => [...prev, created]);
      return created;
    },
    [token],
  );

  const updateCard = React.useCallback(
    async (id: string, data: UpdateCreditCardData): Promise<CreditCard> => {
      if (!token) throw new Error("Usuário não autenticado");
      setError(null);
      const updated = await creditCardsApiService.update(token, id, data);
      setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    },
    [token],
  );

  const deleteCard = React.useCallback(
    async (id: string): Promise<void> => {
      if (!token) throw new Error("Usuário não autenticado");
      setError(null);
      await creditCardsApiService.delete(token, id);
      setCards((prev) => prev.filter((c) => c.id !== id));
    },
    [token],
  );

  return {
    cards,
    isLoading,
    error,
    fetchCards,
    createCard,
    updateCard,
    deleteCard,
  };
}
