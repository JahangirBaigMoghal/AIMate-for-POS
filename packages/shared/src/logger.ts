import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: undefined
});

export type TraceContext = {
  trace_id?: string;
  call_id?: string;
  tenant_id?: string;
  store_id?: string;
  order_attempt_id?: string;
};
