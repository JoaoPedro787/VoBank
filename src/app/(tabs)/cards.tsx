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
import { CreditCard as CardIcon, Plus, Pencil, Trash2, Calendar } from "lucide-react-native";
import { useCreditCards } from "@/credit-cards/hooks/use-credit-cards";
import { CreditCardModal } from "@/credit-cards/components/CreditCardModal";
import { CreditCard, CreateCreditCardData } from "@/credit-cards/types/credit-cards.types";
import { Button } from "@/shared/components/Button";
import { Badge } from "@/shared/components/Badge";
import { AnimatedScaleFade } from "@/shared/components/AnimatedScaleFade";

export default function CardsScreen() {
  const { cards, isLoading, error, fetchCards, createCard, updateCard, deleteCard } =
    useCreditCards();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [cardToEdit, setCardToEdit] = React.useState<CreditCard | null>(null);

  const handleOpenCreate = () => {
    setCardToEdit(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (card: CreditCard) => {
    setCardToEdit(card);
    setModalVisible(true);
  };

  const handleSave = async (data: CreateCreditCardData) => {
    if (cardToEdit) {
      await updateCard(cardToEdit.id, data);
    } else {
      await createCard(data);
    }
  };

  const handleDelete = (card: CreditCard) => {
    Alert.alert("Excluir Cartão", `Tem certeza que deseja remover o cartão ${card.name}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await deleteCard(card.id);
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
              <Text className="text-2xl font-bold tracking-tight text-foreground">Cartões</Text>
              <Badge variant="secondary" label={String(cards.length)} />
            </View>
            <Text className="text-sm text-muted-foreground mt-0.5">
              Controle de fechamento, vencimento e faturas
            </Text>
          </View>

          <Button size="sm" className="flex-row items-center gap-1.5" onPress={handleOpenCreate}>
            <Plus size={16} color="#ffffff" />
            <Text className="text-sm font-semibold text-primary-foreground">Novo</Text>
          </Button>
        </View>
      </View>

      {/* Error state */}
      {error ? (
        <View className="m-4 rounded-xl bg-destructive/10 p-3 flex-row items-center justify-between">
          <Text className="text-xs text-destructive flex-1 font-medium">{error}</Text>
          <Button variant="ghost" size="sm" label="Tentar de novo" onPress={fetchCards} />
        </View>
      ) : null}

      {/* List */}
      {isLoading && cards.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 16,
            gap: 16,
            flexGrow: cards.length === 0 ? 1 : undefined,
          }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchCards} tintColor="#3B82F6" />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-6 py-12">
              <View className="h-16 w-16 rounded-full bg-accent/60 items-center justify-center mb-4">
                <CardIcon size={32} color="#71717a" />
              </View>
              <Text className="text-lg font-bold text-foreground text-center">
                Nenhum cartão cadastrado
              </Text>
              <Text className="text-sm text-muted-foreground text-center mt-1 mb-6">
                Cadastre seus cartões de crédito com dia de fechamento e vencimento para que o app
                organize as parcelas na fatura certa.
              </Text>
              <Button label="Adicionar Primeiro Cartão" onPress={handleOpenCreate} />
            </View>
          }
          renderItem={({ item }) => (
            <AnimatedScaleFade duration={180}>
              <View
                className="rounded-3xl p-5 shadow-sm justify-between gap-5"
                style={{ backgroundColor: item.color }}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="text-xl font-bold text-white tracking-wide">{item.name}</Text>
                    <Text className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-0.5">
                      {item.flag}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-1.5 bg-black/20 rounded-full px-2 py-1">
                    <Pressable
                      onPress={() => handleOpenEdit(item)}
                      className="h-8 w-8 items-center justify-center rounded-full active:bg-white/20"
                    >
                      <Pencil size={16} color="#ffffff" />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(item)}
                      className="h-8 w-8 items-center justify-center rounded-full active:bg-white/20"
                    >
                      <Trash2 size={16} color="#fca5a5" />
                    </Pressable>
                  </View>
                </View>

                <View className="flex-row items-center justify-between border-t border-white/15 pt-3">
                  <View className="flex-row items-center gap-2">
                    <Calendar size={18} color="#ffffff" />
                    <View>
                      <Text className="text-[11px] text-white/70">Fechamento / Vencimento</Text>
                      <Text className="text-sm font-bold text-white">
                        Dia {item.closingDay} / Dia {item.dueDay}
                      </Text>
                    </View>
                  </View>

                  {item.limit ? (
                    <View className="items-end">
                      <Text className="text-[11px] text-white/70">Limite Total</Text>
                      <Text className="text-sm font-bold text-white">
                        R${" "}
                        {parseFloat(item.limit).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </AnimatedScaleFade>
          )}
        />
      )}

      {/* Modal */}
      <CreditCardModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        cardToEdit={cardToEdit}
      />
    </View>
  );
}
