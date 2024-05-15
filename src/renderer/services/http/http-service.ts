import { IpcProcessEnum } from '../../../ipc/ipc-process.enum';
import { HttpMethodsEnum } from '../../../ipc/http/models/http-methods.enum';
import { AxiosResponse, CreateAxiosDefaults } from 'axios';
import { HttpEitherResponse } from '../../../ipc/http/models/http-either-response';
import { HttpOutput } from '../../../ipc/http/models/http-output';

export class HttpService {

  constructor(
    config?: CreateAxiosDefaults<any>
  ) {
    this._config = config;
  }

  private _baseUrl: string;

  private readonly _config: CreateAxiosDefaults<any>;

  public setBaseUrl(baseUrl: string) {
    this._baseUrl = baseUrl;
  }

  public async request(method: HttpMethodsEnum, endpoint: string, data?: any, cookies?: string[]): Promise<HttpOutput<unknown>> {
    if (this._baseUrl === '')
      throw new Error('É necessário definir a URL base!');

    const ipc = (window as any).api.ipcEvent;
    return await ipc(IpcProcessEnum.HTTP, this._baseUrl, method, endpoint, data, cookies, this._config);
  }

  public getCookies<T>(response: Partial<AxiosResponse<any, any>>, key: string): T {
    return response.headers[key] as T;
  }

}
