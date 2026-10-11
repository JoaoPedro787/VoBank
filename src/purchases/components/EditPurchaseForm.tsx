import * as React from "react";
import { View, Text, Pressable } from "react-native";
import { Users, Calendar, Lock, Trash2, AlertTriangle, Info } from "lucide-react-native";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { Badge } from "@/shared/components/Badge";
import { Switch } from "@/shared/components/Switch";
import { Card } from "@/shared/components/Card";
import { ModalSheet } from "@/shared/components/ModalSheet";
import { DatePicker } from "@/shared/components/DatePicker";
import { Person } from "@/people/types/people.types";
import { CreditCard } from "@/credit-cards/types/credit-cards.types";
import { PurchaseClient, UpdatePurchaseData, CreateSplitData } from "../types/purchases.types";
import {
  maskDateBR,
  parseDateBR,
  formatDateBR,
  getTodayBR,
  getYesterdayBR,
} from "../utils/purchase-date";

export interface EditPurchaseFormProps {
  purchase: PurchaseClient;
  cards?: CreditCard[];
  people: Person[];
  onSave: (id: string, data: UpdatePurchaseData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onCancel?: () => void;
}

export function EditPurchaseForm({
  purchase,
  cards = [],
  people,
  onSave,
  onDelete,
  onCancel,
}: EditPurchaseFormProps) {
  const [description, setDescription] = React.useState(purchase.description);
  const [purchaseDateStr, setPurchaseDateStr] = React.useState(formatDateBR(purchase.purchaseDate));
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);

  // Rachar compras
  const [isSplitting, setIsSplitting] = React.useState(false);
  const [splitMode, setSplitMode] = React.useState<"percentage" | "amount">("percentage");
  const [personSplits, setPersonSplits] = React.useState<Record<string, string>>({});

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Inicializar estado a partir da compra
  React.useEffect(() => {
    setDescription(purchase.description);
    setPurchaseDateStr(formatDateBR(purchase.purchaseDate));
    setShowDeleteConfirm(false);
    setError(null);

    // Reconstruir estado de rateio (splits)
    const splitsMap: Record<string, string> = {};
    let hasPersonSplits = false;
    let detectedMode: "percentage" | "amount" = "percentage";

    if (purchase.installments && purchase.installments.length > 0) {
      const firstInst = purchase.installments[0];
      const nonOwnerSplits = firstInst.splits.filter((s) => s.personId);

      if (nonOwnerSplits.length > 0) {
        hasPersonSplits = true;
        const hasPercentages = nonOwnerSplits.some(
          (s) => s.percentage != null && Number(s.percentage) > 0,
        );
        detectedMode = hasPercentages ? "percentage" : "amount";

        for (const split of nonOwnerSplits) {
          if (split.personId) {
            if (hasPercentages && split.percentage) {
              splitsMap[split.personId] = String(Number(split.percentage));
            } else {
              const totalForPerson = purchase.installments.reduce((sum, inst) => {
                const sp = inst.splits.find((s) => s.personId === split.personId);
                return sum + (sp ? Number(sp.amount) : 0);
              }, 0);
              splitsMap[split.personId] = totalForPerson.toFixed(2).replace(".", ",");
            }
          }
        }
      }
    }

    setIsSplitting(hasPersonSplits);
    setSplitMode(detectedMode);
    setPersonSplits(splitsMap);
  }, [purchase]);

  const effectivePurchaseDate = React.useMemo(() => {
    if (!purchaseDateStr.trim()) return new Date();
    const parsed = parseDateBR(purchaseDateStr);
    return parsed ?? new Date();
  }, [purchaseDateStr]);

  const numericTotalAmount = Number(purchase.totalAmount) || 0;

  // Localizar cartão associado
  const associatedCard =
    purchase.creditCard ?? cards.find((c) => c.id === purchase.creditCardId) ?? null;

  const handlePersonSplitChange = (personId: string, val: string) => {
    setPersonSplits((prev) => ({
      ...prev,
      [personId]: val,
    }));
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError("Informe a descrição da compra");
      return;
    }

    let parsedDate: Date | undefined;
    if (purchaseDateStr.trim()) {
      const parsed = parseDateBR(purchaseDateStr);
      if (!parsed) {
        setError("Data da compra inválida. Use o formato DD/MM/AAAA");
        return;
      }
      parsedDate = parsed;
    }

    let finalSplits: CreateSplitData[] | undefined;

