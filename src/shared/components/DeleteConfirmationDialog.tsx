import * as React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { Host } from "@expo/ui";
import { Button } from "@/shared/components/Button";
import { hapticFeedback } from "@/shared/utils/haptics";

export interface DeleteConfirmationDialogProps {
  /** Indica se o diálogo está aberto */
  isOpen: boolean;
  /** Callback acionado ao solicitar fechar ou cancelar */
  onClose: () => void;
  /** Callback acionado ao confirmar a exclusão */
  onConfirm: () => void | Promise<void>;
  /** Título do diálogo */
  title: string;
  /** Descrição explicativa do impacto da exclusão */
  description?: string;
  /** Nome do item a ser excluído (utilizado como fallback na mensagem) */
  itemName?: string;
  /** Texto do botão de confirmação */
  confirmText?: string;
  /** Rótulo alternativo do botão de confirmação */
  confirmLabel?: string;
  /** Texto do botão de cancelamento */
  cancelText?: string;
  /** Rótulo alternativo do botão de cancelamento */
  cancelLabel?: string;
  /** Indica se a operação de exclusão está em andamento */
  isLoading?: boolean;
  /** Se o botão de ação possui estilo destrutivo (usado no iOS) */
  destructive?: boolean;
  /** Identificador para testes */
  testID?: string;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  confirmText,
  confirmLabel,
  cancelText = "Cancelar",
  cancelLabel,
  isLoading = false,
  testID = "delete-confirmation-dialog",
}: DeleteConfirmationDialogProps) {
  const resolvedConfirmText = confirmText ?? confirmLabel ?? "Excluir";
  const resolvedCancelText = cancelText ?? cancelLabel ?? "Cancelar";
  const resolvedDescription =
    description ?? (itemName ? `Tem certeza que deseja remover ${itemName}?` : undefined);

  if (!isOpen) return null;

  const handleConfirm = () => {
    void hapticFeedback.notificationWarning();
    onConfirm();
  };

  const handleClose = () => {
    void hapticFeedback.selection();
    onClose();
  };

  return (
    <Host matchContents testID={testID}>
      <Modal
        visible={isOpen}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={handleClose}
        testID={`${testID}-modal`}
      >
        <View className="flex-1 items-center justify-center bg-black/60 px-6">
          <Pressable
            className="absolute inset-0"
            onPress={handleClose}
            accessibilityLabel="Fechar diálogo"
          />
          <View className="w-full max-w-sm rounded-[24px] border border-border bg-card p-6 shadow-2xl">
            <Text className="text-lg font-bold text-foreground">{title}</Text>
            {resolvedDescription ? (
              <Text className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {resolvedDescription}
              </Text>
            ) : null}
            <View className="mt-6 flex-row items-center gap-3">
              <Button
                variant="secondary"
                label={resolvedCancelText}
                onPress={handleClose}
                disabled={isLoading}
                className="flex-1"
                testID={`${testID}-cancel`}
              />
              <Button
                variant="destructive"
                label={resolvedConfirmText}
                loading={isLoading}
                onPress={handleConfirm}
                disabled={isLoading}
                className="flex-1"
                testID={`${testID}-confirm`}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Host>
  );
}

export default DeleteConfirmationDialog;
