import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { hapticFeedback } from "../utils/haptics";

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
}));

describe("hapticFeedback helper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = "ios";
  });

  it("should trigger impactLight with Light style", async () => {
    await hapticFeedback.impactLight();
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });

  it("should trigger impactMedium with Medium style", async () => {
    await hapticFeedback.impactMedium();
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
  });

  it("should trigger impactHeavy with Heavy style", async () => {
    await hapticFeedback.impactHeavy();
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
  });

  it("should trigger selectionAsync on selection", async () => {
    await hapticFeedback.selection();
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it("should trigger notificationAsync with proper types", async () => {
    await hapticFeedback.notificationSuccess();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success,
    );

    await hapticFeedback.notificationWarning();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Warning,
    );

    await hapticFeedback.notificationError();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Error);
  });

  it("should gracefully catch errors if Haptics throws", async () => {
    (Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(new Error("Haptics unavailable"));
    await expect(hapticFeedback.impactLight()).resolves.toBeUndefined();
  });

  it("should not call Haptics on web platform", async () => {
    Platform.OS = "web";
    await hapticFeedback.impactLight();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });
});
