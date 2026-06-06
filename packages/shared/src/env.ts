import { z } from "zod";

export const AppEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  VOICE_BRIDGE_PORT: z.coerce.number().int().positive().default(4100),
  FOODHUB_BASE_URL: z.string().url().default("https://developer.foodhub.com"),
  FOODHUB_CLIENT_ID: z.string().optional(),
  FOODHUB_CLIENT_SECRET: z.string().optional(),
  FOODHUB_DEFAULT_STORE_ID: z.string().optional(),
  DEFAULT_STAFF_NUMBER: z.string().optional(),
  DEFAULT_DELIVERY_FEE_PENCE: z.coerce.number().int().nonnegative().default(0),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/aimate"),
  MONGODB_DB: z.string().default("aimate"),
  REDIS_URL: z.string().optional(),
  GOOGLE_VERTEX_PROJECT_ID: z.string().optional(),
  GOOGLE_VERTEX_LOCATION: z.string().optional(),
  GEMINI_LIVE_MODEL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_REALTIME_MODEL: z.string().optional(),
  TELEPHONY_PROVIDER: z.enum(["mock", "twilio", "telnyx"]).default("mock"),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TELNYX_API_KEY: z.string().optional(),
  PAYMENT_PROVIDER: z.enum(["mock", "stripe", "adyen", "worldpay"]).default("mock"),
  STRIPE_SECRET_KEY: z.string().optional(),
  SMS_PROVIDER: z.enum(["mock", "twilio", "telnyx", "messagebird"]).default("mock"),
  FOODHUB_WEBHOOK_SECRET: z.string().optional(),
  PAYMENT_WEBHOOK_SECRET: z.string().optional(),
  GEMINI_API_KEY: z.string().optional()
});

export type AppEnv = z.infer<typeof AppEnvSchema>;

export function loadEnv(input: NodeJS.ProcessEnv = process.env): AppEnv {
  return AppEnvSchema.parse(input);
}
