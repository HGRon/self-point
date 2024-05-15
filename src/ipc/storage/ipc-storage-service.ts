import { StorageKeyEnum } from '../../renderer/services/storage/models/storage-key.enum';
import Store from 'electron-store';

export class IpcStorageService {

  public readonly store = new Store();

  public set<T>(key: StorageKeyEnum, data: T): void {
    return this.store.set(key, data);
  }

  public async get<T>(key: StorageKeyEnum): Promise<T> {
    return await this.store.get(key) as T;
  }

}
