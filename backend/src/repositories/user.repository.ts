import { prisma } from "../lib/prisma.js";

export const userRepository = {
  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { subscription: true },
    });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findByEmailWithSubscription(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { subscription: true },
    });
  },

  create(data: { email: string; password: string }) {
    return prisma.user.create({ data });
  },

  findAll() {
    return prisma.user.findMany({
      include: { subscription: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
