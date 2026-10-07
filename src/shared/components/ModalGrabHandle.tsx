import * as React from "react";
import { View } from "react-native";
import { cn } from "@/shared/lib/utils";

export interface ModalGrabHandleProps extends React.ComponentPropsWithoutRef<typeof View> {
  className?: string;
  pillClassName?: string;
}

export function ModalGrabHandle({ className, pillClassName, ...props }: ModalGrabHandleProps) {
  return (
    <View className={cn("w-full items-center justify-center py-2.5", className)} {...props}>
      <View
        className={cn("h-[5px] w-9 rounded-full bg-[#C7C7CC] dark:bg-[#48484A]", pillClassName)}
      />
    </View>
  );
}
