import * as React from "react";
import { View, Text, useColorScheme } from "react-native";
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

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export const badgeColors: Record<BadgeVariant, { text: string; icon: string; darkIcon: string }> = {
  default: { text: "text-[#007AFF] dark:text-[#0A84FF]", icon: "#007AFF", darkIcon: "#0A84FF" },
  secondary: { text: "text-[#5856D6] dark:text-[#5E5CE6]", icon: "#5856D6", darkIcon: "#5E5CE6" },
  destructive: { text: "text-[#FF3B30] dark:text-[#FF453A]", icon: "#FF3B30", darkIcon: "#FF453A" },
  outline: { text: "text-foreground", icon: "#8E8E93", darkIcon: "#8E8E93" },
  success: { text: "text-[#34C759] dark:text-[#30D158]", icon: "#34C759", darkIcon: "#30D158" },
  warning: { text: "text-[#FF9500] dark:text-[#FF9F0A]", icon: "#FF9500", darkIcon: "#FF9F0A" },
  installment: { text: "text-muted-foreground", icon: "#8E8E93", darkIcon: "#98989D" },
  solid: { text: "text-primary-foreground", icon: "#ffffff", darkIcon: "#ffffff" },
};

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<typeof View>, VariantProps<typeof badgeVariants> {
  label?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function Badge({
  className,
  variant = "default",
  label,
  icon,
  children,
  ...props
}: BadgeProps) {
  const activeVariant: BadgeVariant = variant ?? "default";
  const isDark = useColorScheme() === "dark";
  const iconColor = isDark ? badgeColors[activeVariant].darkIcon : badgeColors[activeVariant].icon;

  const renderedContent = children ? (
    React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;
      const childProps = child.props as Record<string, unknown>;

      // Se for Text, aplica as cores de texto da variante
      if (child.type === Text || (typeof childProps.children === "string" && !childProps.size)) {
        return React.cloneElement(child as React.ReactElement<{ className?: string }>, {
          className: cn(
            badgeTextVariants({ variant: activeVariant }),
            childProps.className as string,
          ),
        });
      }

      // Se for elemento de ícone sem cor explícita, injeta iconColor
      if (!childProps.color) {
        return React.cloneElement(child as React.ReactElement<{ color?: string }>, {
          color: iconColor,
        });
      }

      return child;
    })
  ) : (
    <>
      {icon ? (
        <View className="mr-1 items-center justify-center">
          {React.isValidElement(icon) && !(icon.props as { color?: string })?.color
            ? React.cloneElement(icon as React.ReactElement<{ color?: string }>, {
                color: iconColor,
              })
            : icon}
        </View>
      ) : null}
      {label ? (
        <Text className={cn(badgeTextVariants({ variant: activeVariant }))}>{label}</Text>
      ) : null}
    </>
  );

  return (
    <View className={cn(badgeVariants({ variant: activeVariant }), className)} {...props}>
      {renderedContent}
    </View>
  );
}

export { badgeVariants, badgeTextVariants };
