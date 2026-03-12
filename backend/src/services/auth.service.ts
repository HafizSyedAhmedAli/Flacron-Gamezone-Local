import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { userRepository } from "../repositories/user.repository.js";
import { subscriptionRepository } from "../repositories/subscription.repository.js";
import type { JwtPayload } from "../types/index.js";

export const authService = {
  signToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  },

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, config.jwt.secret) as JwtPayload;
  },

  async register(email: string, password: string) {
    const existing = await userRepository.findByEmail(email);
    if (existing)
      throw Object.assign(new Error("Email already in use"), { status: 409 });

    const hash = await bcrypt.hash(password, 10);
    const user = await userRepository.create({ email, password: hash });
    await subscriptionRepository.create(user.id);

    const token = this.signToken({ userId: user.id, role: user.role });
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmailWithSubscription(email);
    if (!user)
      throw Object.assign(new Error("Invalid credentials"), { status: 401 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      throw Object.assign(new Error("Invalid credentials"), { status: 401 });

    const token = this.signToken({ userId: user.id, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
      },
    };
  },
};
