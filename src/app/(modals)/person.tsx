import * as React from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ModalSheet } from "@/shared/components/ModalSheet";
import { usePeople } from "@/people/hooks/use-people";
import { PersonForm } from "@/people/components/PersonForm";
import { CreatePersonData } from "@/people/types/people.types";
import { showToast } from "@/shared/utils/toast";

export default function PersonModalScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { people, createPerson, updatePerson } = usePeople();

  const personToEdit = React.useMemo(() => {
    if (!id) return null;
    return people.find((p) => p.id === id) || null;
  }, [id, people]);

  const handleSave = async (data: CreatePersonData) => {
    try {
      if (personToEdit) {
        await updatePerson(personToEdit.id, data);
        showToast.success("Pessoa atualizada com sucesso!");
      } else {
        await createPerson(data);
        showToast.success("Pessoa cadastrada com sucesso!");
      }
      router.back();
    } catch (err: unknown) {
      showToast.error(
        personToEdit ? "Erro ao atualizar pessoa" : "Erro ao cadastrar pessoa",
        err instanceof Error ? err.message : undefined,
      );
    }
  };

  return (
    <ModalSheet>
      <ModalSheet.Header
        title={personToEdit ? "Editar Pessoa" : "Nova Pessoa"}
        subtitle="Adicione amigos ou familiares para dividir despesas"
      />
      <PersonForm personToEdit={personToEdit} onSave={handleSave} onCancel={() => router.back()} />
    </ModalSheet>
  );
}
