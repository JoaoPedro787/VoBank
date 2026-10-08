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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePeople } from "@/people/hooks/use-people";
import { PersonModal } from "@/people/components/PersonModal";
import { Person, CreatePersonData } from "@/people/types/people.types";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";

export default function PeopleScreen() {
  const insets = useSafeAreaInsets();
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
      <View
        className="border-b border-border bg-card px-6 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) }}
      >
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
        <View className="m-4 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 p-3 flex-row items-center justify-between">
          <Text className="text-xs text-[#FF3B30] flex-1 font-medium">{error}</Text>
          <Button variant="ghost" size="sm" label="Tentar de novo" onPress={fetchPeople} />
        </View>
      ) : null}

      {/* List */}
      {isLoading && people.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#007AFF" />
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
            <RefreshControl refreshing={isLoading} onRefresh={fetchPeople} tintColor="#007AFF" />
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
            <Card
              animated
              className="flex-row items-center justify-between p-4 rounded-2xl border-border/70"
            >
              <View className="flex-row items-center gap-3.5 flex-1 pr-2">
                <View
                  className="h-12 w-12 rounded-full items-center justify-center shadow-md border-2 border-white/20"
                  style={{ backgroundColor: item.color }}
                >
                  <Text className="text-lg font-bold text-white">
                    {(item.name[0] || "P").toUpperCase()}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View className="flex-row items-center gap-1.5 mt-0.5">
                    <View
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text className="text-xs text-muted-foreground font-medium">
                      {item.color.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center gap-1">
                <Pressable
                  onPress={() => handleOpenEdit(item)}
                  className="h-9 w-9 items-center justify-center rounded-xl bg-muted/60 active:scale-95 active:opacity-70"
                  accessibilityLabel="Editar pessoa"
                >
                  <Pencil size={16} color="#007AFF" />
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(item)}
                  className="h-9 w-9 items-center justify-center rounded-xl bg-[#FF3B30]/10 active:scale-95 active:opacity-70"
                  accessibilityLabel="Excluir pessoa"
                >
                  <Trash2 size={16} color="#FF3B30" />
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
