import type { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  status?: number;
  existingSubscription?: boolean;
  currentPlan?: string;
  requestedPlan?: string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = err.status ?? 500;
  const message = err.message ?? "Internal server error";

  if (status >= 500) console.error("[ERROR]", err);

  const body: Record<string, unknown> = { error: message };
  if (err.existingSubscription !== undefined)
    body.existingSubscription = err.existingSubscription;
  if (err.currentPlan !== undefined) body.currentPlan = err.currentPlan;
  if (err.requestedPlan !== undefined) body.requestedPlan = err.requestedPlan;

  return res.status(status).json(body);
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
