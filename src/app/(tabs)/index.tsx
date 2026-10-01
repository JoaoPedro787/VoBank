import * as React from "react";
import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Plus, ShoppingBag, CheckCircle2, Clock, LogOut } from "lucide-react-native";
import { useAuth } from "@/auth/hooks/use-auth";
import { usePurchases } from "@/purchases/hooks/use-purchases";
import { useCreditCards } from "@/credit-cards/hooks/use-credit-cards";
import { usePeople } from "@/people/hooks/use-people";
import { NewPurchaseModal } from "@/purchases/components/NewPurchaseModal";
import { CreatePurchaseData, PurchaseClient } from "@/purchases/types/purchases.types";
import { Button } from "@/shared/components/Button";
import { Badge } from "@/shared/components/Badge";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { purchases, isLoading, error, fetchPurchases, createPurchase, toggleSplitPaid } =
    usePurchases();
  const { cards } = useCreditCards();
  const { people } = usePeople();

  const [modalVisible, setModalVisible] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const handleSavePurchase = async (data: CreatePurchaseData) => {
    await createPurchase(data);
  };

  const handleToggleSplit = async (splitId: string, currentPaid: boolean) => {
    await toggleSplitPaid(splitId, !currentPaid);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="border-b border-border bg-card px-6 pt-14 pb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-medium text-muted-foreground">
              Olá, {user?.name || "Usuário"}
            </Text>
            <Text className="text-2xl font-bold tracking-tight text-foreground">
              Minhas Finanças
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Button
              size="sm"
              className="flex-row items-center gap-1.5"
              onPress={() => setModalVisible(true)}
            >
              <Plus size={16} color="#ffffff" />
              <Text className="text-sm font-semibold text-primary-foreground">Nova Compra</Text>
            </Button>

            <Pressable
              onPress={handleLogout}
              className="h-9 w-9 items-center justify-center rounded-xl bg-muted active:opacity-70"
            >
              <LogOut size={16} color="#71717a" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Error state */}
      {error ? (
        <View className="m-4 rounded-xl bg-destructive/10 p-3 flex-row items-center justify-between">
          <Text className="text-xs text-destructive flex-1 font-medium">{error}</Text>
          <Button variant="ghost" size="sm" label="Tentar de novo" onPress={fetchPurchases} />
        </View>
      ) : null}

      {/* Purchases List */}
      {isLoading && purchases.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={purchases}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 16,
            gap: 12,
            flexGrow: purchases.length === 0 ? 1 : undefined,
          }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchPurchases} tintColor="#3B82F6" />
          }
          ListHeaderComponent={
            purchases.length > 0 ? (
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-muted-foreground">
                  Lançamentos Recentes ({purchases.length})
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-6 py-16">
              <View className="h-16 w-16 rounded-full bg-accent/60 items-center justify-center mb-4">
                <ShoppingBag size={32} color="#71717a" />
              </View>
              <Text className="text-lg font-bold text-foreground text-center">
                Nenhuma compra registrada
              </Text>
              <Text className="text-sm text-muted-foreground text-center mt-1 mb-6">
                Cadastre suas compras à vista ou parceladas no cartão e divida valores com seus
                amigos.
              </Text>
              <Button label="Registrar Primeira Compra" onPress={() => setModalVisible(true)} />
            </View>
          }
          renderItem={({ item }: { item: PurchaseClient }) => {
            const isCredit = item.paymentMethod === "credit";
            const dateStr = new Date(item.purchaseDate).toLocaleDateString("pt-BR", {
              timeZone: "UTC",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

            return (
              <View className="rounded-2xl border border-border bg-card p-4 shadow-sm gap-3">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-2">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-base font-bold text-foreground">
                        {item.description}
                      </Text>
                      <Badge
                        variant={isCredit ? "default" : "secondary"}
                        label={isCredit ? `${item.totalInstallments}x` : item.paymentMethod}
                      />
                    </View>
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      {dateStr}
                      {item.creditCard ? ` • ${item.creditCard.name}` : ""}
                    </Text>
                  </View>

                  <Text className="text-base font-bold text-foreground">
                    R$ {parseFloat(item.totalAmount).toFixed(2)}
                  </Text>
                </View>

                {/* Parcelas e Splits */}
                {item.installments && item.installments.length > 0 ? (
                  <View className="gap-2 pt-2 border-t border-border/50">
                    {item.installments.map((inst) => {
                      const instDueDate = new Date(inst.dueDate).toLocaleDateString("pt-BR", {
                        timeZone: "UTC",
                        day: "2-digit",
                        month: "2-digit",
                      });

                      return (
                        <View key={inst.id} className="rounded-xl bg-muted/40 p-2.5 gap-2">
                          <View className="flex-row items-center justify-between">
                            <Text className="text-xs font-semibold text-foreground">
                              Parcela {inst.installmentNumber}/{item.totalInstallments} • Venc.{" "}
                              {instDueDate}
                            </Text>
                            <Text className="text-xs font-bold text-foreground">
                              R$ {parseFloat(inst.amount).toFixed(2)}
                            </Text>
                          </View>

                          {/* Splits por pessoa */}
                          {inst.splits && inst.splits.length > 0 ? (
                            <View className="gap-1.5 pt-1 border-t border-border/30">
                              {inst.splits.map((split) => {
                                const isUser = !split.personId;
                                const personName = isUser
                                  ? "Você (Titular)"
                                  : split.person?.name || "Amigo";
                                const personColor = isUser
                                  ? "#3b82f6"
                                  : split.person?.color || "#71717a";

                                return (
                                  <Pressable
                                    key={split.id}
                                    onPress={() => handleToggleSplit(split.id, split.isPaid)}
                                    className="flex-row items-center justify-between py-0.5"
                                  >
                                    <View className="flex-row items-center gap-1.5 flex-1">
                                      <View
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: personColor }}
                                      />
                                      <Text className="text-xs text-muted-foreground">
                                        {personName}
                                      </Text>
                                    </View>

                                    <View className="flex-row items-center gap-2">
                                      <Text className="text-xs font-medium text-foreground">
                                        R$ {parseFloat(split.amount).toFixed(2)}
                                      </Text>

                                      <View
                                        className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${
                                          split.isPaid
                                            ? "bg-green-500/10 text-green-600"
                                            : "bg-amber-500/10 text-amber-600"
                                        }`}
                                      >
                                        {split.isPaid ? (
                                          <CheckCircle2 size={12} color="#16a34a" />
                                        ) : (
                                          <Clock size={12} color="#d97706" />
                                        )}
                                        <Text
                                          className={`text-[10px] font-bold ${
                                            split.isPaid ? "text-green-600" : "text-amber-600"
                                          }`}
                                        >
                                          {split.isPaid ? "Pago" : "Pendente"}
                                        </Text>
                                      </View>
                                    </View>
                                  </Pressable>
                                );
                              })}
                            </View>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            );
          }}
        />
      )}

      {/* Modal Nova Compra */}
      <NewPurchaseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSavePurchase}
        cards={cards}
        people={people}
      />
    </View>
  );
}
