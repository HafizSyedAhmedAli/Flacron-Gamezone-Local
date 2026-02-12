import { Router } from "express";
import Stripe from "stripe";
import { requireAuth, AuthRequest } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

export const billingRouter = Router();

const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeKey ? new Stripe(stripeKey) : null;

/**
 * POST /api/billing/checkout
 * Create a Stripe Checkout session for subscription
 */
billingRouter.post("/checkout", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const plan = String(req.body?.plan || "monthly"); // "monthly" | "yearly"

    if (!["monthly", "yearly"].includes(plan)) {
      return res.status(400).json({ error: "Invalid plan type" });
    }

    const priceId =
      plan === "yearly"
        ? process.env.STRIPE_PRICE_YEARLY
        : process.env.STRIPE_PRICE_MONTHLY;

    if (!priceId) {
      return res
        .status(500)
        .json({ error: "Stripe price not configured for this plan" });
    }

    const user = req.user!;

    // Get or create subscription record atomically
    let subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        status: "inactive",
      },
      update: {},
    });

    // Get or create Stripe customer
    let customerId = subscription.stripeCustomerId;

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

    // ✅ CHECK FOR EXISTING ACTIVE SUBSCRIPTIONS
    if (customerId) {
      const existingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 100,
      });

      // If user has any active subscriptions, prevent creating a new one
      if (existingSubscriptions.data.length > 0) {
        const activeSub = existingSubscriptions.data[0];

        // Check if it's for the same price (same plan)
        const currentPriceId = activeSub.items.data[0]?.price.id;

        if (currentPriceId === priceId) {
          return res.status(400).json({
            error: "You already have an active subscription for this plan",
            existingSubscription: true,
            currentPlan: plan,
          });
        } else {
          // Different plan - they want to switch
          return res.status(400).json({
            error:
              "You already have an active subscription. Please cancel your current subscription before subscribing to a new plan.",
            existingSubscription: true,
            currentPlan:
              currentPriceId === process.env.STRIPE_PRICE_MONTHLY
                ? "monthly"
                : "yearly",
            requestedPlan: plan,
          });
        }
      }

      // Also check for trialing, past_due, or unpaid subscriptions
      const pendingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 100,
      });

      const activeOrPending = pendingSubscriptions.data.filter((sub) =>
        ["active", "trialing", "past_due"].includes(sub.status),
      );

      if (activeOrPending.length > 0) {
        return res.status(400).json({
          error:
            "You already have a subscription. Please manage your existing subscription first.",
          existingSubscription: true,
        });
      }
    }

    // Create checkout session (only if no active subscription exists)
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_ORIGIN}/dashboard?success=1`,
      cancel_url: `${process.env.FRONTEND_ORIGIN}/pricing?canceled=1`,
      metadata: {
        userId: user.id,
        plan: plan,
      },
      // ✅ PREVENT DUPLICATE SUBSCRIPTIONS AT STRIPE LEVEL
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: plan,
        },
      },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to create checkout session" });
  }
});

/**
 * POST /api/billing/webhook
 * Handle Stripe webhook events
 */
billingRouter.post("/webhook", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).send("Stripe not configured");
    }

    const sig = req.headers["stripe-signature"];
    const secret = process.env.STRIPE_WEBHOOK_SECRET || "";

    if (!secret) {
      return res.status(500).send("Webhook secret not configured");
    }

    if (!sig) {
      return res.status(400).send("No signature provided");
    }

    let event: Stripe.Event;

    try {
      // Use raw body for webhook verification
      event = stripe.webhooks.constructEvent(
        (req as any).rawBody,
        sig as string,
        secret,
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`Received webhook: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(500).send(`Webhook Error: ${error.message}`);
  }
});

/**
 * GET /api/billing/subscription
 * Get current user's subscription details
 */
billingRouter.get(
  "/subscription",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;

      const subscription = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      if (!subscription) {
        return res.json({
          status: "inactive",
          plan: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        });
      }

      res.json({
        status: subscription.status,
        plan: subscription.plan,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      });
    } catch (error: any) {
      console.error("Get subscription error:", error);
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  },
);

billingRouter.post("/cancel", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const user = req.user!;

    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!subscription?.stripeSubscriptionId) {
      return res.status(404).json({ error: "No active subscription found" });
    }

    // ✅ Cancel subscription instantly in Stripe
    const canceledSubscription = await stripe.subscriptions.cancel(
      subscription.stripeSubscriptionId,
      { invoice_now: true, prorate: true },
    );

    // ✅ Update database
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: "canceled",
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      },
    });

    res.json({
      message: "Subscription canceled ",
      canceledAt: new Date(canceledSubscription.canceled_at! * 1000),
      status: canceledSubscription.status,
    });
  } catch (error: any) {
    console.error("Instant cancel subscription error:", error);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

/**
 * POST /api/billing/reactivate
 * Reactivate a canceled subscription
 */
billingRouter.post(
  "/reactivate",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: "Stripe not configured" });
      }

      const user = req.user!;

      const subscription = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      if (!subscription?.stripeSubscriptionId) {
        return res.status(404).json({ error: "No subscription found" });
      }

      if (!subscription.cancelAtPeriodEnd) {
        return res
          .status(400)
          .json({ error: "Subscription is not scheduled for cancellation" });
      }

      // Reactivate in Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });

      // Update in database
      await prisma.subscription.update({
        where: { userId: user.id },
        data: {
          cancelAtPeriodEnd: false,
          updatedAt: new Date(),
        },
      });

      res.json({ message: "Subscription reactivated successfully" });
    } catch (error: any) {
      console.error("Reactivate subscription error:", error);
      res.status(500).json({ error: "Failed to reactivate subscription" });
    }
  },
);

