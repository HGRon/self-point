// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { IpcProcessEnum } from './ipc/ipc-process.enum';

contextBridge.exposeInMainWorld('api', {
  async ipcEvent(channel: IpcProcessEnum, ...args: any[]) {
    return new Promise((resolve, reject) => {
      ipcRenderer.on(channel, (event, result) => {
        ipcRenderer.off(channel + '_error', () => void 0);
        resolve(result);
      });

      ipcRenderer.on(channel + '_error', (event, result) => {
        ipcRenderer.off(channel, () => void 0);
        reject(result);
      });

      ipcRenderer.send(channel, ...args);
    });
  },
});
