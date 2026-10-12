import { getBaseApiUrl } from "@/shared/lib/api-config";
import {
  CreditCard,
  CreateCreditCardData,
  UpdateCreditCardData,
} from "../types/credit-cards.types";

export const creditCardsApiService = {
  async list(token: string): Promise<CreditCard[]> {
    const baseUrl = getBaseApiUrl();
    const response = await fetch(`${baseUrl}/api/cards`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Erro ao carregar cartões");
    }

    return result as CreditCard[];
  },

  async create(token: string, data: CreateCreditCardData): Promise<CreditCard> {
    const baseUrl = getBaseApiUrl();
    const response = await fetch(`${baseUrl}/api/cards`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Erro ao criar cartão");
    }

    return result as CreditCard;
  },

  async update(token: string, id: string, data: UpdateCreditCardData): Promise<CreditCard> {
    const baseUrl = getBaseApiUrl();
    const response = await fetch(`${baseUrl}/api/cards/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Erro ao atualizar cartão");
    }

    return result as CreditCard;
  },

  async delete(token: string, id: string): Promise<void> {
    const baseUrl = getBaseApiUrl();
    const response = await fetch(`${baseUrl}/api/cards/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Erro ao excluir cartão");
    }
  },
};
