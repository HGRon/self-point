import { IpcProcessEnum } from '../../../ipc/ipc-process.enum';
import { UserConfig } from '../../components/modal-config/models/user-config';
import { ClockingIn } from '../../../ipc/clocking-in/models/clocking-in';

export class ClockingInService {

  public async register(userConfig: UserConfig): Promise<number> {
    const ipc = (window as any).api.ipcEvent;

    const clockingIn: ClockingIn = {
      latitude: userConfig.latitude,
      longitude: userConfig.longitude,
      address: userConfig.address,
      username: userConfig.username,
      password: userConfig.password,
    }

    if (!userConfig.url)
      throw new Error('É necessário informa a URL');

    return await ipc(IpcProcessEnum.REGISTER, userConfig.url, clockingIn);
  }

}
