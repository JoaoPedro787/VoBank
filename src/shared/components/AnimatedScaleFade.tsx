import * as React from "react";
import { Animated, ViewProps } from "react-native";

export interface AnimatedScaleFadeProps extends ViewProps {
  duration?: number;
  initialScale?: number;
  delay?: number;
  children: React.ReactNode;
}

/**
 * Componente utilitário de micro-animação (fade-in + scale-up)
 * Proporciona transições suaves a 60 FPS para modais, cards e popups
 */
export const AnimatedScaleFade = React.memo(function AnimatedScaleFade({
  duration = 200,
  initialScale = 0.94,
  delay = 0,
  children,
  style,
  ...props
}: AnimatedScaleFadeProps) {
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(initialScale)).current;

  React.useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 65,
        delay,
        useNativeDriver: true,
      }),
    ]);

    anim.start();

    return () => {
      anim.stop();
    };
  }, [opacityAnim, scaleAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
});
