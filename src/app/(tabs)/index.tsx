import * as React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  Plus,
  ShoppingBag,
  CheckCircle2,
  Clock,
  LogOut,
  AlertTriangle,
  Users,
  Sun,
  Moon,
} from "lucide-react-native";
import { useAuth } from "@/auth/hooks/use-auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/shared/hooks/useTheme";
import { useDashboard } from "@/dashboard/hooks/use-dashboard";
import { DashboardSplitItemClient } from "@/dashboard/types/dashboard.types";
import { MonthSelector } from "@/dashboard/components/MonthSelector";
import { MonthlyMetricsCard } from "@/dashboard/components/MonthlyMetricsCard";
import { PersonSummaryCard } from "@/dashboard/components/PersonSummaryCard";
import { Button } from "@/shared/components/Button";
import { Badge } from "@/shared/components/Badge";
import { AnimatedScaleFade } from "@/shared/components/AnimatedScaleFade";
import { showToast } from "@/shared/utils/toast";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { isDark, toggleColorScheme } = useTheme();
  const {
    month,
    year,
    data,
    isLoading,
    error,
    selectedPersonId,
    setSelectedPersonId,
    fetchDashboard,
    nextMonth,
    prevMonth,
    setMonthYear,
    toggleSplitPaid,
  } = useDashboard();

  useFocusEffect(
    React.useCallback(() => {
      fetchDashboard(month, year);
    }, [fetchDashboard, month, year]),
  );

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const handleToggleSplitPaid = async (splitId: string, currentPaid: boolean) => {
    try {
      const willBePaid = !currentPaid;
      await toggleSplitPaid(splitId, currentPaid);
      if (willBePaid) {
        showToast.success("Parcela marcada como paga!");
      } else {
        showToast.success("Parcela marcada como pendente!");
      }
    } catch (err: unknown) {
      showToast.error(
        "Erro ao atualizar status da parcela",
        err instanceof Error ? err.message : undefined,
      );
    }
  };

  // Coleta as parcelas filtradas com base na pessoa selecionada
  const activeSplits = React.useMemo(() => {
    if (!data) return [];

    if (selectedPersonId === "all") {
      // Todas as parcelas do mês
      const all: Array<
        DashboardSplitItemClient & {
          personName: string;
          personColor: string;
          isUser: boolean;
        }
      > = [];

      for (const p of data.byPerson) {
        for (const s of p.splits) {
          all.push({
            ...s,
            personName: p.name,
            personColor: p.color,
            isUser: p.isUser,
          });
        }
      }

      return all.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }

    const selectedPerson = data.byPerson.find(
      (p) => (selectedPersonId === "user" && p.isUser) || p.personId === selectedPersonId,
    );

    if (!selectedPerson) return [];

    return selectedPerson.splits.map((s) => ({
      ...s,
      personName: selectedPerson.name,
      personColor: selectedPerson.color,
      isUser: selectedPerson.isUser,
    }));
  }, [data, selectedPersonId]);

  return (
    <View className="flex-1 bg-background">
      {/* Header Fixo */}
      <View
        className="border-b border-border bg-card px-6 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-medium text-muted-foreground">
              Olá, {user?.name || "Usuário"}
            </Text>
            <Text className="text-2xl font-bold tracking-tight text-foreground">Dashboard</Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Button
              size="sm"
              className="flex-row items-center gap-1.5"
              onPress={() => router.push("/(modals)/purchase")}
            >
              <Plus size={16} color="#ffffff" />
              <Text className="text-sm font-semibold text-primary-foreground">Nova Compra</Text>
            </Button>

            <Pressable
              onPress={toggleColorScheme}
              className="h-9 w-9 items-center justify-center rounded-xl bg-muted active:scale-95 active:opacity-70"
              accessibilityLabel={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
            >
              {isDark ? <Sun size={16} color="#FF9500" /> : <Moon size={16} color="#71717a" />}
            </Pressable>

            <Pressable
              onPress={handleLogout}
              className="h-9 w-9 items-center justify-center rounded-xl bg-muted active:scale-95 active:opacity-70"
              accessibilityLabel="Sair"
            >
              <LogOut size={16} color="#71717a" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Erro */}
      {error ? (
        <View className="m-4 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 p-3 flex-row items-center justify-between">
          <Text className="text-xs text-[#FF3B30] flex-1 font-medium">{error}</Text>
          <Button
            variant="ghost"
            size="sm"
            label="Tentar de novo"
            onPress={() => fetchDashboard(month, year)}
          />
        </View>
      ) : null}

      {/* Conteúdo Principal */}
      {isLoading && !data ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={activeSplits}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 16,
            gap: 12,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => fetchDashboard(month, year)}
              tintColor="#007AFF"
            />
          }
          ListHeaderComponent={
            <View className="gap-5 mb-3">
              {/* Seletor Mensal */}
              <MonthSelector
                month={month}
                year={year}
                onPrevMonth={prevMonth}
                onNextMonth={nextMonth}
                onSelectMonthYear={setMonthYear}
              />

              {/* Métricas Gerais Consolidadas */}
              {data ? <MonthlyMetricsCard data={data} /> : null}

              {/* Seletor de Pessoas (Mini Dashboard por Pessoa) */}
              {data && data.byPerson.length > 0 ? (
                <View className="gap-2.5">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-bold text-foreground">Resumo por Pessoa</Text>
                    {selectedPersonId !== "all" ? (
                      <Pressable
                        onPress={() => setSelectedPersonId("all")}
                        className="active:opacity-60"
                      >
                        <Text className="text-xs font-semibold text-primary">Ver Todos</Text>
                      </Pressable>
                    ) : null}
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
                  >
                    {/* Botão "Todos" */}
                    <Pressable
                      onPress={() => setSelectedPersonId("all")}
                      className={`h-auto w-32 justify-between rounded-2xl border p-3.5 shadow-sm active:scale-[0.98] active:opacity-80 ${
                        selectedPersonId === "all"
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border/70 bg-card"
                      }`}
                    >
                      <View className="flex-row items-center gap-1.5">
                        <Users
                          size={14}
                          color={selectedPersonId === "all" ? "#007AFF" : "#71717a"}
                        />
                        <Text
                          className={`text-xs font-bold ${
                            selectedPersonId === "all" ? "text-primary" : "text-foreground"
                          }`}
                        >
                          Geral
                        </Text>
                      </View>
                      <View className="mt-3">
                        <Text className="text-[10px] text-muted-foreground font-medium">Total</Text>
                        <Text className="text-sm font-bold text-foreground tabular-nums tracking-tight">
                          R$ {data.totalCommitted.toFixed(2)}
                        </Text>
                      </View>
                    </Pressable>

                    {/* Cards de cada pessoa */}
                    {data.byPerson.map((p) => {
                      const cardKey = p.isUser ? "user" : p.personId || "user";
                      return (
                        <PersonSummaryCard
                          key={cardKey}
                          person={p}
                          isSelected={selectedPersonId === cardKey}
                          onPress={() => setSelectedPersonId(cardKey)}
                        />
                      );
                    })}
                  </ScrollView>
                </View>
              ) : null}

              {/* Título da Lista de Parcelas */}
              <View className="flex-row items-center justify-between pt-2 border-t border-border/40">
                <Text className="text-sm font-bold text-foreground">
                  {selectedPersonId === "all"
                    ? "Compromissos do Mês"
                    : `Parcelas de ${
                        data?.byPerson.find(
                          (p) =>
                            (selectedPersonId === "user" && p.isUser) ||
                            p.personId === selectedPersonId,
                        )?.name || ""
                      }`}
                  {` (${activeSplits.length})`}
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-6 py-12">
              <View className="h-14 w-14 rounded-full bg-accent/60 items-center justify-center mb-3">
                <ShoppingBag size={28} color="#71717a" />
              </View>
              <Text className="text-base font-bold text-foreground text-center">
                Nenhuma parcela neste mês
              </Text>
              <Text className="text-xs text-muted-foreground text-center mt-1 mb-5">
                Não há faturas ou lançamentos programados para este período.
              </Text>
              <Button
                size="sm"
                label="Registrar Nova Compra"
                onPress={() => router.push("/(modals)/purchase")}
              />
            </View>
          }
          renderItem={({ item }) => {
            const dueDateFormatted = new Date(item.dueDate).toLocaleDateString("pt-BR", {
              timeZone: "UTC",
              day: "2-digit",
              month: "2-digit",
            });

            return (
              <AnimatedScaleFade duration={180}>
                <View className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm gap-3">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-2">
                      <View className="flex-row items-center gap-2">
                        <Text
                          numberOfLines={1}
                          className="text-base font-bold text-foreground flex-1"
                        >
                          {item.purchaseDescription}
                        </Text>
                        <Badge
                          variant="secondary"
                          label={`Parc. ${item.installmentNumber}/${item.totalInstallments}`}
                        />
                      </View>

                      <View className="flex-row items-center gap-1.5 mt-1">
                        <View
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: item.personColor }}
                        />
                        <Text className="text-xs text-muted-foreground">
                          {item.personName}
                          {item.creditCardName ? ` • ${item.creditCardName}` : ""}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-base font-bold text-foreground tabular-nums tracking-tight">
                      R$ {item.amount.toFixed(2)}
                    </Text>
                  </View>

                  {/* Linha de status e ação */}
                  <View className="flex-row items-center justify-between pt-2 border-t border-border/40">
                    <Text className="text-xs text-muted-foreground tabular-nums">
                      Vencimento: {dueDateFormatted}
                    </Text>

                    <Pressable
                      onPress={() => handleToggleSplitPaid(item.id, item.isPaid)}
                      className="active:scale-95 active:opacity-70"
                    >
                      {item.isPaid ? (
                        <View className="flex-row items-center gap-1 rounded-full bg-[#34C759]/10 px-2.5 py-1 border border-[#34C759]/20">
                          <CheckCircle2 size={12} color="#34C759" />
                          <Text className="text-xs font-bold text-[#34C759]">Pago</Text>
                        </View>
                      ) : item.isOverdue ? (
                        <View className="flex-row items-center gap-1 rounded-full bg-[#FF3B30]/10 px-2.5 py-1 border border-[#FF3B30]/20">
                          <AlertTriangle size={12} color="#FF3B30" />
                          <Text className="text-xs font-bold text-[#FF3B30]">Vencido</Text>
                        </View>
                      ) : (
                        <View className="flex-row items-center gap-1 rounded-full bg-[#FF9500]/10 px-2.5 py-1 border border-[#FF9500]/20">
                          <Clock size={12} color="#FF9500" />
                          <Text className="text-xs font-bold text-[#FF9500]">Pendente</Text>
                        </View>
                      )}
                    </Pressable>
                  </View>
                </View>
              </AnimatedScaleFade>
            );
          }}
        />
      )}
    </View>
  );
}
