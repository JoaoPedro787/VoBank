import * as React from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-xl font-medium transition-all active:opacity-80",
  {
    variants: {
      variant: {
        default: "bg-primary active:bg-primary/90",
        destructive: "bg-destructive active:bg-destructive/90",
        outline: "border border-border bg-transparent active:bg-accent",
        secondary: "bg-secondary active:bg-secondary/80",
        ghost: "bg-transparent active:bg-accent",
        link: "bg-transparent underline",
      },
      size: {
        default: "h-12 px-5 py-3",
        sm: "h-9 rounded-lg px-3",
        lg: "h-14 rounded-2xl px-8",
        icon: "h-11 w-11 rounded-xl p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const buttonTextVariants = cva("text-base font-semibold text-center", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-foreground",
      secondary: "text-secondary-foreground",
      ghost: "text-foreground",
      link: "text-primary underline",
    },
    size: {
      default: "text-base",
      sm: "text-xs",
      lg: "text-lg",
      icon: "text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof Pressable>, VariantProps<typeof buttonVariants> {
  label?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

export function Button({
  className,
  variant,
  size,
  label,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={cn(buttonVariants({ variant, size }), isDisabled && "opacity-50", className)}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" || variant === "ghost" ? "#71717a" : "#ffffff"}
        />
      ) : children ? (
        children
      ) : (
        <Text className={cn(buttonTextVariants({ variant, size }))}>{label}</Text>
      )}
    </Pressable>
  );
}

export { buttonVariants, buttonTextVariants };
