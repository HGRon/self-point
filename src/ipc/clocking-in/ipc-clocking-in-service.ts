import { ClockingIn } from './models/clocking-in';
import { IpcHttpService } from '../http/ipc-http-service';
import { CreateAxiosDefaults } from 'axios';
import { Time } from '../../renderer/helpers/time';

export class IpcClockingInService {

  constructor(
    baseUrl: string,
    config?: CreateAxiosDefaults<any>,
  ) {
    this.http = new IpcHttpService(baseUrl, config);
  }

  private readonly http: IpcHttpService;

  public async register(clockingIn: ClockingIn): Promise<number> {
    if (clockingIn.username === '' || clockingIn.password === '')
      throw new Error('Não encontramos seus dados de acesso, clique em ⚙️ para configurar!');

    const login = await this.http.post('auth/login', {
      user: clockingIn.username ,
      password: clockingIn.password,
    });

    if (login.isLeft())
      throw new Error(login.value.message);

    const cookies = this.http.getCookies<string[]>(login.value.response, 'set-cookie');
    this.http.setCookies(cookies);

    const context = await this.http.get('setting/context');

    if (context.isLeft())
      throw new Error('Falha ao obter dados do usuário');

    const now = new Date();
    const time = new Time();

    const hour = time.hourToMilliseconds(now);
    const date = time.formatToString(now);

    if (clockingIn.latitude === '' || clockingIn.longitude === '' || clockingIn.address === '')
      throw new Error('Não encontramos seus dados de endereço, clique em ⚙️ para configurar!');

    // Realizar a chamada para registrar o horário
    // {"latitude":"-23.4356736","longitude":"-47.0614016","timezone":180,"date":"2024-04-19T00:00:00.000Z","hour":25380000,"address":"Estrada do Centenário,  Centro,  São Paulo, Brasil"}
    const response = await this.http.post(
      'timesheet/clockingsGeolocation/%7Bcurrent%7D',
      {
        latitude: clockingIn.latitude || "-23.4356736",
        longitude: clockingIn.longitude || "-47.0614016",
        timezone: 180,
        date: date,
        hour: hour,
        address: clockingIn.address || "Estrada do Centenário,  Centro,  São Paulo, Brasil"
      }
    );

    if (login.isLeft())
      throw new Error(login.value.message);

    return hour;
  }

}

