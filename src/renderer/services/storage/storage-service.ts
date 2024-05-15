import { StorageKeyEnum } from './models/storage-key.enum';
import { StorageMethodsEnum } from './models/storage-methods.enum';
import { IpcProcessEnum } from '../../../ipc/ipc-process.enum';

export class StorageService {

  public async set<T>(key: StorageKeyEnum, data: T): Promise<void> {
    const ipc = (window as any).api.ipcEvent;

    return await ipc(IpcProcessEnum.STORAGE, StorageMethodsEnum.SET, key, data);
  }

  public async get<T>(key: StorageKeyEnum): Promise<T> {
    const ipc = (window as any).api.ipcEvent;

    return await ipc(IpcProcessEnum.STORAGE, StorageMethodsEnum.GET, key);
  }

}
