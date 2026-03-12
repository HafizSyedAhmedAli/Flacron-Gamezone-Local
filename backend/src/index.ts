import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/index.js";
import router from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { startSyncCron } from "./cron/sync.cron.js";
import { startAiCron } from "./cron/ai.cron.js";

const app = express();

// ─── Security & parsing ───────────────────────────────────────────────────────

app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  }),
);

// Raw body for Stripe webhook (must come before json())
app.use((req, _res, next) => {
  if (req.originalUrl === "/api/billing/webhook") return next();
  express.json()(req, _res, next);
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/api", router);

app.get("/health", (_req, res) => res.json({ ok: true }));

// ─── Error handler ────────────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port} [${config.nodeEnv}]`);
  startSyncCron();
  startAiCron();
});

export default app;
