import { Stack } from "expo-router";

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: "formSheet",
        sheetAllowedDetents: [0.6, 0.9],
        sheetGrabberVisible: true,
        sheetCornerRadius: 24,
        headerShown: false,
      }}
    />
  );
}
