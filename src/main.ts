import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  Notification,
  NotificationConstructorOptions,
  Tray
} from 'electron';
import path from 'path';
import { IpcProcessEnum } from './ipc/ipc-process.enum';
import { StorageMethodsEnum } from './renderer/services/storage/models/storage-methods.enum';
import { FrameActionsEnum } from './renderer/services/frame/models/frame-actions.enum';
import cron, { ScheduledTask } from 'node-cron';
import { IpcHttpService } from './ipc/http/ipc-http-service';
import { HttpMethodsEnum } from './ipc/http/models/http-methods.enum';
import { CreateAxiosDefaults } from 'axios';
import { HttpEitherResponse } from './ipc/http/models/http-either-response';
import { UserConfig } from './renderer/components/modal-config/models/user-config';
import { StorageKeyEnum } from './renderer/services/storage/models/storage-key.enum';
import { Time } from './renderer/helpers/time';
import { IpcStorageService } from './ipc/storage/ipc-storage-service';
import { IpcClockingInService } from './ipc/clocking-in/ipc-clocking-in-service';
import { ClockingIn } from './ipc/clocking-in/models/clocking-in';
import AutoLaunch from 'auto-launch';
import clock from './assets/clock.png';

const clockImage = nativeImage.createFromDataURL(clock);

if (require('electron-squirrel-startup'))
  app.quit();

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 650,
    icon: clockImage,
    title: 'Self Point',
    center: true,
    autoHideMenuBar: true,
    frame: false,
    show: true,
    resizable: false,
    transparent: true,
    movable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL)
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  else
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));

  trayConfig(mainWindow);

  httpIpcSubscriber();
  cronIpcSubscriber(mainWindow);
  storageIpcSubscriber();
  frameIpcSubscriber(mainWindow);
  registerPointIpcSubscriber();

  cronReference = cron.schedule(`01 00 * * *`, async () => {
    mainWindow.reload();
  })

  const appLauncher = new AutoLaunch({
    name: 'Self Point',
    path: app.getPath('exe'),
  });

  appLauncher.isEnabled().then(enabled => {
    if (!enabled) {
      appLauncher.enable();
    }
  }).catch(err => {
    console.error(err);
  });
};

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function storageIpcSubscriber(): void {
  ipcMain.on(IpcProcessEnum.STORAGE, async (event, action, key, value) => {
    const ipcStorage = new IpcStorageService();

    if (action === StorageMethodsEnum.GET) {
      const result = await ipcStorage.get(key);
      return void event.reply(IpcProcessEnum.STORAGE, result);
    }

    if (action === StorageMethodsEnum.SET) {
      ipcStorage.set(key, value);
      return void event.reply(IpcProcessEnum.STORAGE, value);
    }
  });
}

let cronReference: ScheduledTask = null;

// TODO: E se for 21:48 eu bater o primeiro ponto? (Emitir avisando que o sitemas não agendara nada)
// TODO: E se for o primeiro ponto e for 12:10? (Bate o ponto e coloca o almoço para daqui 2 horas)
// TODO: E se eu trocar a configuração de primeiro horario? (Só chamar essa função de novo)
// TODO: E se eu bater um ponto e não bater mais nenhum? Quem me garanti que amanha vai dar um show no horario
// TODO: que configurei? (Pensar)
function cronIpcSubscriber(mainWindow: BrowserWindow): void {
  ipcMain.on(IpcProcessEnum.CRON,async (event, clockings) => {
    const result = await cronScheduler(clockings, mainWindow);
    return void event.reply(IpcProcessEnum.CRON, { time: result });
  });
}

