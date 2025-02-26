import { toast } from "@/components/ui/toast";
import { toast as sonnerToast } from "sonner";

export function useToast() {
  return {
    toast,
    // expose other sonner methods directly
    error: sonnerToast.error,
    success: sonnerToast.success,
    warning: sonnerToast.warning,
    info: sonnerToast.info,
    promise: sonnerToast.promise,
    dismiss: sonnerToast.dismiss,
    custom: sonnerToast.custom,
  };
}
