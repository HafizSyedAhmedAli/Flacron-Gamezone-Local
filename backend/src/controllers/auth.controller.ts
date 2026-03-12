import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";

export const authController = {
  async signup(req: Request, res: Response) {
    const { email, password } = (req as any).validated;
    const result = await authService.register(email, password);
    res.json(result);
  },

  async login(req: Request, res: Response) {
    const { email, password } = (req as any).validated;
    const result = await authService.login(email, password);
    res.json(result);
  },
};
