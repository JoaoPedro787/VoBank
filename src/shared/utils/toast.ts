import { toast } from "sonner-native";
import { hapticFeedback } from "./haptics";

export const showToast = {
  success: (message: string, description?: string) => {
    void hapticFeedback.notificationSuccess();
    return toast.success(message, description ? { description } : undefined);
  },
  error: (message: string, description?: string) => {
    void hapticFeedback.notificationError();
    return toast.error(message, description ? { description } : undefined);
  },
  dismiss: (id?: string | number) => {
    return toast.dismiss(id);
  },
};