    if (isSplitting) {
      finalSplits = [];
      let totalFriendAssigned = 0;

      for (const person of people) {
        const rawVal = personSplits[person.id];
        if (rawVal) {
          const parsed = parseFloat(rawVal.replace(",", "."));
          if (!isNaN(parsed) && parsed > 0) {
            totalFriendAssigned += parsed;
            if (splitMode === "percentage") {
              finalSplits.push({ personId: person.id, percentage: parsed });
            } else {
              finalSplits.push({ personId: person.id, amount: parsed });
            }
          }
        }
      }

      if (splitMode === "percentage" && totalFriendAssigned > 100) {
        setError("A soma das porcentagens ultrapassa 100%");
        return;
      }

      if (splitMode === "amount" && totalFriendAssigned > numericTotalAmount) {
        setError("A soma dos valores ultrapassa o total da compra");
        return;
      }
    } else {
      finalSplits = [];
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave(purchase.id, {
        description: description.trim(),
        purchaseDate: parsedDate,
        splits: finalSplits,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar compra";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    setError(null);

    try {
      await onDelete(purchase.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao excluir compra";
      setError(message);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <ModalSheet.Body>
        {error ? (
          <View className="rounded-xl bg-destructive/10 p-3">
            <Text className="text-xs font-medium text-destructive">{error}</Text>
          </View>
        ) : null}

        {/* Informações Estruturais Bloqueadas (somente leitura) */}
        <Card className="gap-2.5 bg-muted/40 p-3.5 border-border">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Lock size={13} color="#71717a" />
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Dados Bloqueados
              </Text>
            </View>
            <Badge
              variant="outline"
              label={
                purchase.paymentMethod === "credit"
                  ? "Crédito"
                  : purchase.paymentMethod === "debit"
                    ? "Débito"
                    : "À Vista"
              }
            />
          </View>

          <View className="flex-row items-center justify-between pt-1">
            <View>
              <Text className="text-xs text-muted-foreground">Valor Total</Text>
              <Text className="text-lg font-bold text-foreground">
                R${" "}
                {numericTotalAmount.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-xs text-muted-foreground">Parcelas</Text>
              <Text className="text-sm font-semibold text-foreground">
                {purchase.totalInstallments}x
              </Text>
            </View>
          </View>

          {associatedCard ? (
            <View className="flex-row items-center gap-2 pt-1 border-t border-border/40">
              <View
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: associatedCard.color }}
              />
              <Text className="text-xs font-medium text-muted-foreground">
                {associatedCard.name} ({associatedCard.flag})
              </Text>
            </View>
          ) : null}

          <View className="flex-row items-center gap-1.5 pt-0.5">
            <Info size={12} color="#71717a" />
            <Text className="text-[11px] text-muted-foreground italic">
              Valor, forma de pagamento e parcelas não podem ser alterados após criação.
            </Text>
          </View>
        </Card>

        {/* Descrição (Editável) */}
        <Input
          label="Descrição da Compra"
          placeholder="Ex: Supermercado, Cinema, Notebook..."
          value={description}
          onChangeText={setDescription}
        />

        {/* Data da Compra (Editável) */}
        <View className="gap-1.5">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => setIsDatePickerOpen(true)}
              className="flex-row items-center gap-1.5 active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="Selecionar data da compra no calendário"
            >
              <Calendar size={14} color="#007AFF" />
              <Text className="text-sm font-medium text-foreground">Data da Compra</Text>
            </Pressable>
            <View className="flex-row gap-1.5">
              <Pressable
                onPress={() => setPurchaseDateStr(getTodayBR())}
                className="px-2.5 py-1 rounded-lg bg-muted border border-border active:opacity-70"
              >
                <Text className="text-xs font-medium text-foreground">Hoje</Text>
              </Pressable>
              <Pressable
                onPress={() => setPurchaseDateStr(getYesterdayBR())}
                className="px-2.5 py-1 rounded-lg bg-muted border border-border active:opacity-70"
              >
                <Text className="text-xs font-medium text-foreground">Ontem</Text>
              </Pressable>
            </View>
          </View>
          <Input
            placeholder="DD/MM/AAAA"
            keyboardType="number-pad"
            maxLength={10}
            value={purchaseDateStr}
            onChangeText={(val) => setPurchaseDateStr(maskDateBR(val))}
            rightIcon={
              <Pressable
                onPress={() => setIsDatePickerOpen(true)}
                className="p-1 items-center justify-center active:opacity-70"
                accessibilityRole="button"
                accessibilityLabel="Abrir calendário"
                testID="open-edit-purchase-date-picker-button"
              >
                <Calendar size={18} color="#007AFF" />
              </Pressable>
            }
          />
        </View>

        <DatePicker
          visible={isDatePickerOpen}
          value={effectivePurchaseDate}
          onChange={(selected) => setPurchaseDateStr(formatDateBR(selected))}
          onClose={() => setIsDatePickerOpen(false)}
          title="Data da Compra"
          testID="edit-purchase-date-picker"
        />

        {/* Rachar Compras (Editável) */}
        <View className="gap-3 rounded-2xl bg-muted/20 p-3.5 border border-border">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Users size={18} color="#3b82f6" />
              <Text className="text-sm font-semibold text-foreground">
                Rachar com Outras Pessoas
              </Text>
            </View>
            <Switch
              value={isSplitting}
              onValueChange={setIsSplitting}
              testID="edit-split-purchase-switch"
            />
          </View>

          {isSplitting ? (
            <View className="gap-3 pt-2">
              {/* Seletor de Modo: % ou R$ */}
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setSplitMode("percentage")}
                  className={`flex-1 py-1.5 rounded-lg items-center border ${
                    splitMode === "percentage"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      splitMode === "percentage" ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Porcentagem (%)
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setSplitMode("amount")}
                  className={`flex-1 py-1.5 rounded-lg items-center border ${
                    splitMode === "amount"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      splitMode === "amount" ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Valor Fixo (R$)
                  </Text>
                </Pressable>
              </View>

              {/* Lista de Pessoas */}
              {people.length === 0 ? (
                <Text className="text-xs text-muted-foreground italic py-1">
                  Nenhuma pessoa cadastrada. Cadastre amigos na aba Pessoas para rachar compras.
                </Text>
              ) : (
                people.map((p) => (
                  <View key={p.id} className="flex-row items-center justify-between gap-3">
                    <View className="flex-row items-center gap-2 flex-1">
                      <View
                        className="h-3.5 w-3.5 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      <Text className="text-xs font-medium text-foreground">{p.name}</Text>
                    </View>
                    <View className="w-24">
                      <Input
                        placeholder={splitMode === "percentage" ? "%" : "R$"}
                        keyboardType="decimal-pad"
                        value={personSplits[p.id] || ""}
                        onChangeText={(val) => handlePersonSplitChange(p.id, val)}
                      />
                    </View>
                  </View>
                ))
              )}
            </View>
          ) : null}
        </View>

        {/* Zona de Exclusão */}
        {onDelete ? (
          <View className="pt-2">
            {showDeleteConfirm ? (
              <Card className="gap-3 border-destructive/40 bg-destructive/5 p-3.5">
                <View className="flex-row items-center gap-2">
                  <AlertTriangle size={16} color="#ef4444" />
                  <Text className="text-xs font-bold text-destructive">
                    Confirmar Exclusão da Compra
                  </Text>
                </View>
                <Text className="text-xs text-muted-foreground">
                  Esta ação excluirá permanentemente a compra e todas as suas parcelas geradas.
                </Text>
                <View className="flex-row gap-2 pt-1">
                  <Button
                    variant="secondary"
                    label="Cancelar"
                    size="sm"
                    className="flex-1"
                    onPress={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  />
                  <Button
                    variant="destructive"
                    label={isDeleting ? "Excluindo..." : "Excluir Definitivamente"}
                    size="sm"
                    className="flex-1"
                    onPress={handleDelete}
                    disabled={isDeleting}
                  />
                </View>
              </Card>
            ) : (
              <Pressable
                onPress={() => setShowDeleteConfirm(true)}
                className="flex-row items-center justify-center gap-2 py-3 rounded-xl border border-destructive/30 bg-destructive/5 active:opacity-70"
              >
                <Trash2 size={16} color="#ef4444" />
                <Text className="text-xs font-semibold text-destructive">Excluir esta Compra</Text>
              </Pressable>
            )}
          </View>
        ) : null}
      </ModalSheet.Body>

      <ModalSheet.Footer>
        {onCancel ? (
          <Button
            variant="secondary"
            label="Cancelar"
            className="flex-1"
            onPress={onCancel}
            disabled={isSubmitting || isDeleting}
          />
        ) : null}
        <Button
          label={isSubmitting ? "Salvando..." : "Salvar Alterações"}
          className="flex-1"
          onPress={handleSubmit}
          disabled={isSubmitting || isDeleting}
        />
      </ModalSheet.Footer>
    </>
  );
}
