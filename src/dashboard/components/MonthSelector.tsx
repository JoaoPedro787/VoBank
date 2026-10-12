import * as React from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react-native";
import { DatePicker } from "@/shared/components/DatePicker";

export interface MonthSelectorProps {
  month: number;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectMonthYear?: (month: number, year: number) => void;
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

export function MonthSelector({
  month,
  year,
  onPrevMonth,
  onNextMonth,
  onSelectMonthYear,
}: MonthSelectorProps) {
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const monthName = MONTH_NAMES[month - 1] || "";
  const currentDate = React.useMemo(() => new Date(year, month - 1, 1), [year, month]);

  return (
    <>
      <View className="flex-row items-center justify-between rounded-2xl border border-border/70 bg-card px-3.5 py-2.5 shadow-sm">
        <Pressable
          onPress={onPrevMonth}
          className="h-8 w-8 items-center justify-center rounded-xl bg-muted/70 active:scale-95 active:opacity-70"
          accessibilityLabel="Mês anterior"
        >
          <ChevronLeft size={18} color="#007AFF" />
        </Pressable>

        <Pressable
          onPress={() => setIsPickerOpen(true)}
          className="flex-row items-center gap-2 active:opacity-70 px-2 py-1 rounded-lg"
          accessibilityRole="button"
          accessibilityLabel={`Selecionar período, atualmente ${monthName} de ${year}`}
          testID="month-selector-title-button"
        >
          <View className="h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Calendar size={15} color="#007AFF" />
          </View>
          <Text className="text-base font-bold text-foreground tracking-tight">
            {monthName} {year}
          </Text>
        </Pressable>

        <Pressable
          onPress={onNextMonth}
          className="h-8 w-8 items-center justify-center rounded-xl bg-muted/70 active:scale-95 active:opacity-70"
          accessibilityLabel="Próximo mês"
        >
          <ChevronRight size={18} color="#007AFF" />
        </Pressable>
      </View>

      <DatePicker
        visible={isPickerOpen}
        value={currentDate}
        onChange={(selectedDate) => {
          onSelectMonthYear?.(selectedDate.getMonth() + 1, selectedDate.getFullYear());
        }}
        onClose={() => setIsPickerOpen(false)}
        title="Selecionar Mês e Ano"
        testID="month-selector-date-picker"
      />
    </>
  );
}
