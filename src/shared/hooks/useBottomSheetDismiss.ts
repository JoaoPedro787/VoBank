import * as React from "react";
import {
  Animated,
  PanResponder,
  PanResponderCallbacks,
  GestureResponderHandlers,
} from "react-native";

export interface CreateBottomSheetPanResponderOptions {
  panY: Animated.Value;
  onDismiss: () => void;
  dismissThreshold?: number;
  velocityThreshold?: number;
}

export function createBottomSheetPanResponderConfig({
  panY,
  onDismiss,
  dismissThreshold = 80,
  velocityThreshold = 0.5,
}: CreateBottomSheetPanResponderOptions): PanResponderCallbacks {
  return {
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return gestureState.dy > 5;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        panY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > dismissThreshold || gestureState.vy > velocityThreshold) {
        Animated.timing(panY, {
          toValue: 600,
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          panY.setValue(0);
          onDismiss();
        });
      } else {
        Animated.spring(panY, {
          toValue: 0,
          bounciness: 4,
          useNativeDriver: false,
        }).start();
      }
    },
  };
}

export function createBottomSheetPanResponder(options: CreateBottomSheetPanResponderOptions) {
  return PanResponder.create(createBottomSheetPanResponderConfig(options));
}

export interface UseBottomSheetDismissOptions {
  onDismiss: () => void;
  dismissThreshold?: number;
  velocityThreshold?: number;
}

export interface UseBottomSheetDismissReturn {
  panY: Animated.Value;
  panHandlers: GestureResponderHandlers;
  reset: () => void;
}

/**
 * Hook para adicionar suporte a gesto de deslizar para baixo e fechar Bottom Sheets
 */
export function useBottomSheetDismiss({
  onDismiss,
  dismissThreshold = 80,
  velocityThreshold = 0.5,
}: UseBottomSheetDismissOptions): UseBottomSheetDismissReturn {
  const panY = React.useRef(new Animated.Value(0)).current;

  const reset = React.useCallback(() => {
    panY.setValue(0);
  }, [panY]);

  const onDismissRef = React.useRef(onDismiss);
  React.useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const panResponder = React.useRef(
    createBottomSheetPanResponder({
      panY,
      onDismiss: () => onDismissRef.current(),
      dismissThreshold,
      velocityThreshold,
    }),
  ).current;

  return {
    panY,
    panHandlers: panResponder.panHandlers,
    reset,
  };
}
