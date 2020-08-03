import { ValidationError } from 'express-validator';

export class RequestValidationError extends Error {
  constructor(public errors: ValidationError[]) {
    super(); // 'Error' breaks prototype chain here

    Object.setPrototypeOf(this, RequestValidationError.prototype); // restore prototype chain
  }
}
