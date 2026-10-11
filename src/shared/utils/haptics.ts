import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export const hapticFeedback = {
  impactLight: async (): Promise<void> => {
    if (Platform.OS === "web") return;
    try {
      if (Haptics && typeof Haptics.impactAsync === "function") {
        await Haptics.impactAsync(
          Haptics.ImpactFeedbackStyle?.Light ?? ("light" as Haptics.ImpactFeedbackStyle),
        );
      }
    } catch {
      // Fallback silencioso para ambientes sem suporte a haptics (Jest, Web, emuladores)
    }
  },

  impactMedium: async (): Promise<void> => {
    if (Platform.OS === "web") return;
    try {
      if (Haptics && typeof Haptics.impactAsync === "function") {
        await Haptics.impactAsync(
          Haptics.ImpactFeedbackStyle?.Medium ?? ("medium" as Haptics.ImpactFeedbackStyle),
        );
      }
    } catch {
      // Fallback silencioso
    }
  },

  impactHeavy: async (): Promise<void> => {
    if (Platform.OS === "web") return;
    try {
      if (Haptics && typeof Haptics.impactAsync === "function") {
        await Haptics.impactAsync(
          Haptics.ImpactFeedbackStyle?.Heavy ?? ("heavy" as Haptics.ImpactFeedbackStyle),
        );
      }
    } catch {
      // Fallback silencioso
    }
  },

  selection: async (): Promise<void> => {
    if (Platform.OS === "web") return;
    try {
      if (Haptics && typeof Haptics.selectionAsync === "function") {
        await Haptics.selectionAsync();
      }
    } catch {
      // Fallback silencioso
    }
  },

  notificationSuccess: async (): Promise<void> => {
    if (Platform.OS === "web") return;
    try {
      if (Haptics && typeof Haptics.notificationAsync === "function") {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType?.Success ??
            ("success" as Haptics.NotificationFeedbackType),
        );
      }
    } catch {
      // Fallback silencioso
    }
  },

  notificationWarning: async (): Promise<void> => {
    if (Platform.OS === "web") return;
    try {
      if (Haptics && typeof Haptics.notificationAsync === "function") {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType?.Warning ??
            ("warning" as Haptics.NotificationFeedbackType),
        );
      }
    } catch {
      // Fallback silencioso
    }
  },

  notificationError: async (): Promise<void> => {
    if (Platform.OS === "web") return;
    try {
      if (Haptics && typeof Haptics.notificationAsync === "function") {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType?.Error ?? ("error" as Haptics.NotificationFeedbackType),
        );
      }
    } catch {
      // Fallback silencioso
    }
  },
};
