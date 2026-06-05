import {
  CreateFoodHubOrderToolInputSchema,
  HandoffToolInputSchema,
  SearchMenuToolInputSchema,
  ToolResultSchema,
  type MenuEntity
} from "@aimate/domain";
import { FoodHubClient } from "@aimate/foodhub";
import { PaymentProvider } from "@aimate/payments";
import { MenuIndex } from "@aimate/rag";
import { createId, err, ok, type Result } from "@aimate/shared";
import { TelephonyProvider } from "@aimate/telephony";

export type ToolName =
  | "get_store_context"
  | "search_menu"
  | "create_foodhub_order"
  | "create_payment_link"
  | "handoff_to_staff";

export type ToolRouterConfig = {
  foodhub: FoodHubClient;
  paymentProvider: PaymentProvider;
  telephonyProvider: TelephonyProvider;
  menuEntities: MenuEntity[];
  staffNumber?: string;
};

export class VoiceToolRouter {
  private readonly menuIndex: MenuIndex;

  constructor(private readonly config: ToolRouterConfig) {
    this.menuIndex = new MenuIndex(config.menuEntities);
  }

  async call(name: ToolName, input: unknown): Promise<Result<unknown>> {
    try {
      switch (name) {
        case "get_store_context":
          return ok({ human_message: "Store context is available.", data: input });
        case "search_menu": {
          const parsed = SearchMenuToolInputSchema.parse(input);
          const results = this.menuIndex.search(parsed.query, parsed.max_results);
          return ok(
            ToolResultSchema.parse({
              ok: true,
              human_message:
                results.length > 0
                  ? "I found matching menu items."
                  : "I cannot see that item on the current menu.",
              data: { results }
            })
          );
        }
        case "create_foodhub_order": {
          const parsed = CreateFoodHubOrderToolInputSchema.parse(input);
          return ok(
            ToolResultSchema.parse({
              ok: true,
              human_message:
                "Order commit requires a persisted order attempt; this scaffold is ready for credential-backed implementation.",
              data: { order_attempt_id: parsed.order_attempt_id }
            })
          );
        }
        case "create_payment_link": {
          const envelope = SearchMenuToolInputSchema.pick({
            call_id: true,
            tenant_id: true,
            store_id: true,
            request_id: true,
            language: true
          }).parse(input);
          const link = await this.config.paymentProvider.createPaymentLink({
            tenant_id: envelope.tenant_id,
            store_id: envelope.store_id,
            order_attempt_id: createId("order_attempt"),
            idempotency_key: `payment:${envelope.tenant_id}:${envelope.store_id}:${envelope.request_id}`,
            amount: 0,
            currency: "GBP"
          });
          return ok(
            ToolResultSchema.parse({
              ok: true,
              human_message: "I created a secure payment link.",
              data: link
            })
          );
        }
        case "handoff_to_staff": {
          const parsed = HandoffToolInputSchema.parse(input);
          if (!this.config.staffNumber) {
            return err("HANDOFF_UNAVAILABLE", "Staff handoff number is not configured.");
          }
          const transfer = await this.config.telephonyProvider.transferToStaff({
            call_id: parsed.call_id,
            staff_number: this.config.staffNumber,
            briefing: {
              call_id: parsed.call_id,
              store_id: parsed.store_id,
              language: parsed.language,
              intent: "handoff",
              risk_reason: parsed.reason,
              recommended_action: parsed.summary
            }
          });
          return ok(
            ToolResultSchema.parse({
              ok: transfer.ok,
              human_message: transfer.ok
                ? "I am transferring you to the restaurant now."
                : "I could not transfer the call.",
              data: transfer
            })
          );
        }
      }
    } catch (error) {
      return err("TOOL_ERROR", error instanceof Error ? error.message : "Unknown tool error", error);
    }
  }
}
