import * as React from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/shared/components/Card";
import { AnimatedScaleFade } from "@/shared/components/AnimatedScaleFade";
import { PRESET_COLORS } from "@/shared/constants/colors";
import { CreditCard, CreateCreditCardData } from "../types/credit-cards.types";

interface CreditCardModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: CreateCreditCardData) => Promise<void>;
  cardToEdit?: CreditCard | null;
}

const FLAGS = ["Mastercard", "Visa", "Elo", "Hipercard", "Outro"];

export function CreditCardModal({ visible, onClose, onSave, cardToEdit }: CreditCardModalProps) {
  const [name, setName] = React.useState("");
  const [flag, setFlag] = React.useState("Mastercard");
  const [color, setColor] = React.useState(PRESET_COLORS[2] || "#8A05BE");
  const [closingDay, setClosingDay] = React.useState("25");
  const [dueDay, setDueDay] = React.useState("5");
  const [limit, setLimit] = React.useState("");
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
  }, [cardToEdit, visible]);

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
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar cartão";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-center bg-black/60 px-4">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
          <AnimatedScaleFade>
            <Card className="w-full max-w-lg bg-card my-6">
              <CardHeader>
                <CardTitle>{cardToEdit ? "Editar Cartão" : "Novo Cartão"}</CardTitle>
              </CardHeader>

              <CardContent className="gap-4">
                {/* Preview do Cartão */}
                <View
                  className="w-full h-36 rounded-2xl p-4 justify-between shadow-md"
                  style={{ backgroundColor: color }}
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-white font-bold text-lg">
                      {name.trim() || "Nome do Cartão"}
                    </Text>
                    <Text className="text-white/80 font-medium text-xs uppercase">{flag}</Text>
                  </View>

                  <View className="flex-row justify-between items-end">
                    <View>
                      <Text className="text-white/70 text-xs">Fechamento / Vencimento</Text>
                      <Text className="text-white font-semibold text-sm">
                        Dia {closingDay || "--"} / Dia {dueDay || "--"}
                      </Text>
                    </View>
                    {limit ? (
                      <View className="items-end">
                        <Text className="text-white/70 text-xs">Limite</Text>
                        <Text className="text-white font-semibold text-sm">R$ {limit}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                {error ? (
                  <View className="rounded-lg bg-destructive/10 p-2.5">
                    <Text className="text-xs text-destructive font-medium">{error}</Text>
                  </View>
                ) : null}

                <Input
                  label="Nome do Cartão"
                  placeholder="Ex: Nubank, Itaú Click, Inter..."
                  value={name}
                  onChangeText={setName}
                />

                <View className="gap-2">
                  <Text className="text-sm font-medium text-foreground">
                    Bandeira / Instituição
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {FLAGS.map((f) => {
                        const isSelected = flag === f;
                        return (
                          <Pressable
                            key={f}
                            onPress={() => setFlag(f)}
                            className={`rounded-xl px-3.5 py-2 border ${
                              isSelected ? "bg-primary border-primary" : "bg-muted border-border"
                            }`}
                          >
                            <Text
                              className={`text-xs font-semibold ${
                                isSelected ? "text-primary-foreground" : "text-foreground"
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
                  <Text className="text-sm font-medium text-foreground">Cor do Cartão</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
                    <View className="flex-row gap-3">
                      {PRESET_COLORS.map((preset) => {
                        const isSelected = color.toUpperCase() === preset.toUpperCase();
                        return (
                          <Pressable
                            key={preset}
                            onPress={() => setColor(preset)}
                            className={`h-9 w-9 rounded-full items-center justify-center border-2 ${
                              isSelected ? "border-foreground scale-110" : "border-transparent"
                            }`}
                            style={{ backgroundColor: preset }}
                          >
                            {isSelected && <View className="h-2.5 w-2.5 rounded-full bg-white" />}
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
              </CardContent>

              <CardFooter className="gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  label="Cancelar"
                  onPress={onClose}
                  disabled={isSubmitting}
                />
                <Button
                  variant="default"
                  label={cardToEdit ? "Salvar Alterações" : "Criar Cartão"}
                  loading={isSubmitting}
                  onPress={handleSubmit}
                />
              </CardFooter>
            </Card>
          </AnimatedScaleFade>
        </ScrollView>
      </View>
    </Modal>
  );
}
