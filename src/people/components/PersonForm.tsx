import * as React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { User } from "lucide-react-native";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { ModalSheet } from "@/shared/components/ModalSheet";
import { PRESET_COLORS } from "@/shared/constants/colors";
import { Person, CreatePersonData } from "../types/people.types";

export interface PersonFormProps {
  personToEdit?: Person | null;
  onSave: (data: CreatePersonData) => Promise<void>;
  onCancel?: () => void;
}

export function PersonForm({ personToEdit, onSave, onCancel }: PersonFormProps) {
  const [name, setName] = React.useState(personToEdit?.name || "");
  const [color, setColor] = React.useState(personToEdit?.color || PRESET_COLORS[0]);
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
  }, [personToEdit]);

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar pessoa";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ModalSheet.Body>
        {error ? (
          <View className="rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 p-3">
            <Text className="text-xs text-[#FF3B30] font-medium">{error}</Text>
          </View>
        ) : null}

        <Input
          label="Nome da Pessoa"
          placeholder="Ex: Lucas, Maria, João..."
          value={name}
          onChangeText={setName}
        />

        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">Cor de Identificação</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
            <View className="flex-row gap-3">
              {PRESET_COLORS.map((preset) => {
                const isSelected = color.toUpperCase() === preset.toUpperCase();
                return (
                  <Pressable
                    key={preset}
                    onPress={() => setColor(preset)}
                    className={`h-10 w-10 rounded-full items-center justify-center border-2 active:scale-95 ${
                      isSelected ? "border-primary scale-110 shadow-sm" : "border-transparent"
                    }`}
                    style={{ backgroundColor: preset }}
                  >
                    {isSelected && <View className="h-3 w-3 rounded-full bg-white shadow-sm" />}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Preview da Pessoa com visual Cupertino */}
        <View className="flex-row items-center gap-3.5 rounded-2xl bg-card border border-border/70 p-4 shadow-sm">
          <View
            className="h-12 w-12 rounded-full items-center justify-center shadow-md border-2 border-white/20"
            style={{ backgroundColor: color }}
          >
            <Text className="text-lg font-bold text-white">
              {(name.trim()[0] || "P").toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-muted-foreground font-medium">Pré-visualização</Text>
            <Text className="text-base font-bold text-foreground mt-0.5" numberOfLines={1}>
              {name.trim() || "Nome da pessoa"}
            </Text>
          </View>
          <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center">
            <User size={16} color="#007AFF" />
          </View>
        </View>
      </ModalSheet.Body>

      <ModalSheet.Footer>
        {onCancel ? (
          <Button variant="outline" label="Cancelar" onPress={onCancel} disabled={isSubmitting} />
        ) : null}
        <Button
          variant="default"
          label={personToEdit ? "Salvar Alterações" : "Criar Pessoa"}
          loading={isSubmitting}
          onPress={handleSubmit}
        />
      </ModalSheet.Footer>
    </>
  );
}
