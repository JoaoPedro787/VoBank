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
    <View className="flex-row items-center justify-between rounded-2xl border border-border/70 bg-card px-3.5 py-2.5 shadow-sm">
      <Pressable
        onPress={onPrevMonth}
        className="h-8 w-8 items-center justify-center rounded-xl bg-muted/70 active:scale-95 active:opacity-70"
        accessibilityLabel="Mês anterior"
      >
        <ChevronLeft size={18} color="#007AFF" />
      </Pressable>

      <View className="flex-row items-center gap-2">
        <View className="h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <Calendar size={15} color="#007AFF" />
        </View>
        <Text className="text-base font-bold text-foreground tracking-tight">
          {monthName} {year}
        </Text>
      </View>

      <Pressable
        onPress={onNextMonth}
        className="h-8 w-8 items-center justify-center rounded-xl bg-muted/70 active:scale-95 active:opacity-70"
        accessibilityLabel="Próximo mês"
      >
        <ChevronRight size={18} color="#007AFF" />
      </Pressable>
    </View>
  );
}
