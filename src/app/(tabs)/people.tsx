import * as React from "react";
import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator } from "react-native";
import { Users, Plus, Pencil, Trash2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { usePeople } from "@/people/hooks/use-people";
import { Person } from "@/people/types/people.types";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { DeleteConfirmationDialog } from "@/shared/components/DeleteConfirmationDialog";
import { showToast } from "@/shared/utils/toast";

export default function PeopleScreen() {
  const insets = useSafeAreaInsets();
  const { people, isLoading, error, fetchPeople, deletePerson } = usePeople();
  const [personToDelete, setPersonToDelete] = React.useState<Person | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchPeople();
    }, [fetchPeople]),
  );

  const handleOpenCreate = () => {
    router.push("/(modals)/person");
  };

  const handleOpenEdit = (person: Person) => {
    router.push({
      pathname: "/(modals)/person",
      params: { id: person.id },
    });
  };

  const handleDelete = (person: Person) => {
    setPersonToDelete(person);
  };

  const handleConfirmDelete = async () => {
    if (!personToDelete) return;
    try {
      setIsDeleting(true);
      await deletePerson(personToDelete.id);
      showToast.success("Pessoa excluída com sucesso!");
      setPersonToDelete(null);
    } catch (err: unknown) {
      showToast.error("Erro ao excluir pessoa", err instanceof Error ? err.message : undefined);
    } finally {
      setIsDeleting(false);
    }
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
              <View className="flex-row items-center gap-3.5 flex-1 min-w-0 pr-2">
                <View
                  className="h-12 w-12 rounded-full items-center justify-center shadow-md border-2 border-white/20 shrink-0"
                  style={{ backgroundColor: item.color }}
                >
                  <Text className="text-lg font-bold text-white">
                    {(item.name[0] || "P").toUpperCase()}
                  </Text>
                </View>

                <View className="flex-1 min-w-0">
                  <Text
                    className="text-base font-bold text-foreground"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {item.name}
                  </Text>
                  <View className="flex-row items-center gap-1.5 mt-0.5">
                    <View
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text numberOfLines={1} className="text-xs text-muted-foreground font-medium">
                      {item.color.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center gap-1 shrink-0">
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

      <DeleteConfirmationDialog
        isOpen={!!personToDelete}
        onClose={() => setPersonToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Excluir Pessoa"
        itemName={personToDelete?.name}
        description={`Tem certeza que deseja remover ${personToDelete?.name ?? ""}? Esta ação não pode ser desfeita e removerá os vínculos associados.`}
        confirmLabel="Excluir"
      />
    </View>
  );
}
