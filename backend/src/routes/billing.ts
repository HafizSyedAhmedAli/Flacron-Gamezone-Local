import { Router } from "express";
import Stripe from "stripe";
import { requireAuth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

export const billingRouter = Router();

const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeKey ? new Stripe(stripeKey) : null;

billingRouter.post("/checkout", requireAuth, async (req, res) => {
  if (!stripe) return res.status(400).json({ error: "Stripe not configured" });

  const plan = String(req.body?.plan || "monthly"); // "monthly" | "yearly"
  const priceId =
    plan === "yearly"
      ? process.env.STRIPE_PRICE_YEARLY
      : process.env.STRIPE_PRICE_MONTHLY;
  if (!priceId)
    return res.status(400).json({ error: "Stripe price not configured" });

  const user = (req as any).user;

  // Ensure subscription row exists
  const sub = await prisma.subscription.upsert({
    where: { userId: user.id },
    create: { userId: user.id, status: "inactive" },
    update: {},
  });

  let customerId = sub.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.subscription.update({
      where: { userId: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_ORIGIN}/dashboard?success=1`,
    cancel_url: `${process.env.FRONTEND_ORIGIN}/pricing?canceled=1`,
  });

  res.json({ url: session.url });
});

// Stripe webhook must use raw body; configured in index.ts
billingRouter.post("/webhook", async (req, res) => {
  if (!stripe) return res.status(400).send("Stripe not configured");
  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if (!secret) return res.status(400).send("Webhook secret not set");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      (req as any).rawBody,
      sig as string,
      secret
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const type = event.type;

  async function upsertFromSubscription(sub: Stripe.Subscription) {
    const customerId = String(sub.customer);
    const stripeSubId = sub.id;
    const status = sub.status;
    const currentPeriodEnd = sub.current_period_end
      ? new Date(sub.current_period_end * 1000)
      : null;

    // Find by customerId
    const record = await prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId },
    });
    if (!record) return;

    await prisma.subscription.update({
      where: { id: record.id },
      data: {
        stripeSubscriptionId: stripeSubId,
        status,
        currentPeriodEnd,
      },
    });
  }

  if (
    type === "customer.subscription.created" ||
    type === "customer.subscription.updated" ||
    type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    await upsertFromSubscription(sub);
  }

  res.json({ received: true });
});
