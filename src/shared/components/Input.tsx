import * as React from "react";
import { TextInput, View, Text } from "react-native";
import { cn } from "@/shared/lib/utils";

export interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, label, error, placeholderTextColor, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <View className="w-full gap-1.5">
        {label ? <Text className="text-sm font-medium text-foreground">{label}</Text> : null}
        <TextInput
          ref={ref}
          className={cn(
            "h-12 w-full rounded-[14px] border bg-[#F2F2F7] px-3.5 py-2.5 text-base text-foreground dark:bg-[#2C2C2E]",
            isFocused ? "border-[#007AFF] border-[1.5px]" : "border-transparent",
            error && "border-destructive",
            className,
          )}
          placeholderTextColor={placeholderTextColor ?? "#8E8E93"}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
      </View>
    );
  },
);

Input.displayName = "Input";
