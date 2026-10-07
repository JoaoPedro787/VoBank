import * as React from "react";
import { View, Text, Pressable } from "react-native";
import {
  Banknote,
  Wallet,
  Calendar,
  Users,
  Pencil,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react-native";
import { Badge } from "@/shared/components/Badge";
import { AnimatedScaleFade } from "@/shared/components/AnimatedScaleFade";
import { PurchaseClient } from "../types/purchases.types";
import { formatDateBR } from "../utils/purchase-date";

export interface PurchaseCardProps {
  purchase: PurchaseClient;
  onPressEdit?: (purchase: PurchaseClient) => void;
  onPressDelete?: (purchase: PurchaseClient) => void;
}

export function PurchaseCard({ purchase, onPressEdit }: PurchaseCardProps) {
  const numericTotal = Number(purchase.totalAmount) || 0;
  const installmentsCount = purchase.totalInstallments || purchase.installments?.length || 1;
  const installmentValue = installmentsCount > 0 ? numericTotal / installmentsCount : numericTotal;

  // Extrair participantes únicos dos rateios
  const participants = React.useMemo(() => {
    const list: Array<{ id: string; name: string; color: string; isOwner?: boolean }> = [];
    const seenIds = new Set<string>();

    let hasOwner = false;

    if (purchase.installments) {
      for (const inst of purchase.installments) {
        if (!inst.splits) continue;
        for (const split of inst.splits) {
          if (!split.personId) {
            hasOwner = true;
          } else if (split.person && !seenIds.has(split.person.id)) {
            seenIds.add(split.person.id);
            list.push({
              id: split.person.id,
              name: split.person.name,
              color: split.person.color,
            });
          }
        }
      }
    }

    if (hasOwner && list.length > 0) {
      list.unshift({
        id: "owner",
        name: "Você",
        color: "#3B82F6",
        isOwner: true,
      });
    }

    return list;
  }, [purchase]);

  // Status consolidado de liquidação das parcelas
  const paymentStatus = React.useMemo(() => {
    if (!purchase.installments || purchase.installments.length === 0) {
      return {
        label: "Pendente",
        variant: "warning" as const,
        icon: Clock,
      };
    }

    const now = new Date();
    let paidCount = 0;
    let hasOverdue = false;

    for (const inst of purchase.installments) {
      const isInstPaid =
        inst.splits && inst.splits.length > 0 && inst.splits.every((s) => s.isPaid);

      if (isInstPaid) {
        paidCount++;
      } else {
        const due = new Date(inst.dueDate);
        if (due < now) {
          hasOverdue = true;
        }
      }
    }

    if (paidCount === purchase.installments.length) {
      return {
        label: purchase.totalInstallments > 1 ? "Quitado" : "Pago",
        variant: "success" as const,
        icon: CheckCircle2,
      };
    }

    if (paidCount > 0) {
      return {
        label: `${paidCount}/${purchase.totalInstallments} pagas`,
        variant: "secondary" as const,
        icon: Clock,
      };
    }

    if (hasOverdue) {
      return {
        label: "Vencido",
        variant: "destructive" as const,
        icon: AlertTriangle,
      };
    }

    return {
      label: "Pendente",
      variant: "warning" as const,
      icon: Clock,
    };
  }, [purchase]);

  const StatusIcon = paymentStatus.icon;

  return (
    <AnimatedScaleFade duration={180}>
      <Pressable
        onPress={() => onPressEdit?.(purchase)}
        className="rounded-2xl border border-border bg-card p-4 shadow-sm gap-3 active:opacity-90"
      >
        {/* Linha Superior: Descrição, Valor e Gatilho de Edição */}
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text numberOfLines={2} className="text-base font-bold text-foreground leading-snug">
              {purchase.description}
            </Text>

            {/* Data e Parcelas */}
            <View className="flex-row items-center gap-2 mt-1">
              <View className="flex-row items-center gap-1">
                <Calendar size={12} color="#71717a" />
                <Text className="text-xs text-muted-foreground">
                  {formatDateBR(purchase.purchaseDate)}
                </Text>
              </View>

              <Text className="text-xs text-muted-foreground/60">•</Text>

              <Text className="text-xs font-semibold text-muted-foreground tabular-nums">
                {installmentsCount > 1
                  ? `${installmentsCount}x de R$ ${installmentValue.toFixed(2).replace(".", ",")}`
                  : "À vista"}
              </Text>
            </View>
          </View>

          {/* Valor Total e Botão Editar */}
          <View className="items-end gap-1.5">
            <Text className="text-base font-bold text-foreground tabular-nums tracking-tight">
              R$ {numericTotal.toFixed(2).replace(".", ",")}
            </Text>

            <Pressable
              onPress={() => onPressEdit?.(purchase)}
              hitSlop={8}
              className="h-7 w-7 rounded-full bg-muted items-center justify-center active:scale-95 active:opacity-60"
              accessibilityLabel="Editar compra"
            >
              <Pencil size={13} color="#71717a" />
            </Pressable>
          </View>
        </View>

        {/* Linha Intermediária: Badges do Cartão/Forma de Pagamento e Participantes */}
        <View className="flex-row flex-wrap items-center gap-1.5 pt-0.5">
          {/* Badge de Pagamento / Cartão */}
          {purchase.paymentMethod === "credit" && purchase.creditCard ? (
            <View className="flex-row items-center gap-1.5 rounded-full bg-muted/80 px-2.5 py-1 border border-border">
              <View
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: purchase.creditCard.color }}
              />
              <Text className="text-xs font-semibold text-foreground">
                {purchase.creditCard.name}
              </Text>
              <Text className="text-[10px] uppercase font-bold text-muted-foreground">
                {purchase.creditCard.flag}
              </Text>
            </View>
          ) : purchase.paymentMethod === "debit" ? (
            <View className="flex-row items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/20">
              <Wallet size={12} color="#10B981" />
              <Text className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Débito
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 border border-amber-500/20">
              <Banknote size={12} color="#F59E0B" />
              <Text className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                À Vista
              </Text>
            </View>
          )}

          {/* Badges de Participantes (Divisão / Rachado) */}
          {participants.length > 0 ? (
            <View className="flex-row items-center gap-1">
              <Users size={12} color="#71717a" />
              {participants.slice(0, 3).map((p) => (
                <View
                  key={p.id}
                  className="flex-row items-center gap-1 rounded-full bg-muted/70 px-2 py-0.5 border border-border/80"
                >
                  <View className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <Text className="text-[11px] font-medium text-foreground">{p.name}</Text>
                </View>
              ))}
              {participants.length > 3 ? (
                <View className="rounded-full bg-muted px-1.5 py-0.5">
                  <Text className="text-[10px] font-bold text-muted-foreground">
                    +{participants.length - 3}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Rodapé do Card: Status da Parcela */}
        <View className="flex-row items-center justify-between border-t border-border/40 pt-2.5">
          <View className="flex-row items-center gap-1.5">
            <Badge variant={paymentStatus.variant} className="gap-1 px-2.5 py-0.5">
              <StatusIcon size={11} />
              <Text className="text-[11px] font-bold">{paymentStatus.label}</Text>
            </Badge>
          </View>

          <Text className="text-[11px] text-muted-foreground">Toque para ver detalhes</Text>
        </View>
      </Pressable>
    </AnimatedScaleFade>
  );
}
