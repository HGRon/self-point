import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults } from 'axios';
import { Left, Right } from '../../renderer/helpers/either';
import { HttpEitherResponse } from './models/http-either-response';

export class IpcHttpService {

  constructor(
    baseUrl?: string,
    config?: CreateAxiosDefaults<any>,
  ) {
    this._baseUrl = baseUrl;
    this._axios = axios.create(config);
  }

  private readonly _axios: AxiosInstance;

  private _baseUrl: string;

  public async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<HttpEitherResponse<T>> {
    return await this._axios
      .get<T>(this._buildUrl(endpoint), config)
      .then(r => this._response(r))
      .catch(e => this._error(e));
  }

  public async post<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig):  Promise<HttpEitherResponse<T>> {
    return await this._axios
      .post<T>(this._buildUrl(endpoint), data, config)
      .then(r => this._response(r))
      .catch(e => this._error(e));
  }

  public async put<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<HttpEitherResponse<T>> {
    return await this._axios
      .put<T>(this._buildUrl(endpoint), data, config)
      .then(r => this._response(r))
      .catch(e => this._error(e));
  }

  public async delete<T>(endpoint: string, config?: AxiosRequestConfig):  Promise<HttpEitherResponse<T>> {
    return await this._axios
      .delete<T>(this._buildUrl(endpoint), config)
      .then(r => this._response(r))
      .catch(e => this._error(e));
  }

  public setCookies(newCookies: string[]): void {
    this._axios.defaults.headers.Cookie = newCookies
      .map(cookie => cookie.split(';')[0])
      .join('; ');
  }

  public getCookies<T>(response: Partial<AxiosResponse<any, any>>, key: string): T {
    return response.headers[key] as T;
  }

  private _buildUrl(url: string): string {
    return `${ this._baseUrl }/${ url }`
  }

  private _response<T>(response: AxiosResponse<T, unknown>): HttpEitherResponse<T> {
    return new Right({ data: response.data, response: { headers: response.headers } });
  }

  private _error<T>(error: Error): HttpEitherResponse<T> {
    return new Left(error);
  }

}
