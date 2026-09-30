import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#09090b" : "#ffffff",
          borderTopColor: isDark ? "#27272a" : "#e4e4e7",
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: isDark ? "#a1a1aa" : "#71717a",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
        }}
      />
    </Tabs>
  );
}
