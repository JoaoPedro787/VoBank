import "../styles/global.css";
import * as React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { Toaster } from "sonner-native";
import { AuthProvider } from "@/auth/hooks/use-auth";
import { notificationService } from "@/notifications/services/notification.service";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  React.useEffect(() => {
    notificationService.initNotifications();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style={isDark ? "light" : "dark"} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(modals)"
              options={{
                presentation: "formSheet",
                sheetAllowedDetents: [0.6, 0.9],
                sheetGrabberVisible: true,
                sheetCornerRadius: 24,
                headerShown: false,
              }}
            />
          </Stack>
          <Toaster position="top-center" theme={isDark ? "dark" : "light"} />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
