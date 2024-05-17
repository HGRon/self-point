import toast from 'react-hot-toast';
import { ToastTypeEnum } from '../models/toast-type.enum';

export function notify(message: string, type: ToastTypeEnum): string {
  return toast[type](message, {
    style: {
      color: 'var(--text-color-black)',
      backgroundColor: 'var(--toast-color)',
    }
  });
}

export function notifyDismiss(toastId: string): void {
  toast.dismiss(toastId);
}

