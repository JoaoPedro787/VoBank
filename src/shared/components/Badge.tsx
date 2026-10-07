import * as React from "react";
import { View, Text } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva("flex-row items-center justify-center rounded-full px-2.5 py-0.5", {
  variants: {
    variant: {
      default: "bg-[#007AFF]/15 border border-[#007AFF]/30",
      secondary: "bg-[#5856D6]/15 border border-[#5856D6]/30",
      destructive: "bg-[#FF3B30]/15 border border-[#FF3B30]/30",
      outline: "border border-border bg-transparent",
      success: "bg-[#34C759]/15 border border-[#34C759]/30",
      warning: "bg-[#FF9500]/15 border border-[#FF9500]/30",
      installment: "bg-[#F2F2F7] border border-border/40 dark:bg-[#2C2C2E]",
      solid: "bg-primary",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const badgeTextVariants = cva("text-xs font-semibold", {
  variants: {
    variant: {
      default: "text-[#007AFF] dark:text-[#0A84FF]",
      secondary: "text-[#5856D6] dark:text-[#5E5CE6]",
      destructive: "text-[#FF3B30] dark:text-[#FF453A]",
      outline: "text-foreground",
      success: "text-[#34C759] dark:text-[#30D158]",
      warning: "text-[#FF9500] dark:text-[#FF9F0A]",
      installment: "text-muted-foreground",
      solid: "text-primary-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<typeof View>, VariantProps<typeof badgeVariants> {
  label?: string;
  children?: React.ReactNode;
}

export function Badge({ className, variant, label, children, ...props }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)} {...props}>
      {children ? children : <Text className={cn(badgeTextVariants({ variant }))}>{label}</Text>}
    </View>
  );
}

export { badgeVariants, badgeTextVariants };
