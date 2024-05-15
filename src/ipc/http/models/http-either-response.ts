import { Either } from '../../../renderer/helpers/either';
import { HttpError } from './http-error';
import { HttpOutput } from './http-output';

export type HttpEitherResponse<T> = Either<HttpError, HttpOutput<T>>
