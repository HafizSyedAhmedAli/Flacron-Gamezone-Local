import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "./prisma.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export type JwtPayload = { userId: string; role: "USER" | "ADMIN" };

export function signToken(payload: JwtPayload) {
  const secret = process.env.JWT_SECRET || "dev_secret";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

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
    const secret = process.env.JWT_SECRET || "dev_secret";
    const decoded = jwt.verify(token, secret) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { subscription: true },
    });
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    (req as any).user = {
      id: user.id,
      role: user.role,
      email: user.email,
      subscription: user.subscription,
    };
    return next();
  } catch (err: any) {
    console.log("JWT ERROR:", err.message);
    return res.status(401).json({ error: err.message });
  }
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const u = (req as any).user;
  if (!u) return res.status(401).json({ error: "Unauthorized" });
  if (u.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  return next();
}
