import { Tabs } from "expo-router";
import { Pressable } from "react-native";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LayoutDashboard, ReceiptText, CreditCard, Users } from "lucide-react-native";
import { hapticFeedback } from "@/shared/utils/haptics";

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenListeners={{
        tabPress: () => {
          void hapticFeedback.selection();
        },
      }}
      screenOptions={{
        headerShown: false,
        tabBarButton: ({ ref: _ref, ...props }) => (
          <Pressable {...props} android_ripple={null} style={props.style}>
            {props.children}
          </Pressable>
        ),
        tabBarStyle: {
          backgroundColor: isDark ? "#09090b" : "#ffffff",
          borderTopColor: isDark ? "#27272a" : "#e4e4e7",
          height: 54 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 6),
          paddingTop: 6,
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: isDark ? "#a1a1aa" : "#71717a",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size, focused }) => (
            <LayoutDashboard size={size ?? 22} color={color} strokeWidth={focused ? 2.4 : 1.9} />
          ),
        }}
      />
      <Tabs.Screen
        name="purchases"
        options={{
          title: "Compras",
          tabBarIcon: ({ color, size, focused }) => (
            <ReceiptText size={size ?? 22} color={color} strokeWidth={focused ? 2.4 : 1.9} />
          ),
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: "Cartões",
          tabBarIcon: ({ color, size, focused }) => (
            <CreditCard size={size ?? 22} color={color} strokeWidth={focused ? 2.4 : 1.9} />
          ),
        }}
      />
      <Tabs.Screen
        name="people"
        options={{
          title: "Pessoas",
          tabBarIcon: ({ color, size, focused }) => (
            <Users size={size ?? 22} color={color} strokeWidth={focused ? 2.4 : 1.9} />
          ),
        }}
      />
    </Tabs>
  );
}
