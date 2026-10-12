import "../styles/global.css";
import * as React from "react";
import { Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";
import { AuthProvider } from "@/auth/hooks/use-auth";
import { notificationService } from "@/notifications/services/notification.service";
import { DarkNavTheme, LightNavTheme } from "@/shared/constants/theme";
import { useTheme } from "@/shared/hooks/useTheme";

export default function RootLayout() {
  const { isDark, initTheme } = useTheme();

  React.useEffect(() => {
    notificationService.initNotifications();
    void initTheme();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider value={isDark ? DarkNavTheme : LightNavTheme}>
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
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
