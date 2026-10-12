import * as React from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Host, BottomSheet as ExpoUIBottomSheet } from "@expo/ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "@/shared/lib/utils";
import { ModalGrabHandle } from "./ModalGrabHandle";

export interface ModalSheetHeaderProps extends React.ComponentPropsWithoutRef<typeof View> {
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  children?: React.ReactNode;
}

export function ModalSheetHeader({
  title,
  subtitle,
  onClose: _onClose,
  showCloseButton: _showCloseButton,
  children,
  className,
  ...props
}: ModalSheetHeaderProps) {
  return (
    <View className={cn("border-b border-border/60 px-5 pb-3 pt-3", className)} {...props}>
      <View>
        {title ? (
          <Text
            className="text-xl font-bold tracking-tight text-foreground"
            numberOfLines={1}
            accessibilityRole="header"
          >
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text className="mt-0.5 text-xs text-muted-foreground" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export interface ModalSheetBodyProps extends React.ComponentPropsWithoutRef<typeof ScrollView> {
  children?: React.ReactNode;
  contentContainerClassName?: string;
}

export function ModalSheetBody({
  children,
  className,
  contentContainerClassName,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  keyboardShouldPersistTaps = "handled",
  ...props
}: ModalSheetBodyProps) {
  return (
    <ScrollView
      className={cn("flex-1", className)}
      contentContainerClassName={cn("p-5 gap-4", contentContainerClassName)}
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      {...props}
    >
      {children}
    </ScrollView>
  );
}

export interface ModalSheetFooterProps extends React.ComponentPropsWithoutRef<typeof View> {
  children?: React.ReactNode;
}

export function ModalSheetFooter({ children, className, style, ...props }: ModalSheetFooterProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 16);

  return (
    <View
      className={cn(
        "flex-row items-center justify-end gap-3 border-t border-border/60 bg-background px-5 pt-3",
        className,
      )}
      style={[{ paddingBottom: bottomInset }, style]}
      {...props}
    >
      {children}
    </View>
  );
}

export type ModalSheetSnapPoint = "half" | "full" | { fraction: number } | { height: number };

export interface ModalSheetProps extends React.ComponentPropsWithoutRef<typeof View> {
  children?: React.ReactNode;
  showGrabHandle?: boolean;
  isPresented?: boolean;
  onDismiss?: () => void;
  snapPoints?: ModalSheetSnapPoint[];
}

export function ModalSheetRoot({
  children,
  showGrabHandle = true,
  isPresented,
  onDismiss,
  snapPoints,
  className,
  ...props
}: ModalSheetProps) {
  if (isPresented !== undefined) {
    return (
      <Host matchContents={false}>
        <ExpoUIBottomSheet
          isPresented={isPresented}
          onDismiss={onDismiss ?? (() => {})}
          snapPoints={snapPoints}
          showDragIndicator={showGrabHandle}
        >
          <View className={cn("flex-1 bg-background", className)} {...props}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              className="flex-1"
            >
              {children}
            </KeyboardAvoidingView>
          </View>
        </ExpoUIBottomSheet>
      </Host>
    );
  }

  return (
    <View className={cn("flex-1 bg-background", className)} {...props}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {Platform.OS === "android" && showGrabHandle ? <ModalGrabHandle className="py-2" /> : null}
        {children}
      </KeyboardAvoidingView>
    </View>
  );
}

export const ModalSheet = Object.assign(ModalSheetRoot, {
  Header: ModalSheetHeader,
  Body: ModalSheetBody,
  Footer: ModalSheetFooter,
  GrabHandle: ModalGrabHandle,
});
