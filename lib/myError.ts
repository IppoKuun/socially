export class myError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string, // ex: 'USER_NOT_FOUND'
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}
