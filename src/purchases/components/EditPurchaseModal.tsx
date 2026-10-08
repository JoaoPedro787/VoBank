import * as React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StyleSheet,
} from "react-native";
import {
  CreditCard as CardIcon,
  Banknote,
  Wallet,
  Users,
  Calendar,
  Lock,
  Trash2,
  AlertTriangle,
  Info,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomSheetDismiss } from "@/shared/hooks/useBottomSheetDismiss";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { Badge } from "@/shared/components/Badge";
import { Card, CardHeader, CardTitle, CardFooter } from "@/shared/components/Card";
import { ModalGrabHandle } from "@/shared/components/ModalGrabHandle";
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

export interface EditPurchaseModalProps {
  visible: boolean;
  purchase: PurchaseClient | null;
  onClose: () => void;
  onSave: (id: string, data: UpdatePurchaseData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  people: Person[];
  cards?: CreditCard[];
}

export function EditPurchaseModal({
  visible,
  purchase,
  onClose,
  onSave,
  onDelete,
  people,
  cards = [],
}: EditPurchaseModalProps) {
  const insets = useSafeAreaInsets();
  const {
    panY,
    panHandlers,
    reset: resetSwipe,
  } = useBottomSheetDismiss({
    onDismiss: onClose,
  });
  const [description, setDescription] = React.useState("");
  const [purchaseDateStr, setPurchaseDateStr] = React.useState("");

  // Rachar compras
  const [isSplitting, setIsSplitting] = React.useState(false);
  const [splitMode, setSplitMode] = React.useState<"percentage" | "amount">("percentage");
  // personSplits: personId -> value (percentage or amount)
  const [personSplits, setPersonSplits] = React.useState<Record<string, string>>({});

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Inicializar estado a partir da compra selecionada
  React.useEffect(() => {
    if (visible && purchase) {
      resetSwipe();
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
    }
  }, [visible, purchase]);

  if (!purchase) return null;

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
      // Se desativou o split, envia array vazio para remover splits em aberto
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

      onClose();
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
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao excluir compra";
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Fundo transparente escurecido que cobre 100% da tela (inclusive Dynamic Island e status bar) */}
      <View style={StyleSheet.absoluteFill} className="bg-black/60">
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            if (!isSubmitting && !isDeleting) onClose();
          }}
          accessibilityLabel="Fechar modal"
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "flex-end" }}
        pointerEvents="box-none"
      >
        <Animated.View style={{ transform: [{ translateY: panY }] }} className="w-full">
          <Card className="max-h-[90%] w-full rounded-b-none rounded-t-[28px] border-b-0 border-x-0 border-t border-border bg-card p-0 shadow-2xl">
            {/* Área superior interativa: arraste para baixo para fechar */}
            <View {...panHandlers} className="w-full">
              <ModalGrabHandle />
              <CardHeader className="border-b border-border px-5 pb-3 pt-0">
                <CardTitle className="text-xl">Editar Compra</CardTitle>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Atualize descrição, data e participantes
                </Text>
              </CardHeader>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 16, gap: 16 }}
            >
              {error ? (
                <View className="rounded-xl bg-destructive/10 p-3">
                  <Text className="text-xs font-medium text-destructive">{error}</Text>
                </View>
              ) : null}

              {/* Informações Estruturais Bloqueadas (Somente Leitura) */}
              <View className="gap-2.5 rounded-2xl bg-muted/40 p-3.5 border border-border/80">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    <Lock size={14} color="#71717a" />
                    <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Dados Estruturais (Imutáveis)
                    </Text>
                  </View>
                  <Badge variant="secondary" label="Somente Leitura" />
                </View>

                {/* Grid com Método, Cartão, Valor e Parcelas */}
                <View className="flex-row flex-wrap gap-2 pt-1">
                  {/* Forma de Pagamento */}
                  <View className="flex-1 min-w-[130px] rounded-xl bg-card/80 p-2.5 border border-border/60">
                    <Text className="text-[11px] text-muted-foreground font-medium">Pagamento</Text>
                    <View className="flex-row items-center gap-1.5 mt-1">
                      {purchase.paymentMethod === "credit" && (
                        <CardIcon size={14} color="#3b82f6" />
                      )}
                      {purchase.paymentMethod === "debit" && <Wallet size={14} color="#10b981" />}
                      {purchase.paymentMethod === "cash" && <Banknote size={14} color="#f59e0b" />}
                      <Text className="text-xs font-bold text-foreground capitalize">
                        {purchase.paymentMethod === "credit"
                          ? "Crédito"
                          : purchase.paymentMethod === "debit"
                            ? "Débito"
                            : "À Vista"}
                      </Text>
                    </View>
                  </View>

                  {/* Valor Total */}
                  <View className="flex-1 min-w-[130px] rounded-xl bg-card/80 p-2.5 border border-border/60">
                    <Text className="text-[11px] text-muted-foreground font-medium">
                      Valor Total
                    </Text>
                    <Text className="text-sm font-bold text-primary mt-0.5 tabular-nums">
                      R$ {numericTotalAmount.toFixed(2).replace(".", ",")}
                    </Text>
                  </View>

                  {/* Cartão (se crédito) */}
                  {purchase.paymentMethod === "credit" && associatedCard ? (
                    <View className="flex-1 min-w-[130px] rounded-xl bg-card/80 p-2.5 border border-border/60">
                      <Text className="text-[11px] text-muted-foreground font-medium">Cartão</Text>
                      <View className="flex-row items-center gap-1.5 mt-1">
                        <View
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: associatedCard.color }}
                        />
                        <Text className="text-xs font-bold text-foreground" numberOfLines={1}>
                          {associatedCard.name}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {/* Parcelas */}
                  <View className="flex-1 min-w-[130px] rounded-xl bg-card/80 p-2.5 border border-border/60">
                    <Text className="text-[11px] text-muted-foreground font-medium">
                      Parcelamento
                    </Text>
                    <Text className="text-xs font-bold text-foreground mt-0.5 tabular-nums">
                      {purchase.totalInstallments}x de R${" "}
                      {(numericTotalAmount / purchase.totalInstallments)
                        .toFixed(2)
                        .replace(".", ",")}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-1.5 pt-1">
                  <Info size={12} color="#71717a" />
                  <Text className="text-[10px] text-muted-foreground">
                    Valores, cartão e parcelas são fixos para manter a conciliação de faturas.
                  </Text>
                </View>
              </View>

              {/* Campos Editáveis */}

              {/* Descrição */}
              <Input
                label="Descrição da Compra"
                placeholder="Ex: Supermercado, Cinema, Notebook..."
                value={description}
                onChangeText={setDescription}
              />

              {/* Data da Compra */}
              <View className="gap-1.5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    <Calendar size={14} color="#71717a" />
                    <Text className="text-sm font-medium text-foreground">Data da Compra</Text>
                  </View>
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
                />
              </View>

              {/* Rachar Compras / Atribuição de Pessoas */}
              <View className="gap-3 rounded-2xl bg-muted/20 p-3.5 border border-border">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Users size={18} color="#3b82f6" />
                    <Text className="text-sm font-semibold text-foreground">
                      Rachar com Outras Pessoas
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setIsSplitting(!isSplitting)}
                    className={`px-3 py-1 rounded-full ${isSplitting ? "bg-primary" : "bg-muted"}`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isSplitting ? "text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {isSplitting ? "Ativo" : "Não dividir"}
                    </Text>
                  </Pressable>
                </View>

                {isSplitting ? (
                  <View className="gap-3 pt-2">
                    {/* Alerta da Regra de Abono */}
                    <View className="rounded-xl bg-primary/10 p-2.5 border border-primary/20 flex-row items-start gap-2">
                      <Info size={14} color="#3b82f6" className="mt-0.5" />
                      <Text className="text-[11px] text-primary flex-1 leading-4">
                        Parcelas já quitadas no histórico permanecem abonadas/pagas. A nova divisão
                        será atribuída às parcelas em aberto.
                      </Text>
                    </View>

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
                        Nenhuma pessoa cadastrada. Cadastre amigos na aba Pessoas para rachar
                        compras.
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

              {/* Botão de Exclusão / Confirmação */}
              {onDelete ? (
                <View className="pt-2 border-t border-border/60">
                  {showDeleteConfirm ? (
                    <View className="gap-2.5 rounded-2xl bg-destructive/10 p-3.5 border border-destructive/30">
                      <View className="flex-row items-center gap-2">
                        <AlertTriangle size={16} color="#ef4444" />
                        <Text className="text-xs font-bold text-destructive">
                          Confirmar exclusão desta compra?
                        </Text>
                      </View>
                      <Text className="text-xs text-muted-foreground">
                        Esta ação removerá permanentemente a compra, suas parcelas e rateios
                        associados do seu histórico financeiro.
                      </Text>
                      <View className="flex-row gap-2 mt-1">
                        <Button
                          variant="outline"
                          label="Cancelar"
                          className="flex-1 py-2"
                          onPress={() => setShowDeleteConfirm(false)}
                          disabled={isDeleting}
                        />
                        <Button
                          variant="destructive"
                          label={isDeleting ? "Excluindo..." : "Sim, Excluir"}
                          className="flex-1 py-2"
                          onPress={handleDelete}
                          disabled={isDeleting}
                        />
                      </View>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => setShowDeleteConfirm(true)}
                      className="flex-row items-center justify-center gap-2 py-2.5 rounded-xl border border-destructive/30 bg-destructive/5 active:opacity-70"
                    >
                      <Trash2 size={16} color="#ef4444" />
                      <Text className="text-xs font-semibold text-destructive">Excluir Compra</Text>
                    </Pressable>
                  )}
                </View>
              ) : null}
            </ScrollView>

            <CardFooter
              className="border-t border-border px-5 pt-3 gap-2 flex-row"
              style={{ paddingBottom: Math.max(insets.bottom, 16) }}
            >
              <Button
                variant="outline"
                label="Cancelar"
                className="flex-1"
                onPress={onClose}
                disabled={isSubmitting || isDeleting}
              />
              <Button
                label={isSubmitting ? "Salvando..." : "Salvar Alterações"}
                className="flex-1"
                onPress={handleSubmit}
                disabled={isSubmitting || isDeleting}
              />
            </CardFooter>
          </Card>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
