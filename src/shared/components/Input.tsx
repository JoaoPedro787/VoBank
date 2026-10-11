import * as React from "react";
import { TextInput, View, Text, Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { cn } from "@/shared/lib/utils";
import { hapticFeedback } from "@/shared/utils/haptics";

export interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  containerClassName?: string;
}

export const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      leftIcon,
      rightIcon,
      showPasswordToggle,
      secureTextEntry,
      placeholderTextColor,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

    const isSecure = showPasswordToggle ? !isPasswordVisible : secureTextEntry;

    return (
      <View className={cn("w-full gap-1.5", containerClassName)}>
        {label ? <Text className="text-sm font-medium text-foreground">{label}</Text> : null}
        <View
          className={cn(
            "h-12 w-full flex-row items-center rounded-[14px] border-[1.5px] bg-input px-3.5",
            isFocused ? "border-[#007AFF]" : "border-border/80 dark:border-transparent",
            error && "border-destructive",
          )}
        >
          {leftIcon ? <View className="mr-2.5 items-center justify-center">{leftIcon}</View> : null}
          <TextInput
            ref={ref}
            className={cn("h-full flex-1 text-base text-foreground", className)}
            placeholderTextColor={placeholderTextColor ?? "#8E8E93"}
            secureTextEntry={isSecure}
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
          {rightIcon ? (
            <View className="ml-2.5 items-center justify-center">{rightIcon}</View>
          ) : null}
          {showPasswordToggle ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isPasswordVisible ? "Ocultar senha" : "Ver senha"}
              onPress={() => {
                void hapticFeedback.selection();
                setIsPasswordVisible((prev) => !prev);
              }}
              className="ml-2 items-center justify-center p-1"
              hitSlop={8}
            >
              {isPasswordVisible ? (
                <EyeOff size={20} color="#8E8E93" />
              ) : (
                <Eye size={20} color="#8E8E93" />
              )}
            </Pressable>
          ) : null}
        </View>
        {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
      </View>
    );
  },
);

Input.displayName = "Input";
