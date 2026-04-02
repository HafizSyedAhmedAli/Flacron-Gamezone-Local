import type { Response } from "express";
import { billingService } from "../services/billing.service.js";
import type { AuthRequest } from "../types/index.js";

export const billingController = {
  async checkout(req: AuthRequest, res: Response) {
    const plan = String(req.body?.plan ?? "monthly") as "monthly" | "yearly";
    if (!["monthly", "yearly"].includes(plan))
      return res.status(400).json({ error: "Invalid plan type" });
    const url = await billingService.createCheckoutSession(
      req.user!.id,
      req.user!.email,
      plan
    );
    res.json({ url });
  },

  async webhook(req: any, res: Response) {
    const sig = req.headers["stripe-signature"];
    if (!sig) return res.status(400).send("No signature provided");
    await billingService.handleWebhook(req.body, sig as string);
    res.json({ received: true });
  },

  async getSubscription(req: AuthRequest, res: Response) {
    const data = await billingService.getSubscription(req.user!.id);
    res.json(data);
  },

  async cancel(req: AuthRequest, res: Response) {
    const result = await billingService.cancelSubscription(req.user!.id);
    res.json({ message: "Subscription canceled", ...result });
  },

  async reactivate(req: AuthRequest, res: Response) {
    await billingService.reactivateSubscription(req.user!.id);
    res.json({ message: "Subscription reactivated successfully" });
  },

  async portal(req: AuthRequest, res: Response) {
    const url = await billingService.createPortalSession(req.user!.id);
    res.json({ url });
  },
};