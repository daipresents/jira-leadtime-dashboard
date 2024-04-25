export class BadRequestError extends Error {
  constructor(message?: string) {
      super(message || 'Bad Request');
      this.name = 'BadRequestError';
      Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
