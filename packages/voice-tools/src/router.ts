import {
  AddItemToCartToolInputSchema,
  ConfirmOrderToolInputSchema,
  CreateFoodHubOrderToolInputSchema,
  CreatePaymentLinkToolInputSchema,
  GetCartToolInputSchema,
  HandoffToolInputSchema,
  RemoveItemFromCartToolInputSchema,
  SearchMenuToolInputSchema,
  SetCustomerDetailsToolInputSchema,
  SetDeliveryAddressToolInputSchema,
  SetFulfillmentToolInputSchema,
  ToolResultSchema,
  type MenuEntity
} from "@aimate/domain";
import { FoodHubClient } from "@aimate/foodhub";
import { PaymentProvider } from "@aimate/payments";
import { MenuCatalog } from "@aimate/rag";
import { createId, err, ok, type Result } from "@aimate/shared";
import { TelephonyProvider } from "@aimate/telephony";
import { InMemoryVoiceWorkflowStore, type SessionStartInput } from "./workflow";

export type ToolName =
  | "get_store_context"
  | "search_menu"
  | "add_item_to_cart"
  | "remove_item_from_cart"
  | "set_fulfillment"
  | "set_customer_details"
  | "set_delivery_address"
  | "get_cart"
  | "confirm_order"
  | "create_foodhub_order"
  | "create_payment_link"
  | "handoff_to_staff";

export type LockManagerLike = {
  acquire(key: string, ttlMs: number): Promise<{ release(): Promise<void> } | undefined>;
};

export type ToolRouterConfig = {
  foodhub: FoodHubClient;
  paymentProvider: PaymentProvider;
  telephonyProvider: TelephonyProvider;
  menuEntities: MenuEntity[];
  menuCatalog?: MenuCatalog;
  workflow?: InMemoryVoiceWorkflowStore;
  lockManager?: LockManagerLike;
  staffNumber?: string;
};

export class VoiceToolRouter {
  private readonly menuCatalog: MenuCatalog;
  private readonly workflow: InMemoryVoiceWorkflowStore;

  constructor(private readonly config: ToolRouterConfig) {
    this.menuCatalog =
      config.menuCatalog ??
      new MenuCatalog({
        foodhub: config.foodhub,
        fallbackEntities: config.menuEntities
      });
    this.workflow = config.workflow ?? new InMemoryVoiceWorkflowStore();
  }

  startSession(input: SessionStartInput) {
    return this.workflow.startSession(input);
  }

  endSession(input: { tenant_id: string; store_id: string; call_id: string }) {
    this.workflow.endSession(input);
  }

  markMenuStale(tenantId: string, storeId: string) {
    this.menuCatalog.markStale(tenantId, storeId);
  }

