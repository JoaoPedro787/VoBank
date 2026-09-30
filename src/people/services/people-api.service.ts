import { getBaseApiUrl } from "@/shared/lib/api-config";
import { Person, CreatePersonData, UpdatePersonData } from "../types/people.types";

export const peopleApiService = {
  async list(token: string): Promise<Person[]> {
    const baseUrl = getBaseApiUrl();
    const response = await fetch(`${baseUrl}/api/people`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Erro ao carregar pessoas");
    }

    return result as Person[];
  },

  async create(token: string, data: CreatePersonData): Promise<Person> {
    const baseUrl = getBaseApiUrl();
    const response = await fetch(`${baseUrl}/api/people`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Erro ao criar pessoa");
    }

    return result as Person;
  },

  async update(token: string, id: string, data: UpdatePersonData): Promise<Person> {
    const baseUrl = getBaseApiUrl();
    const response = await fetch(`${baseUrl}/api/people/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Erro ao atualizar pessoa");
    }

    return result as Person;
  },

  async delete(token: string, id: string): Promise<void> {
    const baseUrl = getBaseApiUrl();
    const response = await fetch(`${baseUrl}/api/people/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Erro ao excluir pessoa");
    }
  },
};
