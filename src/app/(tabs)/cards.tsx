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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCreditCards } from "@/credit-cards/hooks/use-credit-cards";
import { CreditCardModal } from "@/credit-cards/components/CreditCardModal";
import { CreditCard, CreateCreditCardData } from "@/credit-cards/types/credit-cards.types";
import { Button } from "@/shared/components/Button";
import { Badge } from "@/shared/components/Badge";
import { AnimatedScaleFade } from "@/shared/components/AnimatedScaleFade";

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
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
      <View
        className="border-b border-border bg-card px-6 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) }}
      >
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
        <View className="m-4 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 p-3 flex-row items-center justify-between">
          <Text className="text-xs text-[#FF3B30] flex-1 font-medium">{error}</Text>
          <Button variant="ghost" size="sm" label="Tentar de novo" onPress={fetchCards} />
        </View>
      ) : null}

      {/* List */}
      {isLoading && cards.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#007AFF" />
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
            <RefreshControl refreshing={isLoading} onRefresh={fetchCards} tintColor="#007AFF" />
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
                className="rounded-3xl p-5 shadow-lg justify-between gap-5 border border-white/20 relative overflow-hidden"
                style={{ backgroundColor: item.color }}
              >
                {/* Efeito de brilho de luz superior */}
                <View className="absolute top-0 left-0 right-0 h-24 bg-white/10 rounded-t-3xl" />

                <View className="flex-row items-start justify-between z-10">
                  <View className="flex-1 min-w-0 pr-2">
                    <Text numberOfLines={1} className="text-xl font-bold text-white tracking-wide">
                      {item.name}
                    </Text>
                    {/* Chip metálico Apple Wallet */}
                    <View className="w-10 h-6 rounded-md bg-white/20 border border-white/30 mt-2.5 justify-center px-1">
                      <View className="h-[1px] w-full bg-white/30 my-0.5" />
                      <View className="h-[1px] w-full bg-white/30 my-0.5" />
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2 shrink-0">
                    <View className="bg-black/25 px-2.5 py-1 rounded-full border border-white/15">
                      <Text className="text-xs font-bold text-white uppercase tracking-wider">
                        {item.flag}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-1 bg-black/25 rounded-full p-0.5 border border-white/15">
                      <Pressable
                        onPress={() => handleOpenEdit(item)}
                        className="h-8 w-8 items-center justify-center rounded-full active:scale-95 active:bg-white/20"
                        accessibilityLabel="Editar cartão"
                      >
                        <Pencil size={15} color="#ffffff" />
                      </Pressable>
                      <Pressable
                        onPress={() => handleDelete(item)}
                        className="h-8 w-8 items-center justify-center rounded-full active:scale-95 active:bg-white/20"
                        accessibilityLabel="Excluir cartão"
                      >
                        <Trash2 size={15} color="#FF9999" />
                      </Pressable>
                    </View>
                  </View>
                </View>

                <View className="flex-row items-center justify-between border-t border-white/15 pt-3 z-10 gap-2">
                  <View className="flex-row items-center gap-2 flex-1 min-w-0">
                    <Calendar size={16} color="#ffffff" />
                    <View className="flex-1 min-w-0">
                      <Text numberOfLines={1} className="text-[10px] text-white/70 font-medium">
                        Fechamento / Vencimento
                      </Text>
                      <Text numberOfLines={1} className="text-sm font-bold text-white">
                        Dia {item.closingDay} / Dia {item.dueDay}
                      </Text>
                    </View>
                  </View>

                  {item.limit ? (
                    <View className="items-end shrink-0 max-w-[45%]">
                      <Text numberOfLines={1} className="text-[10px] text-white/70 font-medium">
                        Limite Total
                      </Text>
                      <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                        className="text-sm font-bold text-white tabular-nums"
                      >
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
