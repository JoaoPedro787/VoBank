import * as React from "react";
import { useAuth } from "@/auth/hooks/use-auth";
import { peopleApiService } from "../services/people-api.service";
import { Person, CreatePersonData, UpdatePersonData } from "../types/people.types";

export function usePeople() {
  const { token } = useAuth();
  const [people, setPeople] = React.useState<Person[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchPeople = React.useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await peopleApiService.list(token);
      setPeople(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar pessoas";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  const createPerson = React.useCallback(
    async (data: CreatePersonData): Promise<Person> => {
      if (!token) throw new Error("Usuário não autenticado");
      setError(null);
      const created = await peopleApiService.create(token, data);
      setPeople((prev) => [...prev, created]);
      return created;
    },
    [token],
  );

  const updatePerson = React.useCallback(
    async (id: string, data: UpdatePersonData): Promise<Person> => {
      if (!token) throw new Error("Usuário não autenticado");
      setError(null);
      const updated = await peopleApiService.update(token, id, data);
      setPeople((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    },
    [token],
  );

  const deletePerson = React.useCallback(
    async (id: string): Promise<void> => {
      if (!token) throw new Error("Usuário não autenticado");
      setError(null);
      await peopleApiService.delete(token, id);
      setPeople((prev) => prev.filter((p) => p.id !== id));
    },
    [token],
  );

  return {
    people,
    isLoading,
    error,
    fetchPeople,
    createPerson,
    updatePerson,
    deletePerson,
  };
}
