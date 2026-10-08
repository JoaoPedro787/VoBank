import { getBaseApiUrl } from "@/shared/lib/api-config";
import {
  PurchaseClient,
  CreatePurchaseData,
  UpdatePurchaseData,
  InstallmentSplitClient,
  ListPurchasesFilters,
} from "../types/purchases.types";

export const purchasesApiService = {
  async list(token: string, filters?: ListPurchasesFilters): Promise<PurchaseClient[]> {
    const baseUrl = getBaseApiUrl();
    const queryParams = new URLSearchParams();
    if (filters?.month !== undefined) queryParams.append("month", String(filters.month));
    if (filters?.year !== undefined) queryParams.append("year", String(filters.year));
    if (filters?.creditCardId) queryParams.append("creditCardId", filters.creditCardId);
    if (filters?.personId) queryParams.append("personId", filters.personId);
    if (filters?.search) queryParams.append("search", filters.search);

    const queryString = queryParams.toString();
    const url = `${baseUrl}/api/purchases${queryString ? `?${queryString}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Erro ao carregar compras");
    }

    return result as PurchaseClient[];
  },

  async get(token: string, id: string): Promise<PurchaseClient> {
    const baseUrl = getBaseApiUrl();
    const response = await fetch(`${baseUrl}/api/purchases/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Erro ao carregar detalhes da compra");
    }

    return result as PurchaseClient;
  },

  async create(token: string, data: CreatePurchaseData): Promise<PurchaseClient> {
    const baseUrl = getBaseApiUrl();
    const response = await fetch(`${baseUrl}/api/purchases`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Erro ao registrar compra");
    }

    return result as PurchaseClient;
  },

  async update(token: string, id: string, data: UpdatePurchaseData): Promise<PurchaseClient> {
    const baseUrl = getBaseApiUrl();
    const response = await fetch(`${baseUrl}/api/purchases/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Erro ao atualizar compra");
    }

    return result as PurchaseClient;
  },

  async delete(token: string, id: string): Promise<void> {
    const baseUrl = getBaseApiUrl();
    const response = await fetch(`${baseUrl}/api/purchases/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Erro ao excluir compra");
    }
  },

  async toggleSplitPaid(
    token: string,
    splitId: string,
    isPaid: boolean,
  ): Promise<InstallmentSplitClient> {
    const baseUrl = getBaseApiUrl();
    const response = await fetch(`${baseUrl}/api/installments/${splitId}/toggle-paid`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isPaid }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Erro ao atualizar pagamento da parcela");
    }

    return result as InstallmentSplitClient;
  },
};
