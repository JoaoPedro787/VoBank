import { toast } from "sonner-native";
import { hapticFeedback } from "../utils/haptics";
import { showToast } from "../utils/toast";

jest.mock("../utils/haptics", () => ({
  hapticFeedback: {
    notificationSuccess: jest.fn().mockResolvedValue(undefined),
    notificationError: jest.fn().mockResolvedValue(undefined),
  },
}));

describe("showToast utility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should trigger haptics and toast.success without description", () => {
    const id = showToast.success("Compra salva!");

    expect(hapticFeedback.notificationSuccess).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith("Compra salva!", undefined);
    expect(id).toBe("toast-id-success");
  });

  it("should trigger haptics and toast.success with description", () => {
    showToast.success("Compra salva!", "Detalhes da compra");

    expect(hapticFeedback.notificationSuccess).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith("Compra salva!", {
      description: "Detalhes da compra",
    });
  });

  it("should trigger haptics and toast.error without description", () => {
    const id = showToast.error("Erro ao salvar");

    expect(hapticFeedback.notificationError).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith("Erro ao salvar", undefined);
    expect(id).toBe("toast-id-error");
  });

  it("should trigger haptics and toast.error with description", () => {
    showToast.error("Erro ao salvar", "Verifique sua conexão");

    expect(hapticFeedback.notificationError).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith("Erro ao salvar", {
      description: "Verifique sua conexão",
    });
  });

  it("should forward dismiss to toast.dismiss", () => {
    showToast.dismiss("123");
    expect(toast.dismiss).toHaveBeenCalledWith("123");
  });
});
