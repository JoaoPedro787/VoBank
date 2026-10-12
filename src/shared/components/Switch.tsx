import * as React from "react";
import { View, Text } from "react-native";
import { Host, Switch as ExpoUISwitch } from "@expo/ui";
import { cn } from "@/shared/lib/utils";
import { hapticFeedback } from "@/shared/utils/haptics";

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  testID?: string;
  className?: string;
}

export function Switch({
  value,
  onValueChange,
  label,
  disabled = false,
  testID,
  className,
}: SwitchProps) {
  const handleValueChange = (newValue: boolean) => {
    void hapticFeedback.selection();
    onValueChange(newValue);
  };

  const switchElement = (
    <Host matchContents>
      <ExpoUISwitch
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
        testID={testID}
      />
    </Host>
  );

  if (!label) {
    return switchElement;
  }

  return (
    <View className={cn("flex-row items-center gap-2.5", className)}>
      {switchElement}
      <Text className={cn("text-sm font-medium text-foreground", disabled && "opacity-50")}>
        {label}
      </Text>
    </View>
  );
}
