import * as React from "react";
import { View, Image, type ViewProps, type ImageProps } from "react-native";
import appIcon from "../../../assets/images/icon.png";
import { cn } from "@/shared/lib/utils";

export interface LogoProps extends ViewProps {
  size?: number;
  className?: string;
  imageProps?: Partial<ImageProps>;
}

export function Logo({ size = 64, className, style, imageProps, ...rest }: LogoProps) {
  return (
    <View
      style={[{ width: size, height: size }, style]}
      className={cn("overflow-hidden rounded-2xl shadow-lg shadow-primary/25", className)}
      {...rest}
    >
      <Image
        source={appIcon}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
        {...imageProps}
      />
    </View>
  );
}
