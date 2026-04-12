import Stripe from "stripe";
import { config } from "../config/index.js";
import { subscriptionRepository } from "../repositories/subscription.repository.js";

const stripe = config.stripe.secretKey
  ? new Stripe(config.stripe.secretKey)
  : null;

function requireStripe(): Stripe {
  if (!stripe)
    throw Object.assign(new Error("Stripe not configured"), { status: 500 });
  return stripe;
}

export const billingService = {
  async createCheckoutSession(
    userId: string,
    email: string,
    plan: "monthly" | "yearly",
  ) {
    const s = requireStripe();
    const priceId =
      plan === "yearly"
        ? config.stripe.prices.yearly
        : config.stripe.prices.monthly;
    if (!priceId)
      throw Object.assign(
        new Error("Stripe price not configured for this plan"),
        { status: 500 },
      );

    const subscription = await subscriptionRepository.upsertForUser(userId);

    let customerId = subscription.stripeCustomerId;
    if (!customerId) {
      const customer = await s.customers.create({
        email,
        metadata: { userId },
      });
      customerId = customer.id;
      await subscriptionRepository.update(subscription.id, {
        stripeCustomerId: customerId,
      });
    }

    const existingSubs = await s.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 100,
    });
    if (existingSubs.data.length > 0) {
      const currentPriceId = existingSubs.data[0].items.data[0]?.price.id;
      if (currentPriceId === priceId)
        throw Object.assign(
          new Error("You already have an active subscription for this plan"),
          { status: 400, existingSubscription: true, currentPlan: plan },
        );
      throw Object.assign(
        new Error(
          "Cancel your current subscription before subscribing to a new plan.",
        ),
        { status: 400, existingSubscription: true },
      );
    }

    const pending = await s.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 100,
    });
    const activeOrPending = pending.data.filter((sub) =>
      ["active", "trialing", "past_due"].includes(sub.status),
    );
    if (activeOrPending.length > 0)
      throw Object.assign(
        new Error("You already have a subscription. Please manage it first."),
        { status: 400, existingSubscription: true },
      );

    const incompleteSubs = pending.data.filter((sub) =>
      ["incomplete", "incomplete_expired"].includes(sub.status),
    );
    for (const sub of incompleteSubs) {
      try {
        await s.subscriptions.cancel(sub.id);
      } catch {}
    }

    const session = await s.checkout.sessions.create(
      {
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${config.cors.origin}/dashboard?success=1`,
        cancel_url: `${config.cors.origin}/pricing?canceled=1`,
        metadata: { userId, plan },
        subscription_data: { metadata: { userId, plan } },
      },
      { idempotencyKey: `checkout_${userId}_${plan}_${Date.now()}` },
    );

    return session.url;
  },

  async getSubscription(userId: string) {
    const subscription = await subscriptionRepository.findByUserId(userId);
    if (!subscription)
      return {
        status: "inactive",
        plan: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    return {
      status: subscription.status,
      plan: subscription.plan,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };
  },

  async cancelSubscription(userId: string) {
    const s = requireStripe();
    const subscription = await subscriptionRepository.findByUserId(userId);
    if (!subscription?.stripeSubscriptionId)
      throw Object.assign(new Error("No active subscription found"), {
        status: 404,
      });

    const canceled = await s.subscriptions.cancel(
      subscription.stripeSubscriptionId,
      { invoice_now: true, prorate: true },
    );

    await subscriptionRepository.updateByUserId(userId, {
      status: "canceled",
      cancelAtPeriodEnd: false,
    });

    return {
      canceledAt: new Date(canceled.canceled_at! * 1000),
      status: canceled.status,
    };
  },

  async reactivateSubscription(userId: string) {
    const s = requireStripe();
    const subscription = await subscriptionRepository.findByUserId(userId);
    if (!subscription?.stripeSubscriptionId)
      throw Object.assign(new Error("No subscription found"), { status: 404 });
    if (!subscription.cancelAtPeriodEnd)
      throw Object.assign(
        new Error("Subscription is not scheduled for cancellation"),
        { status: 400 },
      );

    await s.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });
    await subscriptionRepository.updateByUserId(userId, {
      cancelAtPeriodEnd: false,
    });
  },

  async createPortalSession(userId: string) {
    const s = requireStripe();
    const subscription = await subscriptionRepository.findByUserId(userId);
    if (!subscription?.stripeCustomerId)
      throw Object.assign(new Error("No customer found"), { status: 404 });

    const session = await s.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${config.cors.origin}/dashboard`,
    });

    return session.url;
  },

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const s = requireStripe();
    if (!config.stripe.webhookSecret)
      throw Object.assign(new Error("Webhook secret not configured"), {
        status: 500,
      });

    let event: Stripe.Event;
    try {
      event = s.webhooks.constructEvent(
        rawBody,
        signature,
        config.stripe.webhookSecret,
      );
    } catch (err: any) {
      throw Object.assign(new Error(`Webhook Error: ${err.message}`), {
        status: 400,
      });
    }

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await this._handleSubscriptionUpdate(
          event.data.object as Stripe.Subscription,
        );
        break;
      case "customer.subscription.deleted":
        await this._handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;
      case "invoice.payment_succeeded":
        await this._handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await this._handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }
  },

  async _handleSubscriptionUpdate(sub: Stripe.Subscription) {
    const record = await subscriptionRepository.findByStripeCustomerId(
      String(sub.customer),
    );
    if (!record) return;
    const firstItem = sub.items.data[0] as any;
    const plan =
      sub.items.data[0]?.price.id === config.stripe.prices.monthly
        ? "monthly"
        : sub.items.data[0]?.price.id === config.stripe.prices.yearly
          ? "yearly"
          : null;

    await subscriptionRepository.update(record.id, {
      stripeSubscriptionId: sub.id,
      status: sub.status,
      plan,
      currentPeriodStart: firstItem
        ? new Date(firstItem.current_period_start * 1000)
        : null,
      currentPeriodEnd: firstItem
        ? new Date(firstItem.current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    });
  },

  async _handleSubscriptionDeleted(sub: Stripe.Subscription) {
    const record = await subscriptionRepository.findByStripeCustomerId(
      String(sub.customer),
    );
    if (!record) return;
    await subscriptionRepository.update(record.id, {
      status: "canceled",
      cancelAtPeriodEnd: false,
    });
  },

  async _handlePaymentSucceeded(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return;
    const record = await subscriptionRepository.findByStripeCustomerId(
      String(invoice.customer),
    );
    if (!record) return;
    await subscriptionRepository.update(record.id, { status: "active" });
  },

  async _handlePaymentFailed(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return;
    const record = await subscriptionRepository.findByStripeCustomerId(
      String(invoice.customer),
    );
    if (!record) return;
    await subscriptionRepository.update(record.id, { status: "past_due" });
  },
};
