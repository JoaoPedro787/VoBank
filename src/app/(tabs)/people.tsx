import * as React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Users, Plus, Pencil, Trash2 } from "lucide-react-native";
import { usePeople } from "@/people/hooks/use-people";
import { PersonModal } from "@/people/components/PersonModal";
import { Person, CreatePersonData } from "@/people/types/people.types";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";

export default function PeopleScreen() {
  const { people, isLoading, error, fetchPeople, createPerson, updatePerson, deletePerson } =
    usePeople();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [personToEdit, setPersonToEdit] = React.useState<Person | null>(null);

  const handleOpenCreate = () => {
    setPersonToEdit(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (person: Person) => {
    setPersonToEdit(person);
    setModalVisible(true);
  };

  const handleSave = async (data: CreatePersonData) => {
    if (personToEdit) {
      await updatePerson(personToEdit.id, data);
    } else {
      await createPerson(data);
    }
  };

  const handleDelete = (person: Person) => {
    Alert.alert("Excluir Pessoa", `Tem certeza que deseja remover ${person.name}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await deletePerson(person.id);
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="border-b border-border bg-card px-6 pt-14 pb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl font-bold tracking-tight text-foreground">Pessoas</Text>
              <Badge variant="secondary" label={String(people.length)} />
            </View>
            <Text className="text-sm text-muted-foreground mt-0.5">
              Perfis para dividir compras e faturas
            </Text>
          </View>

          <Button size="sm" className="flex-row items-center gap-1.5" onPress={handleOpenCreate}>
            <Plus size={16} color="#ffffff" />
            <Text className="text-sm font-semibold text-primary-foreground">Nova</Text>
          </Button>
        </View>
      </View>

      {/* Error state banner */}
      {error ? (
        <View className="m-4 rounded-xl bg-destructive/10 p-3 flex-row items-center justify-between">
          <Text className="text-xs text-destructive flex-1 font-medium">{error}</Text>
          <Button variant="ghost" size="sm" label="Tentar de novo" onPress={fetchPeople} />
        </View>
      ) : null}

      {/* List */}
      {isLoading && people.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={people}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 16,
            gap: 12,
            flexGrow: people.length === 0 ? 1 : undefined,
          }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchPeople} tintColor="#3B82F6" />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-6 py-12">
              <View className="h-16 w-16 rounded-full bg-accent/60 items-center justify-center mb-4">
                <Users size={32} color="#71717a" />
              </View>
              <Text className="text-lg font-bold text-foreground text-center">
                Nenhuma pessoa cadastrada
              </Text>
              <Text className="text-sm text-muted-foreground text-center mt-1 mb-6">
                Cadastre amigos, familiares ou pessoas com quem você divide despesas no cartão.
              </Text>
              <Button label="Adicionar Primeira Pessoa" onPress={handleOpenCreate} />
            </View>
          }
          renderItem={({ item }) => (
            <Card animated className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3 flex-1">
                <View
                  className="h-12 w-12 rounded-full items-center justify-center shadow-sm"
                  style={{ backgroundColor: item.color }}
                >
                  <Text className="text-lg font-bold text-white">
                    {(item.name[0] || "P").toUpperCase()}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-xs text-muted-foreground">{item.color.toUpperCase()}</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-1">
                <Pressable
                  onPress={() => handleOpenEdit(item)}
                  className="h-9 w-9 items-center justify-center rounded-lg active:bg-accent"
                >
                  <Pencil size={18} color="#71717a" />
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(item)}
                  className="h-9 w-9 items-center justify-center rounded-lg active:bg-destructive/10"
                >
                  <Trash2 size={18} color="#ef4444" />
                </Pressable>
              </View>
            </Card>
          )}
        />
      )}

      {/* Modal */}
      <PersonModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        personToEdit={personToEdit}
      />
    </View>
  );
}
