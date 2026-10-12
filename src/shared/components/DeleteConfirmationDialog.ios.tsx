import * as React from "react";
import { View, Text } from "react-native";
import { Host } from "@expo/ui";
import { Alert, Button } from "@expo/ui/swift-ui";
import { hapticFeedback } from "@/shared/utils/haptics";
import type { DeleteConfirmationDialogProps } from "./DeleteConfirmationDialog";

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
  destructive = true,
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
      <Alert
        title={title}
        isPresented={isOpen}
        onIsPresentedChange={(isPresented) => {
          if (!isPresented && isOpen) {
            handleClose();
          }
        }}
      >
        <Alert.Trigger>
          <View />
        </Alert.Trigger>
        <Alert.Actions>
          <Button
            label={resolvedCancelText}
            role="cancel"
            onPress={() => {
              if (!isLoading) handleClose();
            }}
          />
          <Button
            label={isLoading ? "Aguarde..." : resolvedConfirmText}
            role={destructive ? "destructive" : "default"}
            onPress={() => {
              if (!isLoading) handleConfirm();
            }}
          />
        </Alert.Actions>
        {resolvedDescription ? (
          <Alert.Message>
            <Text>{resolvedDescription}</Text>
          </Alert.Message>
        ) : null}
      </Alert>
    </Host>
  );
}

export default DeleteConfirmationDialog;
