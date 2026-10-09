import { Animated, GestureResponderEvent, PanResponderGestureState } from "react-native";
import {
  createBottomSheetPanResponder,
  createBottomSheetPanResponderConfig,
} from "../hooks/useBottomSheetDismiss";

describe("BottomSheet PanResponder Drag Logic (TDD & Unit)", () => {
  const fakeEvent = {} as GestureResponderEvent;

  it("should create PanResponder with panHandlers", () => {
    const panY = new Animated.Value(0);
    const onDismiss = jest.fn();

    const responder = createBottomSheetPanResponder({ panY, onDismiss });
    expect(responder.panHandlers).toBeDefined();
  });

  it("should respond to vertical downward moves when dy > 5", () => {
    const panY = new Animated.Value(0);
    const onDismiss = jest.fn();
    const config = createBottomSheetPanResponderConfig({ panY, onDismiss });

    expect(config.onStartShouldSetPanResponder?.(fakeEvent, {} as PanResponderGestureState)).toBe(
      true,
    );
    expect(
      config.onMoveShouldSetPanResponder?.(fakeEvent, { dy: 10 } as PanResponderGestureState),
    ).toBe(true);
    expect(
      config.onMoveShouldSetPanResponder?.(fakeEvent, { dy: 3 } as PanResponderGestureState),
    ).toBe(false);
  });

  it("should update panY during downward moves", () => {
    const panY = new Animated.Value(0);
    const onDismiss = jest.fn();
    const config = createBottomSheetPanResponderConfig({ panY, onDismiss });

    config.onPanResponderMove?.(fakeEvent, { dy: 45 } as PanResponderGestureState);
    // @ts-expect-error _value is accessible in test
    expect(panY._value).toBe(45);
  });

  it("should trigger onDismiss when released past dismissThreshold", () => {
    const panY = new Animated.Value(0);
    const setValueSpy = jest.spyOn(panY, "setValue");
    const onDismiss = jest.fn();
    const timingSpy = jest.spyOn(Animated, "timing").mockReturnValue({
      start: (cb?: (result: { finished: boolean }) => void) => cb?.({ finished: true }),
      stop: jest.fn(),
      reset: jest.fn(),
    });

    const config = createBottomSheetPanResponderConfig({
      panY,
      onDismiss,
      dismissThreshold: 80,
    });

    config.onPanResponderRelease?.(fakeEvent, {
      dy: 100,
      vy: 0.1,
    } as PanResponderGestureState);

    expect(timingSpy).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalledTimes(1);
    // panY não deve ser resetado para 0 no término do dismiss para evitar flash visual
    expect(setValueSpy).not.toHaveBeenCalledWith(0);
    timingSpy.mockRestore();
    setValueSpy.mockRestore();
  });

  it("should spring back and not dismiss when released below threshold and low velocity", () => {
    const panY = new Animated.Value(0);
    const onDismiss = jest.fn();
    const springSpy = jest.spyOn(Animated, "spring").mockReturnValue({
      start: (cb?: (result: { finished: boolean }) => void) => cb?.({ finished: true }),
      stop: jest.fn(),
      reset: jest.fn(),
    });

    const config = createBottomSheetPanResponderConfig({
      panY,
      onDismiss,
      dismissThreshold: 80,
      velocityThreshold: 0.5,
    });

    config.onPanResponderRelease?.(fakeEvent, {
      dy: 30,
      vy: 0.1,
    } as PanResponderGestureState);

    expect(springSpy).toHaveBeenCalled();
    expect(onDismiss).not.toHaveBeenCalled();
    springSpy.mockRestore();
  });

  it("should trigger onDismiss on quick downward flick even with small dy", () => {
    const panY = new Animated.Value(0);
    const onDismiss = jest.fn();
    const timingSpy = jest.spyOn(Animated, "timing").mockReturnValue({
      start: (cb?: (result: { finished: boolean }) => void) => cb?.({ finished: true }),
      stop: jest.fn(),
      reset: jest.fn(),
    });

    const config = createBottomSheetPanResponderConfig({
      panY,
      onDismiss,
      dismissThreshold: 80,
      velocityThreshold: 0.5,
    });

    config.onPanResponderRelease?.(fakeEvent, {
      dy: 40,
      vy: 0.8,
    } as PanResponderGestureState);

    expect(timingSpy).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalledTimes(1);
    timingSpy.mockRestore();
  });
});
