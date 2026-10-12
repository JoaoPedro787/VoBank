import * as React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import {
  CreditCard as CardIcon,
  Banknote,
  Wallet,
  Users,
  Plus,
  Minus,
  Calendar,
} from "lucide-react-native";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { Badge } from "@/shared/components/Badge";
import { Switch } from "@/shared/components/Switch";
import { ModalSheet } from "@/shared/components/ModalSheet";
import { DatePicker } from "@/shared/components/DatePicker";
import { CreditCard } from "@/credit-cards/types/credit-cards.types";
import { Person } from "@/people/types/people.types";
import { CreatePurchaseData, PaymentMethod, CreateSplitData } from "../types/purchases.types";
import { calculateInstallmentDates } from "@/shared/utils/invoice-cycle";
import {
  calculatePurchaseSplitsAndInstallments,
  CalculatedInstallment,
} from "@/shared/utils/purchase-split";
import {
  maskDateBR,
  parseDateBR,
  formatDateBR,
  getTodayBR,
  getYesterdayBR,
} from "../utils/purchase-date";

export interface NewPurchaseFormProps {
  cards: CreditCard[];
  people: Person[];
  onSave: (data: CreatePurchaseData) => Promise<void>;
  onCancel?: () => void;
}

export function NewPurchaseForm({ cards, people, onSave, onCancel }: NewPurchaseFormProps) {
  const [description, setDescription] = React.useState("");
  const [amountStr, setAmountStr] = React.useState("");
  const [purchaseDateStr, setPurchaseDateStr] = React.useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("credit");
  const [selectedCardId, setSelectedCardId] = React.useState<string | null>(() => {
    return cards.length > 0 ? cards[0].id : null;
  });
  const [installmentsCount, setInstallmentsCount] = React.useState(1);

  // Rachar compras
  const [isSplitting, setIsSplitting] = React.useState(false);
  const [splitMode, setSplitMode] = React.useState<"percentage" | "amount">("percentage");
  // personSplits: personId -> value (percentage or amount)
  const [personSplits, setPersonSplits] = React.useState<Record<string, string>>({});

  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (cards.length > 0 && !selectedCardId) {
      setSelectedCardId(cards[0].id);
    }
  }, [cards, selectedCardId]);

  const numericTotalAmount = React.useMemo(() => {
    if (!amountStr.trim()) return 0;
    const clean = amountStr.replace(",", ".");
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  }, [amountStr]);

  const selectedCard = React.useMemo(() => {
    return cards.find((c) => c.id === selectedCardId) ?? null;
  }, [cards, selectedCardId]);

  const effectivePurchaseDate = React.useMemo(() => {
    if (!purchaseDateStr.trim()) return new Date();
    const parsed = parseDateBR(purchaseDateStr);
    return parsed ?? new Date();
  }, [purchaseDateStr]);

  // Cálculo ao vivo do preview de parcelas e divisão
  const previewInstallments = React.useMemo<CalculatedInstallment[]>(() => {
    if (numericTotalAmount <= 0) return [];

    try {
      const dates = calculateInstallmentDates({
        purchaseDate: effectivePurchaseDate,
        paymentMethod,
        totalInstallments: installmentsCount,
        card:
          paymentMethod === "credit" && selectedCard
            ? { closingDay: selectedCard.closingDay, dueDay: selectedCard.dueDay }
            : null,
      });

      let splitsInput: CreateSplitData[] | undefined;

      if (isSplitting) {
        splitsInput = [];
        for (const person of people) {
          const rawVal = personSplits[person.id];
          if (rawVal) {
            const parsed = parseFloat(rawVal.replace(",", "."));
            if (!isNaN(parsed) && parsed > 0) {
              if (splitMode === "percentage") {
                splitsInput.push({ personId: person.id, percentage: parsed });
              } else {
                splitsInput.push({ personId: person.id, amount: parsed });
              }
            }
          }
        }
      }

      return calculatePurchaseSplitsAndInstallments({
        totalAmount: numericTotalAmount,
        totalInstallments: installmentsCount,
        installmentDates: dates,
        splits: splitsInput,
      });
    } catch {
      return [];
    }
  }, [
    numericTotalAmount,
    effectivePurchaseDate,
    paymentMethod,
    installmentsCount,
    selectedCard,
    isSplitting,
    splitMode,
    people,
    personSplits,
  ]);

  const handlePersonSplitChange = (personId: string, val: string) => {
    setPersonSplits((prev) => ({
      ...prev,
      [personId]: val,
    }));
  };

  const handleIncrementInstallment = () => {
    if (installmentsCount < 36) {
      setInstallmentsCount((prev) => prev + 1);
    }
  };

  const handleDecrementInstallment = () => {
    if (installmentsCount > 1) {
      setInstallmentsCount((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError("Informe a descrição da compra");
      return;
    }

    if (numericTotalAmount <= 0) {
      setError("Informe um valor válido maior que zero");
      return;
    }

    if (paymentMethod === "credit" && !selectedCardId) {
      setError("Selecione um cartão de crédito para a compra");
      return;
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
    }

    let finalPurchaseDate: Date | undefined;
    if (purchaseDateStr.trim()) {
      const parsed = parseDateBR(purchaseDateStr);
      if (!parsed) {
        setError("Data da compra inválida. Use o formato DD/MM/AAAA");
        return;
      }
      finalPurchaseDate = parsed;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave({
        description: description.trim(),
        totalAmount: numericTotalAmount,
        purchaseDate: finalPurchaseDate,
        paymentMethod,
        creditCardId: paymentMethod === "credit" ? selectedCardId : null,
        totalInstallments: paymentMethod === "credit" ? installmentsCount : 1,
        splits: finalSplits,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao registrar compra";
      setError(message);
    } finally {
      setIsSubmitting(false);
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

        {/* Descrição e Valor */}
        <Input
          label="Descrição da Compra"
          placeholder="Ex: Supermercado, Cinema, Notebook..."
          value={description}
          onChangeText={setDescription}
        />

        <Input
          label="Valor Total (R$)"
          placeholder="0,00"
          keyboardType="decimal-pad"
          value={amountStr}
          onChangeText={setAmountStr}
        />

        {/* Data da Compra (Opcional) */}
        <View className="gap-1.5">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => setIsDatePickerOpen(true)}
              className="flex-row items-center gap-1.5 active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="Selecionar data da compra no calendário"
            >
              <Calendar size={14} color="#007AFF" />
              <Text className="text-sm font-medium text-foreground">
                Data da Compra{" "}
                <Text className="text-xs text-muted-foreground font-normal">(Opcional)</Text>
              </Text>
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
            placeholder="DD/MM/AAAA (padrão: hoje)"
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
                testID="open-new-purchase-date-picker-button"
              >
                <Calendar size={18} color="#007AFF" />
              </Pressable>
            }
          />
        </View>

        <DatePicker
          visible={isDatePickerOpen}
          value={effectivePurchaseDate}
          onChange={(date) => {
            setPurchaseDateStr(formatDateBR(date));
          }}
          onClose={() => setIsDatePickerOpen(false)}
          title="Data da Compra"
          testID="new-purchase-date-picker"
        />

        {/* Método de Pagamento */}
        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">Forma de Pagamento</Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setPaymentMethod("credit")}
              className={`flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl border ${
                paymentMethod === "credit"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-muted/40"
              }`}
            >
              <CardIcon size={16} color={paymentMethod === "credit" ? "#3b82f6" : "#71717a"} />
              <Text
                className={`text-sm font-semibold ${
                  paymentMethod === "credit" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Crédito
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setPaymentMethod("debit");
                setInstallmentsCount(1);
              }}
              className={`flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl border ${
                paymentMethod === "debit"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-muted/40"
              }`}
            >
              <Wallet size={16} color={paymentMethod === "debit" ? "#3b82f6" : "#71717a"} />
              <Text
                className={`text-sm font-semibold ${
                  paymentMethod === "debit" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Débito
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setPaymentMethod("cash");
                setInstallmentsCount(1);
              }}
              className={`flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl border ${
                paymentMethod === "cash"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-muted/40"
              }`}
            >
              <Banknote size={16} color={paymentMethod === "cash" ? "#3b82f6" : "#71717a"} />
              <Text
                className={`text-sm font-semibold ${
                  paymentMethod === "cash" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                À Vista
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Se for Crédito: Seletor de Cartão e Parcelas */}
        {paymentMethod === "credit" ? (
          <View className="gap-3 rounded-2xl bg-muted/30 p-3.5 border border-border">
            <Text className="text-sm font-medium text-foreground">Cartão de Crédito</Text>
            {cards.length === 0 ? (
              <Text className="text-xs text-destructive">
                Nenhum cartão cadastrado. Cadastre um cartão na aba Cartões antes de registrar
                compras no crédito.
              </Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                {cards.map((c) => {
                  const isSelected = c.id === selectedCardId;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setSelectedCardId(c.id)}
                      className={`mr-2 flex-row items-center gap-2.5 px-3 py-2 rounded-xl border ${
                        isSelected ? "border-primary bg-card" : "border-border bg-muted/50"
                      }`}
                    >
                      <View className="h-4 w-4 rounded-full" style={{ backgroundColor: c.color }} />
                      <View>
                        <Text
                          className={`text-xs font-bold ${
                            isSelected ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {c.name}
                        </Text>
                        <Text className="text-[10px] text-muted-foreground">
                          Fecha dia {c.closingDay} / Vence dia {c.dueDay}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            {/* Quantidade de Parcelas */}
            <View className="flex-row items-center justify-between pt-2 border-t border-border/60">
              <Text className="text-sm font-medium text-foreground">Número de Parcelas</Text>
              <View className="flex-row items-center gap-3">
                <Pressable
                  onPress={handleDecrementInstallment}
                  className="h-8 w-8 items-center justify-center rounded-lg bg-muted active:opacity-70"
                >
                  <Minus size={16} color="#71717a" />
                </Pressable>
                <Text className="text-base font-bold text-foreground w-8 text-center">
                  {installmentsCount}x
                </Text>
                <Pressable
                  onPress={handleIncrementInstallment}
                  className="h-8 w-8 items-center justify-center rounded-lg bg-muted active:opacity-70"
                >
                  <Plus size={16} color="#71717a" />
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}

        {/* Rachar Compras */}
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
              testID="split-purchase-switch"
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

        {/* Pré-visualização do Ciclo de Parcelas */}
        {previewInstallments.length > 0 ? (
          <View className="gap-2 rounded-2xl bg-card p-3 border border-border">
            <View className="flex-row items-center justify-between pb-1 border-b border-border/40">
              <Text className="text-xs font-bold text-foreground">
                Resumo do Ciclo de Faturas ({previewInstallments.length}x)
              </Text>
              <Text className="text-xs font-bold text-primary">
                Total: R$ {numericTotalAmount.toFixed(2)}
              </Text>
            </View>

            {previewInstallments.slice(0, 3).map((inst) => {
              const dateStr = inst.dueDate.toLocaleDateString("pt-BR", {
                timeZone: "UTC",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });

              return (
                <View
                  key={inst.installmentNumber}
                  className="flex-row items-center justify-between py-1"
                >
                  <View className="flex-row items-center gap-1.5">
                    <Badge
                      variant="secondary"
                      label={`${inst.installmentNumber}/${previewInstallments.length}`}
                    />
                    <Text className="text-xs text-muted-foreground">Venc: {dateStr}</Text>
                  </View>
                  <Text className="text-xs font-bold text-foreground">
                    R$ {inst.amount.toFixed(2)}
                  </Text>
                </View>
              );
            })}

            {previewInstallments.length > 3 ? (
              <Text className="text-[11px] text-muted-foreground text-center italic">
                + {previewInstallments.length - 3} parcelas subsequentes
              </Text>
            ) : null}
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
            disabled={isSubmitting}
          />
        ) : null}
        <Button
          label={isSubmitting ? "Salvando..." : "Salvar Compra"}
          className="flex-1"
          onPress={handleSubmit}
          disabled={isSubmitting}
        />
      </ModalSheet.Footer>
    </>
  );
}
