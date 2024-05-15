import { AxiosResponse } from 'axios';

export interface HttpOutput<T> {
  data: T;
  response?: Partial<AxiosResponse<T, unknown>>;
}
