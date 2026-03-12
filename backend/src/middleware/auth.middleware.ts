import type { Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { userRepository } from "../repositories/user.repository.js";
import type { AuthRequest } from "../types/index.js";

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const hdr = req.headers.authorization;
  if (!hdr?.startsWith("Bearer "))
    return res.status(401).json({ error: "Unauthorized" });

  const token = hdr.slice("Bearer ".length);
  try {
    const decoded = authService.verifyToken(token);
    const user = await userRepository.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      subscription: (user as any).subscription ?? null,
    };
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role !== "ADMIN")
    return res.status(403).json({ error: "Forbidden" });
  return next();
}

export function requirePremium(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  if (user.role === "ADMIN") return next();

  if (user.subscription?.status !== "active") {
    return res.status(403).json({
      error: "Premium subscription required",
      code: "PREMIUM_REQUIRED",
    });
  }
  return next();
}
