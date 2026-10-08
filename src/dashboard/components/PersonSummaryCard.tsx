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
        "w-56 rounded-2xl border bg-card p-3.5 shadow-sm active:scale-[0.98] active:opacity-80 gap-2.5",
        isSelected ? "border-primary bg-primary/10 shadow-md" : "border-border/70",
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
          <View className="flex-row items-center gap-1 rounded-full bg-[#FF3B30]/10 px-2 py-0.5 border border-[#FF3B30]/20">
            <AlertCircle size={10} color="#FF3B30" />
            <Text className="text-[10px] font-bold text-[#FF3B30]">
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
          <View className="rounded-full bg-[#34C759]/10 px-2 py-0.5 border border-[#34C759]/20">
            <Text className="text-[10px] font-bold text-[#34C759]">Quitado</Text>
          </View>
        )}
      </View>

      {/* Total Comprometido */}
      <View>
        <Text className="text-xs text-muted-foreground font-medium">Comprometido</Text>
        <Text className="text-lg font-bold text-foreground tabular-nums tracking-tight">
          R$ {person.totalCommitted.toFixed(2)}
        </Text>
      </View>

      {/* Mini Métricas: Pago, Pendente, Vencido */}
      <View className="flex-row items-center justify-between pt-2 border-t border-border/50">
        <View className="flex-row items-center gap-1">
          <CheckCircle2 size={12} color="#34C759" />
          <Text className="text-[11px] font-semibold text-[#34C759] tabular-nums">
            R$ {person.totalPaid.toFixed(2)}
          </Text>
        </View>

        {person.totalOverdue > 0 ? (
          <View className="flex-row items-center gap-1">
            <AlertCircle size={12} color="#FF3B30" />
            <Text className="text-[11px] font-bold text-[#FF3B30] tabular-nums">
              R$ {person.totalOverdue.toFixed(2)}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-1">
            <Clock size={12} color="#FF9500" />
            <Text className="text-[11px] font-semibold text-[#FF9500] tabular-nums">
              R$ {person.totalPending.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
