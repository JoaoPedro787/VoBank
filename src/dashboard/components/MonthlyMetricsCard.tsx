import * as React from "react";
import { View, Text } from "react-native";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react-native";
import { DashboardResponseClient } from "../types/dashboard.types";

interface MonthlyMetricsCardProps {
  data: DashboardResponseClient;
}

export function MonthlyMetricsCard({ data }: MonthlyMetricsCardProps) {
  return (
    <View className="rounded-3xl border border-border bg-card p-5 shadow-sm gap-4">
      <View>
        <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Total Comprometido no Mês
        </Text>
        <Text className="text-3xl font-extrabold tracking-tight text-foreground mt-0.5">
          R$ {data.totalCommitted.toFixed(2)}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        {/* Já Pago */}
        <View className="flex-1 rounded-2xl bg-emerald-500/10 p-3 border border-emerald-500/20">
          <View className="flex-row items-center gap-1.5 mb-1">
            <CheckCircle2 size={14} color="#10B981" />
            <Text className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Pago</Text>
          </View>
          <Text className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            R$ {data.totalPaid.toFixed(2)}
          </Text>
        </View>

        {/* Pendente */}
        <View className="flex-1 rounded-2xl bg-amber-500/10 p-3 border border-amber-500/20">
          <View className="flex-row items-center gap-1.5 mb-1">
            <Clock size={14} color="#F59E0B" />
            <Text className="text-xs font-medium text-amber-600 dark:text-amber-400">Pendente</Text>
          </View>
          <Text className="text-base font-bold text-amber-600 dark:text-amber-400">
            R$ {data.totalPending.toFixed(2)}
          </Text>
        </View>

        {/* Em Atraso */}
        <View
          className={`flex-1 rounded-2xl p-3 border ${
            data.totalOverdue > 0
              ? "bg-destructive/15 border-destructive/30"
              : "bg-muted/40 border-border/40"
          }`}
        >
          <View className="flex-row items-center gap-1.5 mb-1">
            <AlertTriangle size={14} color={data.totalOverdue > 0 ? "#ef4444" : "#71717a"} />
            <Text
              className={`text-xs font-medium ${
                data.totalOverdue > 0 ? "text-destructive font-semibold" : "text-muted-foreground"
              }`}
            >
              Vencido
            </Text>
          </View>
          <Text
            className={`text-base font-bold ${
              data.totalOverdue > 0 ? "text-destructive" : "text-foreground"
            }`}
          >
            R$ {data.totalOverdue.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}
