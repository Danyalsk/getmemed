import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";

import type { ApiError } from "../contracts/common";
import { AppError } from "../lib/errors";

interface ClientHttpError {
  status: number;
  message: string;
}

function isClientHttpError(err: unknown): err is ClientHttpError {
  return (
    err instanceof Error &&
    "status" in err &&
    typeof err.status === "number" &&
    "expose" in err &&
    err.expose === true
  );
}

function isDuplicateKeyError(err: unknown): boolean {
  return err instanceof mongoose.mongo.MongoServerError && err.code === 11000;
}

function toFieldErrors(err: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    const path = issue.path.join(".") || "_";
    fields[path] ??= issue.message;
  }
  return fields;
}

export const notFoundHandler: RequestHandler = (req) => {
  throw AppError.notFound(`Route ${req.method} ${req.path}`);
};

export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  const send = (status: number, body: ApiError): void => {
    res.status(status).json(body);
  };

  if (err instanceof ZodError) {
    send(400, {
      error: { code: "VALIDATION_ERROR", message: "Invalid request", fields: toFieldErrors(err) },
    });
    return;
  }
  if (err instanceof AppError) {
    send(err.status, { error: { code: err.code, message: err.message } });
    return;
  }
  if (isDuplicateKeyError(err)) {
    send(409, { error: { code: "CONFLICT", message: "This record already exists" } });
    return;
  }
  if (isClientHttpError(err)) {
    send(err.status, { error: { code: "VALIDATION_ERROR", message: err.message } });
    return;
  }

  console.error(err);
  send(500, { error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
};
