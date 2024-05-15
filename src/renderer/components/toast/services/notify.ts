import toast from 'react-hot-toast';
import { ToastTypeEnum } from '../models/toast-type.enum';

export function notify(message: string, type: ToastTypeEnum): string {
  return toast[type](message);
}

export function notifyDismiss(toastId: string): void {
  toast.dismiss(toastId);
}

