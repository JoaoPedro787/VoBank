import * as React from "react";
import { TextInput, View, Text } from "react-native";
import { cn } from "@/shared/lib/utils";

export interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, label, error, placeholderTextColor, ...props }, ref) => {
    return (
      <View className="w-full gap-1.5">
        {label ? <Text className="text-sm font-medium text-foreground">{label}</Text> : null}
        <TextInput
          ref={ref}
          className={cn(
            "h-12 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-base text-foreground placeholder:text-muted-foreground",
            error && "border-destructive",
            className,
          )}
          placeholderTextColor={placeholderTextColor ?? "#71717a"}
          {...props}
        />
        {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
      </View>
    );
  },
);

Input.displayName = "Input";
