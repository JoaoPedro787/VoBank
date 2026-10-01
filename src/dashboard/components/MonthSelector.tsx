import * as React from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react-native";

interface MonthSelectorProps {
  month: number;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

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

export function MonthSelector({ month, year, onPrevMonth, onNextMonth }: MonthSelectorProps) {
  const monthName = MONTH_NAMES[month - 1] || "";

  return (
    <View className="flex-row items-center justify-between rounded-2xl border border-border bg-card px-3 py-2 shadow-sm">
      <Pressable
        onPress={onPrevMonth}
        className="h-8 w-8 items-center justify-center rounded-xl bg-muted/60 active:opacity-60"
        accessibilityLabel="Mês anterior"
      >
        <ChevronLeft size={18} color="#71717a" />
      </Pressable>

      <View className="flex-row items-center gap-2">
        <Calendar size={16} color="#3B82F6" />
        <Text className="text-base font-bold text-foreground">
          {monthName} {year}
        </Text>
      </View>

      <Pressable
        onPress={onNextMonth}
        className="h-8 w-8 items-center justify-center rounded-xl bg-muted/60 active:opacity-60"
        accessibilityLabel="Próximo mês"
      >
        <ChevronRight size={18} color="#71717a" />
      </Pressable>
    </View>
  );
}
