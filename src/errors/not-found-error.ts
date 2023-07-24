import { ApplicationError } from '@/protocols';

export function notFoundError(message?: string): ApplicationError {
  return {
    name: 'NotFoundError',
    message: 'No result for this search!',
  };
}
