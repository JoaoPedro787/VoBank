import * as React from "react";
import { View, Text } from "react-native";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react-native";
import { DashboardResponseClient } from "../types/dashboard.types";
import { AnimatedScaleFade } from "@/shared/components/AnimatedScaleFade";

interface MonthlyMetricsCardProps {
  data: DashboardResponseClient;
}

export function MonthlyMetricsCard({ data }: MonthlyMetricsCardProps) {
  return (
    <AnimatedScaleFade>
      <View className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm gap-4">
        <View>
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Comprometido no Mês
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums mt-0.5"
          >
            R$ {data.totalCommitted.toFixed(2)}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          {/* Já Pago */}
          <View className="flex-1 rounded-2xl bg-[#34C759]/10 px-2 py-2.5 border border-[#34C759]/20">
            <View className="flex-row items-center gap-1.5 mb-1">
              <CheckCircle2 size={14} color="#34C759" />
              <Text numberOfLines={1} className="text-xs font-semibold text-[#34C759]">
                Pago
              </Text>
            </View>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              className="text-base font-bold text-[#34C759] tabular-nums"
            >
              R$ {data.totalPaid.toFixed(2)}
            </Text>
          </View>

          {/* Pendente */}
          <View className="flex-1 rounded-2xl bg-[#FF9500]/10 px-2 py-2.5 border border-[#FF9500]/20">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Clock size={14} color="#FF9500" />
              <Text numberOfLines={1} className="text-xs font-semibold text-[#FF9500]">
                Pendente
              </Text>
            </View>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              className="text-base font-bold text-[#FF9500] tabular-nums"
            >
              R$ {data.totalPending.toFixed(2)}
            </Text>
          </View>

          {/* Em Atraso */}
          <View
            className={`flex-1 rounded-2xl px-2 py-2.5 border ${
              data.totalOverdue > 0
                ? "bg-[#FF3B30]/10 border-[#FF3B30]/25"
                : "bg-muted/40 border-border/40"
            }`}
          >
            <View className="flex-row items-center gap-1.5 mb-1">
              <AlertTriangle size={14} color={data.totalOverdue > 0 ? "#FF3B30" : "#71717a"} />
              <Text
                numberOfLines={1}
                className={`text-xs ${
                  data.totalOverdue > 0
                    ? "text-[#FF3B30] font-semibold"
                    : "text-muted-foreground font-medium"
                }`}
              >
                Vencido
              </Text>
            </View>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              className={`text-base font-bold tabular-nums ${
                data.totalOverdue > 0 ? "text-[#FF3B30]" : "text-foreground"
              }`}
            >
              R$ {data.totalOverdue.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedScaleFade>
  );
}
