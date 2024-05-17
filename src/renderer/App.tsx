import './style.scss';
import DraggableCircle from './components/draggable-circle';
import React, { useEffect } from 'react';
import ModalConfig from './components/modal-config';
import Button from './components/button';
import { ButtonSizeEnum } from './components/button/models/button-size.enum';
import { ButtonAnimationEnum } from './components/button/models/button-animation.enum';
import { FrameService } from './services/frame/frame-service';
import { GetClockingService } from './services/get-cloking/get-clocking-service';
import { StorageService } from './services/storage/storage-service';
import { UserConfig } from './components/modal-config/models/user-config';
import { StorageKeyEnum } from './services/storage/models/storage-key.enum';
import { notify, notifyDismiss } from './components/toast/services/notify';
import { ToastTypeEnum } from './components/toast/models/toast-type.enum';
import TagHour from './components/tag-hour';
import Loading from './components/loading';
import { Time } from './helpers/time';
import { CronService } from './services/cron/cron-service';
import { ClockingInService } from './services/cloking-in/clocking-in-service';
import Toggle from './components/toggle';

function App() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [registerLoading, setRegisterLoading] = React.useState(false);
  const [schedule, setSchedule] = React.useState('');
  const [clocking, setClocking] = React.useState(['']);
  const [clockingLoading, setClockingLoading] = React.useState(true);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleOpenModal = (): void => {
    setIsOpen(!isOpen);
  }

  const handleClose = async (): Promise<void> => {
    await close();
  }

  const handlerToggle = async (toggle: boolean): Promise<void> => {
    updateStyleMode(toggle);
    await saveIsDark(toggle);
  }

  const getDarkMode = async (): Promise<void> => {
    const dark = await isDark();
    updateStyleMode(dark);

    setIsDarkMode(dark);
  }

  const updateStyleMode = (isDark: boolean): void => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  const getTodayPoints = async () => {
    try {
      setClockingLoading(true);

      const getClocking = new GetClockingService();

      const userConfig = await getUserConfig();

      const newClocking = await getClocking.getToday({
        username: userConfig.username,
        password: userConfig.password,
        url: userConfig.url,
      });

      const time = new Time();

      setClocking(newClocking.map(nc => time.millisecondsToHour(nc)));

      const cronService = new CronService();

      const sch = await cronService.schedule(newClocking);
      setSchedule(time.millisecondsToHour(sch.time));
    } catch (e) {
      notify(e.message, ToastTypeEnum.ERROR);
    } finally {
      setClockingLoading(false);
    }
  }

  const registerPoint = async (): Promise<void> => {
    if (registerLoading)
      return;

    const tId = notify('Registrando ponto', ToastTypeEnum.LOADING);

    try {
      if (clocking.length >= 4)
        throw new Error('O limite de ponto por dia foi atingido.');

      setRegisterLoading(true);

      const clockingInService = new ClockingInService();
      const userConfig = await getUserConfig();

      await clockingInService.register(userConfig);

      await getTodayPoints();

      notify('Ponto registrado com sucesso.', ToastTypeEnum.SUCCESS);
    } catch (e) {
      notify(e.message, ToastTypeEnum.ERROR);
    } finally {
      setRegisterLoading(false);
      notifyDismiss(tId);
    }
  }

  const reload = async (): Promise<void> => {
    const frameService = new FrameService();
    await frameService.reload();
  }

  const onInit = async (): Promise<void> => {
    await getDarkMode();
    await getTodayPoints();

    setIsLoading(false);
  }

  useEffect((): void => {
    onInit().then();
  }, []);

  return (
    <main className="app">

      <header className="app__header">
        <Button onClick={ handleOpenModal } animation={ ButtonAnimationEnum.HOVER_SCALE } size={ ButtonSizeEnum.LARGE } >⚙️</Button>
        <Toggle onChange={ handlerToggle } trueIcon="🌑" falseIcon="☀️" disabled={ isLoading } startValue={ isDarkMode } />

        <div className="app__header__movable"></div>

        <Button onClick={ handleClose } animation={ ButtonAnimationEnum.HOVER_SCALE } size={ ButtonSizeEnum.LARGE }>❌</Button>
      </header>

      <h2>Hora de bater o ponto!</h2>

      <Button onClick={ reload }>Atualizar</Button>

      <DraggableCircle disabled={ isLoading } onComplete={ registerPoint } />

      <ModalConfig isOpen={ isOpen } forceClose={ () => setIsOpen(false) } />

      <div className="app__hours">
        { clockingLoading ?
          <Loading size={ 25 } isActive={ true } /> :
          <div>
            <TagHour hours={ clocking } />
            <small>{ `Próximo ponto: ${ schedule || 'N/D' } ` }</small>
          </div>
        }
      </div>

    </main>
  )
}

export default App

async function close(): Promise<void> {
  const frameService = new FrameService();
  await frameService.hide();
}

async function getUserConfig(): Promise<UserConfig> {
  const storage = new StorageService();
  const userConfig = await storage.get<UserConfig>(StorageKeyEnum.USER_CONFIG);

  if (!userConfig)
    throw new Error('Não foi possível encontrar as configurações.')

  return userConfig;
}

async function isDark(): Promise<boolean> {
  const storage = new StorageService();
  const dark = await storage.get<string>(StorageKeyEnum.DARK_MODE);

  if (!dark)
    return false;

  const darkParsed = JSON.parse(dark as string);
  return darkParsed.isDark;
}

async function saveIsDark(isDark: boolean): Promise<void> {
  const storage = new StorageService();
  await storage.set<string>(StorageKeyEnum.DARK_MODE, JSON.stringify({ isDark }));
}
