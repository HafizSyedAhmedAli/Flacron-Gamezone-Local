import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { authRouter } from "./routes/auth.js";
import { publicRouter } from "./routes/public.js";
import { billingRouter } from "./routes/billing.js";
import { adminRouter } from "./routes/admin.js";
import { aiRouter } from "./routes/ai.js";
import { requireAuth, requireAdmin } from "./lib/auth.js";
import { setupAICronJobs, startCrons } from "./cron/sync.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    credentials: false,
  }),
);

app.use(rateLimit({ windowMs: 60_000, limit: 200 }));

// Stripe webhook needs raw body
app.use(
  "/api/billing/webhook",
  express.raw({ type: "application/json" }),
  (req, _res, next) => {
    (req as any).rawBody = req.body;
    next();
  },
);

// JSON body for everything else
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) =>
  res.json({ ok: true, name: "Flacron GameZone API" }),
);

app.use("/api/auth", authRouter);
app.use("/api", publicRouter);
app.use("/api/billing", billingRouter);
app.use("/api/ai", aiRouter);

// Admin routes protected
app.use("/api/admin", requireAuth, requireAdmin, adminRouter);
const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
  if (process.env.NODE_ENV === "production") {
    console.log("🤖 Setting up cron jobs...");
    startCrons();
    setupAICronJobs();
  } else {
    console.log("⏭️  Skipping cron jobs in development mode");
  }
});
