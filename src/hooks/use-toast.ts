import { toast as sonnerToast, type Toast } from "sonner";

type ToastProps = Toast & {
  title?: string;
  description?: string;
};

const useToast = () => {
  const toast = ({ title, description, ...props }: ToastProps) => {
    return sonnerToast(title, {
      description,
      ...props,
    });
  };

  return {
    toast,
  };
};

export { useToast };