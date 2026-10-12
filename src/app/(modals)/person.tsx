import * as React from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ModalSheet } from "@/shared/components/ModalSheet";
import { usePeople } from "@/people/hooks/use-people";
import { PersonForm } from "@/people/components/PersonForm";
import { CreatePersonData } from "@/people/types/people.types";

export default function PersonModalScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { people, createPerson, updatePerson } = usePeople();

  const personToEdit = React.useMemo(() => {
    if (!id) return null;
    return people.find((p) => p.id === id) || null;
  }, [id, people]);

  const handleSave = async (data: CreatePersonData) => {
    if (personToEdit) {
      await updatePerson(personToEdit.id, data);
    } else {
      await createPerson(data);
    }
    router.back();
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
