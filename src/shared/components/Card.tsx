import * as React from "react";
import { View, Text } from "react-native";
import { cn } from "@/shared/lib/utils";

import { AnimatedScaleFade } from "./AnimatedScaleFade";

export interface CardProps extends React.ComponentPropsWithoutRef<typeof View> {
  animated?: boolean;
}

export function Card({ className, animated = false, children, ...props }: CardProps) {
  const content = (
    <View
      className={cn("rounded-2xl border border-border bg-card p-5 shadow-sm", className)}
      {...props}
    >
      {children}
    </View>
  );

  if (animated) {
    return <AnimatedScaleFade>{content}</AnimatedScaleFade>;
  }

  return content;
}

export function CardHeader({ className, ...props }: React.ComponentPropsWithoutRef<typeof View>) {
  return <View className={cn("gap-1.5 pb-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof Text>) {
  return (
    <Text
      className={cn("text-xl font-bold tracking-tight text-card-foreground", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Text>) {
  return <Text className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof View>) {
  return <View className={cn("py-2", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentPropsWithoutRef<typeof View>) {
  return <View className={cn("flex-row items-center pt-3", className)} {...props} />;
}