  async call(name: ToolName, input: unknown): Promise<Result<unknown>> {
    try {
      switch (name) {
        case "get_store_context": {
          const parsed = GetCartToolInputSchema.parse(input);
          const data: Record<string, unknown> = {
            tenant_id: parsed.tenant_id,
            store_id: parsed.store_id,
            credentials_configured: this.config.foodhub.hasCredentials()
          };
          if (this.config.foodhub.hasCredentials()) {
            try {
              data.store = await this.config.foodhub.getStore(parsed.store_id);
              data.opening_hours = await this.config.foodhub.getOpeningHours(parsed.store_id);
            } catch (error) {
              data.live_error = error instanceof Error ? error.message : String(error);
            }
          }
          const snapshot = this.menuCatalog.getSnapshot(parsed.tenant_id, parsed.store_id);
          data.menu = snapshot
            ? {
                source: snapshot.source,
                items_available: snapshot.entities.filter((entity) => entity.entity_type === "ITEM").length,
                refreshed_at: snapshot.refreshed_at,
                last_error: snapshot.last_error
              }
            : { source: "not_loaded" };
          return ok(
            ToolResultSchema.parse({
              ok: true,
              human_message: "Store context is available.",
              data
            })
          );
        }

        case "search_menu": {
          const parsed = SearchMenuToolInputSchema.parse(input);
          const results = await this.menuCatalog.search({
            tenant_id: parsed.tenant_id,
            store_id: parsed.store_id,
            query: parsed.query,
            limit: parsed.max_results,
            fulfillment_type: parsed.fulfillment_type
          });
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

        case "add_item_to_cart": {
          const parsed = AddItemToCartToolInputSchema.parse(input);
          const match = await this.menuCatalog.findEntity({
            tenant_id: parsed.tenant_id,
            store_id: parsed.store_id,
            item_id: parsed.item_id,
            query: parsed.query,
            fulfillment_type: parsed.fulfillment_type
          });

          if (!match.entity) {
            return err(
              match.ambiguous ? "MENU_AMBIGUOUS" : "MENU_ITEM_NOT_FOUND",
              match.ambiguous
                ? "Multiple matching menu items were found. Ask the caller which one they want."
                : "I cannot add that because it is not available on the current menu.",
              { candidates: match.candidates }
            );
          }

          const snapshot = this.workflow.addItem({
            tenant_id: parsed.tenant_id,
            store_id: parsed.store_id,
            call_id: parsed.call_id,
            language: parsed.language,
            entity: match.entity,
            quantity: parsed.quantity,
            notes: parsed.notes,
            fulfillment_type: parsed.fulfillment_type
          });

          return ok(
            ToolResultSchema.parse({
              ok: true,
              human_message: `Added ${parsed.quantity} x ${match.entity.name} to the cart.`,
              data: snapshot
            })
          );
        }

        case "remove_item_from_cart": {
          const parsed = RemoveItemFromCartToolInputSchema.parse(input);
          const snapshot = this.workflow.removeItem({
            tenant_id: parsed.tenant_id,
            store_id: parsed.store_id,
            call_id: parsed.call_id,
            cart_line_id: parsed.cart_line_id,
            item_id: parsed.item_id,
            quantity: parsed.quantity
          });
          return ok(
            ToolResultSchema.parse({
              ok: true,
              human_message: "Updated the cart.",
              data: snapshot
            })
          );
        }

        case "set_fulfillment": {
          const parsed = SetFulfillmentToolInputSchema.parse(input);
          const snapshot = this.workflow.setFulfillment({
            tenant_id: parsed.tenant_id,
            store_id: parsed.store_id,
            call_id: parsed.call_id,
            language: parsed.language,
            fulfillment_type: parsed.fulfillment_type
          });
          return ok(
            ToolResultSchema.parse({
              ok: true,
              human_message: `Fulfillment set to ${parsed.fulfillment_type}.`,
              data: snapshot
            })
          );
        }

        case "set_customer_details": {
          const parsed = SetCustomerDetailsToolInputSchema.parse(input);
          const snapshot = this.workflow.setCustomer({
            tenant_id: parsed.tenant_id,
            store_id: parsed.store_id,
            call_id: parsed.call_id,
            language: parsed.language,
            customer: {
              first_name: parsed.first_name,
              last_name: parsed.last_name,
              phone: parsed.phone,
              email: parsed.email
            }
          });
          return ok(
            ToolResultSchema.parse({
              ok: true,
              human_message: "Customer details saved.",
              data: snapshot
            })
          );
        }

        case "set_delivery_address": {
          const parsed = SetDeliveryAddressToolInputSchema.parse(input);
          const snapshot = this.workflow.setDeliveryAddress({
            tenant_id: parsed.tenant_id,
            store_id: parsed.store_id,
            call_id: parsed.call_id,
            language: parsed.language,
            delivery_address: {
              address1: parsed.address1,
              address2: parsed.address2,
              city: parsed.city,
              postcode: parsed.postcode,
              formatted_address: parsed.formatted_address,
              flat_no: parsed.flat_no,
              unit_number: parsed.unit_number,
              notes: parsed.notes,
              confirmed: parsed.confirmed
            }
          });
          return ok(
            ToolResultSchema.parse({
              ok: true,
              human_message: parsed.confirmed
                ? "Delivery address confirmed."
                : "Delivery address captured. Read it back before confirming.",
              data: snapshot
            })
          );
        }

        case "get_cart": {
          const parsed = GetCartToolInputSchema.parse(input);
          const snapshot = this.workflow.snapshot(parsed);
          return ok(
            ToolResultSchema.parse({
              ok: true,
              human_message: snapshot.summary,
              data: snapshot
            })
          );
        }

        case "confirm_order": {
          const parsed = ConfirmOrderToolInputSchema.parse(input);
          const attempt = this.workflow.confirmOrder({
            tenant_id: parsed.tenant_id,
            store_id: parsed.store_id,
            call_id: parsed.call_id,
            payment_type: parsed.payment_type
          });
          return ok(
            ToolResultSchema.parse({
              ok: true,
              human_message:
                "The order is confirmed and ready to submit to the restaurant system.",
              audit_event_id: createId("audit"),
              data: {
                order_attempt_id: attempt.order_attempt_id,
                external_reference_id: attempt.external_reference_id,
                state: attempt.state,
                price: attempt.price,
                payload_preview: attempt.payload
              }
            })
          );
        }

        case "create_foodhub_order": {
          const parsed = CreateFoodHubOrderToolInputSchema.parse(input);
          if (!parsed.customer_confirmed) {
            return err(
              "ORDER_NOT_CONFIRMED",
              "Customer must explicitly confirm the order before submitting."
            );
          }

          const attempt = this.workflow.getAttempt({
            tenant_id: parsed.tenant_id,
            store_id: parsed.store_id,
            order_attempt_id: parsed.order_attempt_id
          });
          if (!attempt) {
            return err("ORDER_ATTEMPT_NOT_FOUND", "Confirm the order before submitting it.");
          }

          const lockKey = `order-submit:${parsed.tenant_id}:${parsed.store_id}:${attempt.external_reference_id}`;
          const lock = this.config.lockManager
            ? await this.config.lockManager.acquire(lockKey, 30_000)
            : undefined;
          if (this.config.lockManager && !lock) {
            return err("ORDER_SUBMIT_LOCKED", "This order is already being submitted.");
          }

          try {
            this.workflow.markSubmitting({
              tenant_id: parsed.tenant_id,
              store_id: parsed.store_id,
              order_attempt_id: parsed.order_attempt_id
            });

            if (this.config.foodhub.hasCredentials()) {
              const response = await this.config.foodhub.createOrder(parsed.store_id, attempt.payload);
              const submitted = this.workflow.markSubmitted({
                tenant_id: parsed.tenant_id,
                store_id: parsed.store_id,
                order_attempt_id: parsed.order_attempt_id,
                foodhub_order_id: response.data?.orderId ?? `foodhub-${attempt.external_reference_id}`,
                resource_uri:
                  response.data?.resourceUri ??
                  `/v1/stores/${parsed.store_id}/orders/${attempt.external_reference_id}`
              });
              return ok(
                ToolResultSchema.parse({
                  ok: true,
                  human_message: "The order has been submitted to FoodHub.",
                  audit_event_id: createId("audit"),
                  data: {
                    provider: "foodhub",
                    order_attempt_id: submitted.order_attempt_id,
                    foodhub_order_id: submitted.foodhub_order_id,
                    resource_uri: submitted.resource_uri,
                    state: submitted.state
                  }
                })
              );
            }

            const submitted = this.workflow.markSubmitted({
              tenant_id: parsed.tenant_id,
              store_id: parsed.store_id,
              order_attempt_id: parsed.order_attempt_id,
              foodhub_order_id: `mock-${attempt.external_reference_id}`,
              resource_uri: `/mock-foodhub/stores/${parsed.store_id}/orders/${attempt.external_reference_id}`
            });
            return ok(
              ToolResultSchema.parse({
                ok: true,
                human_message:
                  "FoodHub credentials are not configured yet, so this order was submitted in mock mode.",
                audit_event_id: createId("audit"),
                data: {
                  provider: "mock-foodhub",
                  order_attempt_id: submitted.order_attempt_id,
                  foodhub_order_id: submitted.foodhub_order_id,
                  resource_uri: submitted.resource_uri,
                  state: submitted.state,
                  payload_preview: submitted.payload
                }
              })
            );
          } catch (error) {
            this.workflow.markFailed({
              tenant_id: parsed.tenant_id,
              store_id: parsed.store_id,
              order_attempt_id: parsed.order_attempt_id,
              error
            });
            return err(
              "ORDER_SUBMIT_FAILED",
              error instanceof Error ? error.message : "Failed to submit order",
              error
            );
          } finally {
            await lock?.release();
          }
        }

        case "create_payment_link": {
          const parsed = CreatePaymentLinkToolInputSchema.parse(input);
          const attempt = this.workflow.getAttempt({
            tenant_id: parsed.tenant_id,
            store_id: parsed.store_id,
            order_attempt_id: parsed.order_attempt_id
          });
          if (!attempt) {
            return err("ORDER_ATTEMPT_NOT_FOUND", "Confirm the order before creating a payment link.");
          }
          if (parsed.amount !== attempt.price.total) {
            return err(
              "PAYMENT_AMOUNT_MISMATCH",
              "Payment amount must match the confirmed order total.",
              { expected: attempt.price.total, received: parsed.amount }
            );
          }
          const idempotencyKey = `payment:${parsed.tenant_id}:${parsed.store_id}:${attempt.external_reference_id}:${attempt.price.total}`;
          const link = await this.config.paymentProvider.createPaymentLink({
            tenant_id: parsed.tenant_id,
            store_id: parsed.store_id,
            order_attempt_id: parsed.order_attempt_id,
            idempotency_key: idempotencyKey,
            amount: parsed.amount,
            currency: parsed.currency
          });
          const payment = this.workflow.recordPayment({
            tenant_id: parsed.tenant_id,
            store_id: parsed.store_id,
            order_attempt_id: parsed.order_attempt_id,
            provider: link.provider,
            payment_attempt_id: link.payment_attempt_id,
            idempotency_key: idempotencyKey,
            amount: parsed.amount,
            currency: parsed.currency,
            url: link.url,
            expires_at: link.expires_at
          });
          return ok(
            ToolResultSchema.parse({
              ok: true,
              human_message: "I created a secure payment link.",
              data: { link, payment }
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
              cart_summary: safeCartSummary(this.workflow, parsed),
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

function safeCartSummary(
  workflow: InMemoryVoiceWorkflowStore,
  input: { tenant_id: string; store_id: string; call_id: string }
): string | undefined {
  try {
    return workflow.snapshot(input).summary;
  } catch {
    return undefined;
  }
}
