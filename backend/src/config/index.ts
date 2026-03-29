export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",

  jwt: {
    secret: process.env.JWT_SECRET ?? "dev_secret",
    expiresIn: "7d" as const,
  },

  cors: {
    origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
  },

  db: {
    url: process.env.DATABASE_URL ?? "",
  },

  // Upstash REST — replaces the old ioredis REDIS_URL
  upstash: {
    url: process.env.UPSTASH_REDIS_REST_URL ?? "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    prices: {
      monthly: process.env.STRIPE_PRICE_MONTHLY ?? "",
      yearly: process.env.STRIPE_PRICE_YEARLY ?? "",
    },
  },

  football: {
    key: process.env.API_FOOTBALL_KEY ?? "",
    baseUrl:
      process.env.API_FOOTBALL_BASEURL ?? "https://v3.football.api-sports.io",
    sportMonksKey: process.env.API_SPORT_MONKS_KEY ?? "",
    sportMonksBaseUrl:
      process.env.API_SPORT_MONKS_BASEURL ??
      "https://api.sportmonks.com/v3/football",
  },

  ai: {
    openaiKey: process.env.OPENAI_API_KEY ?? "",
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  },

  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY ?? "",
  },
};
