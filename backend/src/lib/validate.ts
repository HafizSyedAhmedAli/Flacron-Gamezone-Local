import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

export function validateBody(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    }
    (req as any).validated = parsed.data;
    next();
  };
}
