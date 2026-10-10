import * as React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Calendar } from "lucide-react-native";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { ModalSheet } from "@/shared/components/ModalSheet";
import { PRESET_COLORS } from "@/shared/constants/colors";
import { CreditCard, CreateCreditCardData } from "../types/credit-cards.types";

export interface CreditCardFormProps {
  cardToEdit?: CreditCard | null;
  onSave: (data: CreateCreditCardData) => Promise<void>;
  onCancel?: () => void;
}

const FLAGS = ["Mastercard", "Visa", "Elo", "Hipercard", "Outro"];

export function CreditCardForm({ cardToEdit, onSave, onCancel }: CreditCardFormProps) {
  const [name, setName] = React.useState(cardToEdit?.name || "");
  const [flag, setFlag] = React.useState(cardToEdit?.flag || "Mastercard");
  const [color, setColor] = React.useState(cardToEdit?.color || PRESET_COLORS[2] || "#8A05BE");
  const [closingDay, setClosingDay] = React.useState(
    cardToEdit?.closingDay ? String(cardToEdit.closingDay) : "25",
  );
  const [dueDay, setDueDay] = React.useState(cardToEdit?.dueDay ? String(cardToEdit.dueDay) : "5");
  const [limit, setLimit] = React.useState(cardToEdit?.limit ? String(cardToEdit.limit) : "");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (cardToEdit) {
      setName(cardToEdit.name);
      setFlag(cardToEdit.flag || "Mastercard");
      setColor(cardToEdit.color);
      setClosingDay(String(cardToEdit.closingDay));
      setDueDay(String(cardToEdit.dueDay));
      setLimit(cardToEdit.limit ? String(cardToEdit.limit) : "");
    } else {
      setName("");
      setFlag("Mastercard");
      setColor(PRESET_COLORS[2] || "#8A05BE");
      setClosingDay("25");
      setDueDay("5");
      setLimit("");
    }
    setError(null);
  }, [cardToEdit]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("O nome do cartão é obrigatório");
      return;
    }

    const parsedClosing = parseInt(closingDay, 10);
    const parsedDue = parseInt(dueDay, 10);

    if (isNaN(parsedClosing) || parsedClosing < 1 || parsedClosing > 31) {
      setError("O dia de fechamento deve ser entre 1 e 31");
      return;
    }

    if (isNaN(parsedDue) || parsedDue < 1 || parsedDue > 31) {
      setError("O dia de vencimento deve ser entre 1 e 31");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const data: CreateCreditCardData = {
        name: name.trim(),
        flag,
        color,
        closingDay: parsedClosing,
        dueDay: parsedDue,
        limit: limit.trim() ? parseFloat(limit.replace(",", ".")) : undefined,
      };

      await onSave(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar cartão";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ModalSheet.Body>
        {/* Preview do Cartão com visual iOS Wallet */}
        <View
          className="w-full h-44 rounded-3xl p-5 justify-between shadow-lg border border-white/20 relative overflow-hidden"
          style={{ backgroundColor: color }}
        >
          {/* Efeito de brilho de luz superior */}
          <View className="absolute top-0 left-0 right-0 h-20 bg-white/10 rounded-t-3xl" />

          <View className="flex-row justify-between items-start z-10">
            <View>
              <Text className="text-white font-bold text-lg tracking-wide">
                {name.trim() || "Nome do Cartão"}
              </Text>
              {/* Chip metálico minimalista */}
              <View className="w-9 h-6 rounded-md bg-white/20 border border-white/30 mt-2 justify-center px-1">
                <View className="h-[1px] w-full bg-white/30 my-0.5" />
                <View className="h-[1px] w-full bg-white/30 my-0.5" />
              </View>
            </View>
            <View className="bg-black/25 px-2.5 py-1 rounded-full border border-white/15">
              <Text className="text-white font-bold text-xs uppercase tracking-wider">{flag}</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-end border-t border-white/15 pt-2 z-10">
            <View className="flex-row items-center gap-1.5">
              <Calendar size={14} color="#ffffff" />
              <View>
                <Text className="text-white/70 text-[10px] font-medium">
                  Fechamento / Vencimento
                </Text>
                <Text className="text-white font-bold text-xs">
                  Dia {closingDay || "--"} / Dia {dueDay || "--"}
                </Text>
              </View>
            </View>
            {limit ? (
              <View className="items-end">
                <Text className="text-white/70 text-[10px] font-medium">Limite</Text>
                <Text className="text-white font-bold text-xs tabular-nums">R$ {limit}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {error ? (
          <View className="rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 p-3">
            <Text className="text-xs text-[#FF3B30] font-medium">{error}</Text>
          </View>
        ) : null}

        <Input
          label="Nome do Cartão"
          placeholder="Ex: Nubank, Itaú Click, Inter..."
          value={name}
          onChangeText={setName}
        />

        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">Bandeira / Instituição</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2 py-0.5">
              {FLAGS.map((f) => {
                const isSelected = flag === f;
                return (
                  <Pressable
                    key={f}
                    onPress={() => setFlag(f)}
                    className={`rounded-xl px-3.5 py-2 border active:scale-95 ${
                      isSelected
                        ? "bg-primary border-primary shadow-sm"
                        : "bg-muted/70 border-border/80"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected ? "text-primary-foreground font-bold" : "text-foreground"
                      }`}
                    >
                      {f}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">Cor do Cartão</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
            <View className="flex-row gap-3">
              {PRESET_COLORS.map((preset) => {
                const isSelected = color.toUpperCase() === preset.toUpperCase();
                return (
                  <Pressable
                    key={preset}
                    onPress={() => setColor(preset)}
                    className={`h-9 w-9 rounded-full items-center justify-center border-2 active:scale-95 ${
                      isSelected ? "border-primary scale-110 shadow-sm" : "border-transparent"
                    }`}
                    style={{ backgroundColor: preset }}
                  >
                    {isSelected && <View className="h-2.5 w-2.5 rounded-full bg-white shadow-sm" />}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="Dia Fechamento"
              placeholder="1 a 31"
              keyboardType="numeric"
              maxLength={2}
              value={closingDay}
              onChangeText={setClosingDay}
            />
          </View>
          <View className="flex-1">
            <Input
              label="Dia Vencimento"
              placeholder="1 a 31"
              keyboardType="numeric"
              maxLength={2}
              value={dueDay}
              onChangeText={setDueDay}
            />
          </View>
        </View>

        <Input
          label="Limite Total (R$) - Opcional"
          placeholder="Ex: 5000,00"
          keyboardType="numeric"
          value={limit}
          onChangeText={setLimit}
        />
      </ModalSheet.Body>

      <ModalSheet.Footer>
        {onCancel ? (
          <Button variant="outline" label="Cancelar" onPress={onCancel} disabled={isSubmitting} />
        ) : null}
        <Button
          variant="default"
          label={cardToEdit ? "Salvar Alterações" : "Criar Cartão"}
          loading={isSubmitting}
          onPress={handleSubmit}
        />
      </ModalSheet.Footer>
    </>
  );
}
