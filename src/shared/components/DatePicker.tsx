import * as React from "react";
import { View, Text, Pressable, Modal, Platform, KeyboardAvoidingView } from "react-native";
import {
  DateTimePicker,
  type DateTimePickerEvent,
  type DateTimePickerChangeEvent,
} from "@expo/ui/community/datetime-picker";
import { hapticFeedback } from "@/shared/utils/haptics";

export interface DatePickerProps {
  /** Valor da data selecionada */
  value: Date;
  /** Callback acionado ao alterar ou confirmar uma nova data */
  onChange: (date: Date) => void;
  /** Estado de visibilidade quando utilizado como diálogo/modal */
  visible?: boolean;
  /** Callback acionado ao fechar ou dispensar o seletor */
  onClose?: () => void;
  /** Modo do seletor nativo */
  mode?: "date" | "time" | "datetime";
  /** Data mínima selecionável */
  minimumDate?: Date;
  /** Data máxima selecionável */
  maximumDate?: Date;
  /** Título exibido no cabeçalho do modal */
  title?: string;
  /** Estilo de exibição visual ('default' | 'spinner' | 'compact' | 'inline') */
  display?: "default" | "spinner" | "compact" | "inline";
  /** Identificador para testes automatizados */
  testID?: string;
}

export function DatePicker({
  value,
  onChange,
  visible,
  onClose,
  mode = "date",
  minimumDate,
  maximumDate,
  title = "Selecionar Data",
  display = "inline",
  testID = "date-picker",
}: DatePickerProps) {
  const [tempDate, setTempDate] = React.useState<Date>(value);

  React.useEffect(() => {
    setTempDate(value);
  }, [value, visible]);

  if (Platform.OS === "android") {
    if (visible === false) return null;
    return (
      <DateTimePicker
        value={value}
        mode={mode}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        display={display}
        presentation={visible !== undefined ? "dialog" : "inline"}
        onValueChange={(_event: DateTimePickerChangeEvent, selectedDate?: Date) => {
          if (selectedDate) {
            onChange(selectedDate);
          }
          onClose?.();
        }}
        onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
          if (selectedDate) {
            onChange(selectedDate);
          }
          onClose?.();
        }}
        onDismiss={() => {
          onClose?.();
        }}
        testID={testID}
      />
    );
  }

  if (visible === undefined) {
    return (
      <DateTimePicker
        value={value}
        mode={mode}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        display={display}
        onValueChange={(_event: DateTimePickerChangeEvent, selectedDate?: Date) => {
          if (selectedDate) {
            onChange(selectedDate);
          }
        }}
        onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
          if (selectedDate) {
            onChange(selectedDate);
          }
        }}
        testID={testID}
      />
    );
  }

  if (!visible) return null;

  const handleConfirm = () => {
    void hapticFeedback.selection();
    onChange(tempDate);
    onClose?.();
  };

  const handleCancel = () => {
    void hapticFeedback.selection();
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID={`${testID}-modal`}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end bg-black/50"
      >
        <Pressable className="flex-1" onPress={handleCancel} accessibilityLabel="Fechar seletor" />
        <View className="rounded-t-[24px] border-t border-border bg-card p-4 pb-8 shadow-xl">
          <View className="flex-row items-center justify-between pb-3 border-b border-border/60">
            <Pressable
              onPress={handleCancel}
              className="px-3 py-1.5 rounded-lg active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
              testID={`${testID}-cancel-button`}
            >
              <Text className="text-sm font-medium text-muted-foreground">Cancelar</Text>
            </Pressable>

            <Text className="text-base font-bold text-foreground">{title}</Text>

            <Pressable
              onPress={handleConfirm}
              className="px-3 py-1.5 rounded-lg active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="Confirmar data selecionada"
              testID={`${testID}-confirm-button`}
            >
              <Text className="text-sm font-bold text-primary">Confirmar</Text>
            </Pressable>
          </View>

          <View className="items-center justify-center py-4">
            <DateTimePicker
              value={tempDate}
              mode={mode}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              display={display}
              onValueChange={(_event: DateTimePickerChangeEvent, selectedDate?: Date) => {
                if (selectedDate) {
                  setTempDate(selectedDate);
                }
              }}
              onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
                if (selectedDate) {
                  setTempDate(selectedDate);
                }
              }}
              testID={testID}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