/**
 * POST /api/billing/portal
 * Create Stripe customer portal session
 */
billingRouter.post("/portal", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const user = req.user!;

    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!subscription?.stripeCustomerId) {
      return res.status(404).json({ error: "No customer found" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.FRONTEND_ORIGIN}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Portal session error:", error);
    res.status(500).json({ error: "Failed to create portal session" });
  }
});

/**
 * ✅ NEW ENDPOINT: Cancel all duplicate subscriptions for a user
 * POST /api/billing/cleanup-duplicates
 * This helps clean up any existing duplicate subscriptions
 */
billingRouter.post(
  "/cleanup-duplicates",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: "Stripe not configured" });
      }

      const user = req.user!;

      const subscription = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      if (!subscription?.stripeCustomerId) {
        return res.status(404).json({ error: "No customer found" });
      }

      // Get all subscriptions for this customer
      const allSubscriptions = await stripe.subscriptions.list({
        customer: subscription.stripeCustomerId,
        status: "all",
        limit: 100,
      });

      const activeSubs = allSubscriptions.data.filter((sub) =>
        ["active", "trialing"].includes(sub.status),
      );

      if (activeSubs.length <= 1) {
        return res.json({
          message: "No duplicate subscriptions found",
          count: activeSubs.length,
        });
      }

      // Keep the most recent one, cancel the rest
      const sortedSubs = activeSubs.sort((a, b) => b.created - a.created);
      const keepSub = sortedSubs[0];
      const cancelSubs = sortedSubs.slice(1);

      const canceledIds = [];
      for (const sub of cancelSubs) {
        await stripe.subscriptions.cancel(sub.id);
        canceledIds.push(sub.id);
      }

      // Update database to reflect the kept subscription
      await prisma.subscription.update({
        where: { userId: user.id },
        data: {
          stripeSubscriptionId: keepSub.id,
          status: keepSub.status,
          updatedAt: new Date(),
        },
      });

      res.json({
        message: `Cleaned up ${canceledIds.length} duplicate subscription(s)`,
        kept: keepSub.id,
        canceled: canceledIds,
      });
    } catch (error: any) {
      console.error("Cleanup duplicates error:", error);
      res.status(500).json({ error: "Failed to cleanup duplicates" });
    }
  },
);

// Helper functions for webhook handlers

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = String(subscription.customer);
  const stripeSubId = subscription.id;
  const status = subscription.status;
  const firstItem = subscription.items.data[0] as any;

  const currentPeriodStart = firstItem
    ? new Date(firstItem.current_period_start * 1000)
    : null;

  const currentPeriodEnd = firstItem
    ? new Date(firstItem.current_period_end * 1000)
    : null;

  const cancelAtPeriodEnd = subscription.cancel_at_period_end;

  // Determine plan type from price
  let plan: string | null = null;
  if (
    subscription.items.data[0]?.price.id === process.env.STRIPE_PRICE_MONTHLY
  ) {
    plan = "monthly";
  } else if (
    subscription.items.data[0]?.price.id === process.env.STRIPE_PRICE_YEARLY
  ) {
    plan = "yearly";
  }

  // Find subscription by customer ID
  const record = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!record) {
    console.error(`Subscription not found for customer: ${customerId}`);
    return;
  }

  await prisma.subscription.update({
    where: { id: record.id },
    data: {
      stripeSubscriptionId: stripeSubId,
      status,
      plan,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      updatedAt: new Date(),
    },
  });

  console.log(`Updated subscription for customer: ${customerId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = String(subscription.customer);

  const record = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!record) {
    console.error(`Subscription not found for customer: ${customerId}`);
    return;
  }

  await prisma.subscription.update({
    where: { id: record.id },
    data: {
      status: "canceled",
      cancelAtPeriodEnd: false,
      updatedAt: new Date(),
    },
  });

  console.log(`Canceled subscription for customer: ${customerId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const customerId = String(invoice.customer);

  const record = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!record) return;

  // Ensure status is active after successful payment
  await prisma.subscription.update({
    where: { id: record.id },
    data: {
      status: "active",
      updatedAt: new Date(),
    },
  });

  console.log(`Payment succeeded for customer: ${customerId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) {
    return;
  }

  const customerId = String(invoice.customer);

  const record = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!record) return;

  await prisma.subscription.update({
    where: { id: record.id },
    data: {
      status: "past_due",
      updatedAt: new Date(),
    },
  });

  console.log(`Payment failed for customer: ${customerId}`);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = String(session.customer);

  console.log(`Checkout completed for customer: ${customerId}`);

  // The subscription.created event will handle the actual subscription update
}
