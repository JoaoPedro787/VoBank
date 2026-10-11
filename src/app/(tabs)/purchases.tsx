import * as React from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import {
  Plus,
  Search,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  CreditCard as CardIcon,
  Users,
  RotateCcw,
} from "lucide-react-native";
import { usePurchases } from "@/purchases/hooks/use-purchases";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useCreditCards } from "@/credit-cards/hooks/use-credit-cards";
import { usePeople } from "@/people/hooks/use-people";
import { PurchaseCard } from "@/purchases/components/PurchaseCard";
import { PurchaseClient } from "@/purchases/types/purchases.types";
import { filterPurchases, calculatePurchasesMetrics } from "@/purchases/utils/purchases-filter";
import { groupPurchasesByDay } from "@/purchases/utils/purchases-group";
import { Button } from "@/shared/components/Button";
import { Badge } from "@/shared/components/Badge";

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function PurchasesScreen() {
  const insets = useSafeAreaInsets();
  const { purchases, isLoading, error, fetchPurchases } = usePurchases();

  const { cards } = useCreditCards();
  const { people } = usePeople();

  useFocusEffect(
    React.useCallback(() => {
      fetchPurchases();
    }, [fetchPurchases]),
  );

  // Estados dos Filtros
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAllPeriods, setIsAllPeriods] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = React.useState(() => new Date().getFullYear());
  const [selectedCardId, setSelectedCardId] = React.useState<string>("all");
  const [selectedPersonId, setSelectedPersonId] = React.useState<string>("all");

  // Navegação de mês
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setIsAllPeriods(false);
    setSelectedMonth(new Date().getMonth() + 1);
    setSelectedYear(new Date().getFullYear());
    setSelectedCardId("all");
    setSelectedPersonId("all");
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    isAllPeriods ||
    selectedCardId !== "all" ||
    selectedPersonId !== "all";

  // Compras filtradas e métricas em memória reativas (< 16ms)
  const filteredPurchases = React.useMemo(() => {
    return filterPurchases(purchases, {
      searchQuery,
      isAllPeriods,
      selectedMonth,
      selectedYear,
      selectedCardId,
      selectedPersonId,
    });
  }, [
    purchases,
    searchQuery,
    isAllPeriods,
    selectedMonth,
    selectedYear,
    selectedCardId,
    selectedPersonId,
  ]);

  const metrics = React.useMemo(() => {
    return calculatePurchasesMetrics(filteredPurchases);
  }, [filteredPurchases]);

  const groupedPurchases = React.useMemo(() => {
    return groupPurchasesByDay(filteredPurchases);
  }, [filteredPurchases]);

  const handleOpenCreate = () => {
    router.push("/(modals)/purchase");
  };

  const handleOpenEdit = (purchase: PurchaseClient) => {
    router.push({
      pathname: "/(modals)/purchase",
      params: { id: purchase.id },
    });
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header Fixo da Tela */}
      <View
        className="border-b border-border bg-card px-6 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl font-bold tracking-tight text-foreground">Compras</Text>
              <Badge variant="secondary" label={String(filteredPurchases.length)} />
            </View>
            <Text className="text-sm text-muted-foreground mt-0.5">Compras - Agrupado por Dia</Text>
          </View>

          <Button size="sm" className="flex-row items-center gap-1.5" onPress={handleOpenCreate}>
            <Plus size={16} color="#ffffff" />
            <Text className="text-sm font-semibold text-primary-foreground">Nova</Text>
          </Button>
        </View>
      </View>

      {/* Erro */}
      {error ? (
        <View className="m-4 rounded-xl bg-destructive/10 p-3 flex-row items-center justify-between">
          <Text className="text-xs text-destructive flex-1 font-medium">{error}</Text>
          <Button
            variant="ghost"
            size="sm"
            label="Tentar de novo"
            onPress={() => fetchPurchases()}
          />
        </View>
      ) : null}

      {/* Lista Principal com Filtros no Topo */}
      {isLoading && purchases.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={groupedPurchases}
          keyExtractor={(item) => item.dateKey}
          contentContainerStyle={{
            padding: 16,
            gap: 14,
            flexGrow: filteredPurchases.length === 0 ? 1 : undefined,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => fetchPurchases()}
              tintColor="#007AFF"
            />
          }
          ListHeaderComponent={
            <View className="gap-4 mb-2">
              {/* Card de Métricas Consolidadas */}
              <View className="rounded-2xl border border-border bg-card p-4 shadow-sm gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {isAllPeriods
                      ? "Total Acumulado (Todos os períodos)"
                      : `Gasto em ${MONTH_NAMES[selectedMonth - 1]} de ${selectedYear}`}
                  </Text>
                  <Text className="text-xs font-semibold text-muted-foreground">
                    {metrics.totalCount} {metrics.totalCount === 1 ? "compra" : "compras"}
                  </Text>
                </View>

                <Text className="text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
                  R$ {metrics.totalAmount.toFixed(2).replace(".", ",")}
                </Text>

                <View className="flex-row items-center justify-between border-t border-border/40 pt-2.5">
                  <View className="flex-row items-center gap-1.5">
                    <View className="h-2 w-2 rounded-full bg-emerald-500" />
                    <Text className="text-xs text-muted-foreground">
                      Quitado:{" "}
                      <Text className="font-semibold text-foreground tabular-nums">
                        R$ {metrics.paidAmount.toFixed(2).replace(".", ",")}
                      </Text>
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-1.5">
                    <View className="h-2 w-2 rounded-full bg-amber-500" />
                    <Text className="text-xs text-muted-foreground">
                      Pendente:{" "}
                      <Text className="font-semibold text-foreground tabular-nums">
                        R$ {metrics.pendingAmount.toFixed(2).replace(".", ",")}
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>

              {/* Barra de Busca Textual */}
              <View className="flex-row items-center rounded-xl border border-border bg-card px-3 py-2.5 gap-2.5 shadow-sm">
                <Search size={16} color="#71717a" />
                <TextInput
                  className="flex-1 text-sm text-foreground p-0"
                  placeholder="Buscar compras por descrição..."
                  placeholderTextColor="#71717a"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <Pressable
                    onPress={() => setSearchQuery("")}
                    className="h-5 w-5 items-center justify-center rounded-full bg-muted active:opacity-60"
                  >
                    <X size={12} color="#71717a" />
                  </Pressable>
                )}
              </View>

              {/* Seletor de Período (Todos os Períodos vs Mês/Ano) */}
              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => setIsAllPeriods(!isAllPeriods)}
                  className={`px-3 py-2 rounded-xl border flex-row items-center gap-1.5 active:opacity-70 ${
                    isAllPeriods ? "border-primary bg-primary/10" : "border-border bg-card"
                  }`}
                >
                  <Calendar size={14} color={isAllPeriods ? "#3B82F6" : "#71717a"} />
                  <Text
                    className={`text-xs font-bold ${
                      isAllPeriods ? "text-primary" : "text-foreground"
                    }`}
                  >
                    Todos os períodos
                  </Text>
                </Pressable>

                {!isAllPeriods ? (
                  <View className="flex-1 flex-row items-center justify-between rounded-xl border border-border bg-card px-2 py-1 shadow-sm">
                    <Pressable
                      onPress={handlePrevMonth}
                      className="h-8 w-8 items-center justify-center rounded-lg bg-muted/60 active:opacity-60"
                      accessibilityLabel="Mês anterior"
                    >
                      <ChevronLeft size={16} color="#71717a" />
                    </Pressable>

                    <Text className="text-xs font-bold text-foreground">
                      {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                    </Text>

                    <Pressable
                      onPress={handleNextMonth}
                      className="h-8 w-8 items-center justify-center rounded-lg bg-muted/60 active:opacity-60"
                      accessibilityLabel="Próximo mês"
                    >
                      <ChevronRight size={16} color="#71717a" />
                    </Pressable>
                  </View>
                ) : null}
              </View>

              {/* Chips de Filtro por Cartão */}
              <View className="gap-1.5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    <CardIcon size={13} color="#71717a" />
                    <Text className="text-xs font-semibold text-muted-foreground">
                      Cartão de Crédito
                    </Text>
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
                >
                  {/* Opção Todos */}
                  <Pressable
                    onPress={() => setSelectedCardId("all")}
                    className={`px-3 py-1.5 rounded-full border active:opacity-70 ${
                      selectedCardId === "all"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        selectedCardId === "all" ? "text-primary" : "text-foreground"
                      }`}
                    >
                      Todos
                    </Text>
                  </Pressable>

                  {/* Cartões Cadastrados */}
                  {cards.map((c) => {
                    const isSelected = selectedCardId === c.id;
                    return (
                      <Pressable
                        key={c.id}
                        onPress={() => setSelectedCardId(c.id)}
                        className={`px-3 py-1.5 rounded-full border flex-row items-center gap-1.5 active:opacity-70 ${
                          isSelected ? "border-primary bg-primary/10" : "border-border bg-card"
                        }`}
                      >
                        <View
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        <Text
                          className={`text-xs font-semibold ${
                            isSelected ? "text-primary font-bold" : "text-foreground"
                          }`}
                        >
                          {c.name}
                        </Text>
                      </Pressable>
                    );
                  })}

                  {/* Opção Sem Cartão (À vista / Débito) */}
                  <Pressable
                    onPress={() => setSelectedCardId("no-card")}
                    className={`px-3 py-1.5 rounded-full border active:opacity-70 ${
                      selectedCardId === "no-card"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        selectedCardId === "no-card" ? "text-primary font-bold" : "text-foreground"
                      }`}
                    >
                      À Vista / Débito
                    </Text>
                  </Pressable>
                </ScrollView>
              </View>

              {/* Chips de Filtro por Pessoa */}
              <View className="gap-1.5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    <Users size={13} color="#71717a" />
                    <Text className="text-xs font-semibold text-muted-foreground">
                      Participante / Divisão
                    </Text>
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
                >
                  {/* Opção Todos */}
                  <Pressable
                    onPress={() => setSelectedPersonId("all")}
                    className={`px-3 py-1.5 rounded-full border active:opacity-70 ${
                      selectedPersonId === "all"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        selectedPersonId === "all" ? "text-primary" : "text-foreground"
                      }`}
                    >
                      Todas as pessoas
                    </Text>
                  </Pressable>

                  {/* Opção Você (Titular) */}
                  <Pressable
                    onPress={() => setSelectedPersonId("user")}
                    className={`px-3 py-1.5 rounded-full border flex-row items-center gap-1.5 active:opacity-70 ${
                      selectedPersonId === "user"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <View className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <Text
                      className={`text-xs font-semibold ${
                        selectedPersonId === "user" ? "text-primary font-bold" : "text-foreground"
                      }`}
                    >
                      Você (Titular)
                    </Text>
                  </Pressable>

                  {/* Pessoas Cadastradas */}
                  {people.map((p) => {
                    const isSelected = selectedPersonId === p.id;
                    return (
                      <Pressable
                        key={p.id}
                        onPress={() => setSelectedPersonId(p.id)}
                        className={`px-3 py-1.5 rounded-full border flex-row items-center gap-1.5 active:opacity-70 ${
                          isSelected ? "border-primary bg-primary/10" : "border-border bg-card"
                        }`}
                      >
                        <View
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        <Text
                          className={`text-xs font-semibold ${
                            isSelected ? "text-primary font-bold" : "text-foreground"
                          }`}
                        >
                          {p.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Barra de Limpeza de Filtros Ativos */}
              {hasActiveFilters ? (
                <View className="flex-row items-center justify-between pt-1">
                  <Text className="text-xs text-muted-foreground">
                    Exibindo {filteredPurchases.length} de {purchases.length} compras
                  </Text>
                  <Pressable
                    onPress={handleResetFilters}
                    className="flex-row items-center gap-1 active:opacity-70"
                  >
                    <RotateCcw size={12} color="#3B82F6" />
                    <Text className="text-xs font-semibold text-primary">Limpar filtros</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-6 py-12">
              <View className="h-16 w-16 rounded-full bg-accent/60 items-center justify-center mb-4">
                <ShoppingBag size={32} color="#71717a" />
              </View>
              <Text className="text-lg font-bold text-foreground text-center">
                {purchases.length === 0 ? "Nenhuma compra registrada" : "Nenhuma compra encontrada"}
              </Text>
              <Text className="text-sm text-muted-foreground text-center mt-1 mb-6">
                {purchases.length === 0
                  ? "Registre suas compras à vista ou no crédito para acompanhar faturas e rateios."
                  : "Tente ajustar os filtros de período, cartão ou participantes para localizar o lançamento."}
              </Text>

              {purchases.length === 0 ? (
                <Button label="Registrar Primeira Compra" onPress={handleOpenCreate} />
              ) : (
                <Button variant="outline" label="Limpar Filtros" onPress={handleResetFilters} />
              )}
            </View>
          }
          renderItem={({ item: dayGroup }) => (
            <View className="gap-2.5 mb-2">
              {/* Separador de Data / Header do Dia */}
              <View className="flex-row items-center justify-between px-1 pt-1 pb-0.5">
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-sm font-bold text-foreground tracking-tight">
                    {dayGroup.title}
                  </Text>
                  <Text className="text-xs text-muted-foreground">{dayGroup.formattedDate}</Text>
                </View>
                <Text className="text-xs font-semibold text-muted-foreground tabular-nums">
                  R$ {dayGroup.totalAmount.toFixed(2).replace(".", ",")}
                </Text>
              </View>

              {/* Lista de Compras do Dia */}
              <View className="gap-2.5">
                {dayGroup.purchases.map((purchase) => (
                  <PurchaseCard
                    key={purchase.id}
                    purchase={purchase}
                    onPressEdit={handleOpenEdit}
                  />
                ))}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
