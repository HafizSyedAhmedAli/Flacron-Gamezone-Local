import { prisma } from "../lib/prisma.js";

export const subscriptionRepository = {
  findByUserId(userId: string) {
    return prisma.subscription.findUnique({ where: { userId } });
  },

  findByStripeCustomerId(stripeCustomerId: string) {
    return prisma.subscription.findFirst({ where: { stripeCustomerId } });
  },

  create(userId: string) {
    return prisma.subscription.create({
      data: { userId, status: "inactive" },
    });
  },

  upsertForUser(userId: string) {
    return prisma.subscription.upsert({
      where: { userId },
      create: { userId, status: "inactive" },
      update: {},
    });
  },

  update(
    id: string,
    data: Partial<{
      stripeCustomerId: string;
      stripeSubscriptionId: string;
      status: string;
      plan: string | null;
      currentPeriodStart: Date | null;
      currentPeriodEnd: Date | null;
      cancelAtPeriodEnd: boolean;
    }>,
  ) {
    return prisma.subscription.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  },

  updateByUserId(
    userId: string,
    data: Partial<{
      status: string;
      cancelAtPeriodEnd: boolean;
    }>,
  ) {
    return prisma.subscription.update({
      where: { userId },
      data: { ...data, updatedAt: new Date() },
    });
  },
};
