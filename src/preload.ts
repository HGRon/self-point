// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { IpcProcessEnum } from './ipc/ipc-process.enum';
import { RandomCode } from './renderer/helpers/random-code';

contextBridge.exposeInMainWorld('api', {
  async ipcEvent(channel: IpcProcessEnum, ...args: any[]) {
    const randomCode = new RandomCode();
    const code = '_' + randomCode.generate();

    return new Promise((resolve, reject) => {
      ipcRenderer.on(channel + code, (event, result) => {
        ipcRenderer.off(channel + code + '_error', () => void 0);
        resolve(result);
      });

      ipcRenderer.on(channel + code + '_error', (event, result) => {
        ipcRenderer.off(channel + code, () => void 0);
        reject(result);
      });

      ipcRenderer.send(channel, code, ...args);
    });
  },
});