async function cronScheduler(clockings: number[], mainWindow: BrowserWindow): Promise<number> {
  if (cronReference)
    cronReference.stop();

  let timeInMilliseconds = 0;

  const storage = new IpcStorageService();
  const time = new Time();

  const userConfig = await storage.get<UserConfig>(StorageKeyEnum.USER_CONFIG);

  const scheduleFistTime = async () => {
    const userTime = userConfig.time || '';
    const times = userTime.split(':');

    timeInMilliseconds = +time.hourStringToMilliseconds(userTime);

    if (!userTime || time.isHourStringPassed(userTime))
      return timeInMilliseconds;

    cronReference = cron.schedule(`${times[1]} ${times[0]} * * *`, () => {
      notification({
        title: 'Hora de bater o ponto',
        body: 'Olá, abra a aplicação para registrar o ponto'
      }, () => { mainWindow.show() });
    });

    return timeInMilliseconds;
  }

  const schedule = (timeInMilliseconds: number) => {
    const times = time.millisecondsToHour(timeInMilliseconds).split(':');

    cronReference = cron.schedule(`${times[1]} ${times[0]} * * *`, async () => {
      const storageAux = new IpcStorageService();
      const userConfig = await storageAux.get<UserConfig>(StorageKeyEnum.USER_CONFIG);

      if (userConfig.automatic) {
        const t = await registerPoint(userConfig.url, {
          password: userConfig.password,
          username: userConfig.username,
          address: userConfig.address,
          latitude: userConfig.latitude,
          longitude: userConfig.longitude,
        });

        notification({
          title: 'Ponto registrado!',
          body: 'Ponto registrado com sucesso, logo o próximo será agendado!'
        }, () => { mainWindow.show() });

        mainWindow.reload();

        return t;
      }

      notification({
        title: 'Hora de bater o ponto!',
        body: 'Olá, abra a aplicação para registrar o ponto'
      }, () => { mainWindow.show() });
    });
  }

  if (clockings.length >= 4)
    return await scheduleFistTime();

  if (clockings.length === 0)
    return await scheduleFistTime();

  const randomTime = time.randomMilliseconds(5)

  if (clockings.length === 1) {
    timeInMilliseconds = 43200000 + randomTime; // 12h + ou - 5 min
    schedule(timeInMilliseconds);
  }

  if (clockings.length === 2) {
    const oneHourInMilliseconds = 1 * 60 * 60 * 1000;
    timeInMilliseconds = clockings[1] + oneHourInMilliseconds + randomTime;

    schedule(timeInMilliseconds)
  }

  if (clockings.length === 3) {
    const firstInside = clockings[0]; // 08:00 28.800.000
    const firstOutside = clockings[1]; // 12:00 43.200.000

    const totalHour =  31_680_000; // 8h 48min;

    const firstHourDiff = firstOutside - firstInside; // 4h 14.400.000
    const hoursToFinish = totalHour - firstHourDiff; // 4h 40min 16.800.000

    timeInMilliseconds = clockings[2] + hoursToFinish + randomTime;

    schedule(timeInMilliseconds)
  }

  notification({
    title: 'Ponto agendado!',
    body: 'Próximo ponto agendado para ' + time.millisecondsToHour(timeInMilliseconds) + 'h'
  }, () => { mainWindow.show() });

  return timeInMilliseconds;
}

function notification(options?: NotificationConstructorOptions, handler?: () => void): void {
  const notification = new Notification({
    icon: clockImage,
    urgency: 'critical',
    ...options,
  });

  if (handler) {
    notification.on('click', () => {
      handler();
      notification.off('click', void 0);
    });
  }

  notification.show();
}

function httpIpcSubscriber(): void {
  ipcMain.on(IpcProcessEnum.HTTP, async (event, baseUrl, method: HttpMethodsEnum, endpoint: string, data?: any, cookies?: string[], config?: CreateAxiosDefaults<any>): Promise<HttpEitherResponse<unknown>> => {
    const http = new IpcHttpService(baseUrl, config);

    if (cookies?.length)
      http.setCookies(cookies);

    let response = null;

    if (method === HttpMethodsEnum.GET)
      response = await http.get(endpoint);

    if (method === HttpMethodsEnum.POST)
      response = await http.post(endpoint, data);

    if (method === HttpMethodsEnum.PUT)
      response = await http.put(endpoint, data);

    if (method === HttpMethodsEnum.DELETE)
      response = await http.delete(endpoint);

    if (response && response.isRight())
      return void event.reply(IpcProcessEnum.HTTP, response.value);

    return void event.reply(IpcProcessEnum.HTTP_ERROR, response?.value);
  });
}

function frameIpcSubscriber(mainWindow: BrowserWindow): void {
  ipcMain.on(IpcProcessEnum.FRAME, async (event, action) => {
    if (action === FrameActionsEnum.HIDE)
      mainWindow.hide();

    if (action === FrameActionsEnum.SHOW) {
      mainWindow.show();
      mainWindow.focus();
    }

    if (action === FrameActionsEnum.RELOAD) {
      mainWindow.reload();
    }
  });
}

function registerPointIpcSubscriber(): void {
  ipcMain.on(IpcProcessEnum.REGISTER, async (event, baseUrl, clockingIn) => {
    const result = await registerPoint(baseUrl, clockingIn);
    return void event.reply(IpcProcessEnum.REGISTER, result);
  });
}

async function registerPoint(baseUrl: string, clockingIn: ClockingIn): Promise<number> {
  const clockingInService = new IpcClockingInService(baseUrl, {
    headers: {
      'x-totvs-app': '0533',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Origin': 'https://portal.facens.br',
      'Referer': 'https://portal.facens.br/FrameHTML/web/app/RH/PortalMeuRH/',
      'Content-Type':	'application/json',
      Cookie: "DefaultAlias=CorporeRM",
    },
  });

  return await clockingInService.register(clockingIn);
}

function trayConfig(browserWindow: BrowserWindow): void {
  const tray = new Tray(clockImage)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Parar serviço', click: () => browserWindow.close() }
  ]);

  tray.setToolTip('Self Point');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (browserWindow.isVisible()) {
      browserWindow.hide();
      return;
    }

    browserWindow.show();
    browserWindow.focus();
  });
}
