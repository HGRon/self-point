import { GetClocking } from './models/get-clocking';
import { Time } from '../../helpers/time';
import { HttpService } from '../http/http-service';
import { HttpMethodsEnum } from '../../../ipc/http/models/http-methods.enum';

export class GetClockingService {

  private readonly http: HttpService = new HttpService({
    headers: {
      'x-totvs-app': '0533',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Origin': 'https://portal.facens.br',
      'Referer': 'https://portal.facens.br/FrameHTML/web/app/RH/PortalMeuRH/',
      'Content-Type':	'application/json',
      Cookie: "DefaultAlias=CorporeRM",
    },
  });

  public async getToday(getClocking: GetClocking): Promise<number[]> {
    if (getClocking.url === '')
      throw new Error('Não encontramos a URL, clique em ⚙️ para configurar!');

    this.http.setBaseUrl(getClocking.url);

    if (getClocking.username === '' || getClocking.password === '')
      throw new Error('Não encontramos seus dados de acesso, clique em ⚙️ para configurar!');

    const login = await this.http
      .request(HttpMethodsEnum.POST, 'auth/login', {
        user: getClocking.username ,
        password: getClocking.password,
      }).catch(e => {
        throw new Error('Falha ao realizar o login' + e);
      });

    const cookies = this.http.getCookies<string[]>(login.response, 'set-cookie');

    const time = new Time();

    const now = new Date();
    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0);
    now.setHours(0);

    const nowString = time.formatToString(now);
    const tomorrowString = time.formatToString(tomorrow);

    const timeSheetsUrl = (`timesheet/clockings/%7Bcurrent%7D/?initPeriod=${ nowString }&endPeriod=${ tomorrowString }`);

    const timeSheets = await this.http
      .request(HttpMethodsEnum.GET, timeSheetsUrl, null, cookies)
      .catch(e => {
        throw new Error('Falha ao obter pontos' + e);
      });

    const clockings = (timeSheets.data as any).clockings
      .filter((c: any) => nowString.includes(c.date.split('T')[0]));

    return clockings.length ? clockings.map((c: any) => c.hour) : [];
  }

}
