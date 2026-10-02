import * as React from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/shared/components/Card";
import { AnimatedScaleFade } from "@/shared/components/AnimatedScaleFade";
import { PRESET_COLORS } from "@/shared/constants/colors";
import { Person, CreatePersonData } from "../types/people.types";

interface PersonModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: CreatePersonData) => Promise<void>;
  personToEdit?: Person | null;
}

export function PersonModal({ visible, onClose, onSave, personToEdit }: PersonModalProps) {
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState(PRESET_COLORS[0]);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (personToEdit) {
      setName(personToEdit.name);
      setColor(personToEdit.color);
    } else {
      setName("");
      setColor(PRESET_COLORS[0]);
    }
    setError(null);
  }, [personToEdit, visible]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("O nome da pessoa é obrigatório");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        color,
      });
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar pessoa";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-center bg-black/60 px-4">
        <AnimatedScaleFade>
          <Card className="w-full max-w-lg bg-card">
            <CardHeader>
              <CardTitle>{personToEdit ? "Editar Pessoa" : "Nova Pessoa"}</CardTitle>
            </CardHeader>

            <CardContent className="gap-4">
              <Input
                label="Nome da Pessoa"
                placeholder="Ex: Lucas, Maria, João..."
                value={name}
                onChangeText={setName}
                error={error ?? undefined}
              />

              <View className="gap-2">
                <Text className="text-sm font-medium text-foreground">Cor de Identificação</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
                  <View className="flex-row gap-3">
                    {PRESET_COLORS.map((preset) => {
                      const isSelected = color.toUpperCase() === preset.toUpperCase();
                      return (
                        <Pressable
                          key={preset}
                          onPress={() => setColor(preset)}
                          className={`h-10 w-10 rounded-full items-center justify-center border-2 ${
                            isSelected ? "border-foreground scale-110" : "border-transparent"
                          }`}
                          style={{ backgroundColor: preset }}
                        >
                          {isSelected && <View className="h-3 w-3 rounded-full bg-white" />}
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              {/* Preview da Pessoa */}
              <View className="flex-row items-center gap-3 rounded-xl bg-accent/40 p-3 mt-1">
                <View
                  className="h-10 w-10 rounded-full items-center justify-center shadow-sm"
                  style={{ backgroundColor: color }}
                >
                  <Text className="text-base font-bold text-white">
                    {(name.trim()[0] || "P").toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-muted-foreground">Pré-visualização</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {name.trim() || "Nome da pessoa"}
                  </Text>
                </View>
              </View>
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
                label={personToEdit ? "Salvar Alterações" : "Criar Pessoa"}
                loading={isSubmitting}
                onPress={handleSubmit}
              />
            </CardFooter>
          </Card>
        </AnimatedScaleFade>
      </View>
    </Modal>
  );
}
