import { IpcProcessEnum } from '../../../ipc/ipc-process.enum';

export class CronService {

  public async schedule(clockings: number[]): Promise<{ time: number }> {
    const ipc = (window as any).api.ipcEvent;
    return await ipc(IpcProcessEnum.CRON, clockings);
  }

}
