import { IpcProcessEnum } from '../../../ipc/ipc-process.enum';
import { FrameActionsEnum } from './models/frame-actions.enum';

export class FrameService {

  public async show(): Promise<void> {
    const ipc = (window as any).api.ipcEvent;
    return await ipc(IpcProcessEnum.FRAME, FrameActionsEnum.SHOW);
  }

  public async hide(): Promise<void> {
    const ipc = (window as any).api.ipcEvent;
    return await ipc(IpcProcessEnum.FRAME, FrameActionsEnum.HIDE);
  }

  public async reload(): Promise<void> {
    const ipc = (window as any).api.ipcEvent;
    return await ipc(IpcProcessEnum.FRAME, FrameActionsEnum.RELOAD);
  }

}
