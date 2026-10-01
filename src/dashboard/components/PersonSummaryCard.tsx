import * as React from "react";
import { View, Text, Pressable } from "react-native";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react-native";
import { PersonDashboardSummaryClient } from "../types/dashboard.types";
import { cn } from "@/shared/lib/utils";

interface PersonSummaryCardProps {
  person: PersonDashboardSummaryClient;
  isSelected: boolean;
  onPress: () => void;
}

export function PersonSummaryCard({ person, isSelected, onPress }: PersonSummaryCardProps) {
  const remainingCount = person.pendingCount + person.overdueCount;

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "w-56 rounded-2xl border bg-card p-3.5 shadow-sm active:opacity-80 gap-2.5",
        isSelected ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-border",
      )}
    >
      {/* Header: Cor e Nome */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2 flex-1 pr-2">
          <View className="h-3 w-3 rounded-full" style={{ backgroundColor: person.color }} />
          <Text numberOfLines={1} className="text-sm font-bold text-foreground flex-1">
            {person.name}
          </Text>
        </View>

        {person.overdueCount > 0 ? (
          <View className="flex-row items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5">
            <AlertCircle size={10} color="#ef4444" />
            <Text className="text-[10px] font-bold text-destructive">
              {person.overdueCount} atrasada(s)
            </Text>
          </View>
        ) : remainingCount > 0 ? (
          <View className="rounded-full bg-muted px-2 py-0.5">
            <Text className="text-[10px] font-medium text-muted-foreground">
              {remainingCount} restante(s)
            </Text>
          </View>
        ) : (
          <View className="rounded-full bg-emerald-500/15 px-2 py-0.5">
            <Text className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Quitado
            </Text>
          </View>
        )}
      </View>

      {/* Total Comprometido */}
      <View>
        <Text className="text-xs text-muted-foreground">Comprometido</Text>
        <Text className="text-lg font-bold text-foreground">
          R$ {person.totalCommitted.toFixed(2)}
        </Text>
      </View>

      {/* Mini Métricas: Pago, Pendente, Vencido */}
      <View className="flex-row items-center justify-between pt-2 border-t border-border/60">
        <View className="flex-row items-center gap-1">
          <CheckCircle2 size={12} color="#10B981" />
          <Text className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            R$ {person.totalPaid.toFixed(2)}
          </Text>
        </View>

        {person.totalOverdue > 0 ? (
          <View className="flex-row items-center gap-1">
            <AlertCircle size={12} color="#ef4444" />
            <Text className="text-[11px] font-bold text-destructive">
              R$ {person.totalOverdue.toFixed(2)}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-1">
            <Clock size={12} color="#F59E0B" />
            <Text className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              R$ {person.totalPending.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
