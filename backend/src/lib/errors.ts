import type { ErrorCode } from "../contracts/common";

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  readonly status: number;

  constructor(
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
    this.status = STATUS_BY_CODE[code];
  }

  static badRequest(message: string): AppError {
    return new AppError("VALIDATION_ERROR", message);
  }

  static unauthorized(message = "Authentication required"): AppError {
    return new AppError("UNAUTHORIZED", message);
  }

  static forbidden(message = "You don't have access to this resource"): AppError {
    return new AppError("FORBIDDEN", message);
  }

  static notFound(resource: string): AppError {
    return new AppError("NOT_FOUND", `${resource} not found`);
  }

  static conflict(message: string): AppError {
    return new AppError("CONFLICT", message);
  }
}
