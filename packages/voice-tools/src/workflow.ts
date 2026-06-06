import {
  calculateSubtotal,
  type Cart,
  type CartItem,
  type CreateFoodHubOrder,
  type CustomerDetails,
  type DeliveryAddress,
  FulfillmentTypeSchema,
  type MenuEntity,
  type OrderAttempt,
  type PaymentAttempt,
  type PriceBreakdown
} from "@aimate/domain";
import { createExternalReferenceId, createId } from "@aimate/shared";
import type { z } from "zod";

export type FulfillmentType = z.infer<typeof FulfillmentTypeSchema>;

export type WorkflowPricingConfig = {
  defaultDeliveryFee?: number;
  serviceFee?: number;
  tax?: number;
};

export type SessionStartInput = {
  call_id: string;
  tenant_id: string;
  store_id: string;
  language: string;
  caller_phone?: string;
  prompt_hash?: string;
};

export type VoiceOrderSession = SessionStartInput & {
  status:
    | "STARTED"
    | "CART_BUILDING"
    | "CONFIRMING"
    | "ORDER_COMMITTING"
    | "PAYMENT_PENDING"
    | "HANDOFF"
    | "ENDED";
  cart: Cart;
  payment_type?: "CASH" | "CARD" | "ONLINE";
  created_at: string;
  updated_at: string;
};

export type ConfirmedOrderAttempt = OrderAttempt & {
  payment_type: "CASH" | "CARD" | "ONLINE";
  price: PriceBreakdown;
  payload: CreateFoodHubOrder;
};

export type CartSnapshot = {
  cart: Cart;
  price: PriceBreakdown;
  summary: string;
  missing: string[];
};

export type OrderSubmissionResult = {
  order_attempt: ConfirmedOrderAttempt;
  provider: "foodhub" | "mock-foodhub";
  foodhub_order_id?: string;
  resource_uri?: string;
};

function sessionKey(input: { tenant_id: string; store_id: string; call_id: string }) {
  return `${input.tenant_id}:${input.store_id}:${input.call_id}`;
}

export class InMemoryVoiceWorkflowStore {
  private readonly sessions = new Map<string, VoiceOrderSession>();
  private readonly attempts = new Map<string, ConfirmedOrderAttempt>();
  private readonly payments = new Map<string, PaymentAttempt>();

  constructor(private readonly pricing: WorkflowPricingConfig = {}) {}

  startSession(input: SessionStartInput): VoiceOrderSession {
    const key = sessionKey(input);
    const existing = this.sessions.get(key);
    if (existing) return existing;

    const now = new Date().toISOString();
    const session: VoiceOrderSession = {
      ...input,
      status: "STARTED",
      cart: {
        cart_id: createId("cart"),
        version: 0,
        items: []
      },
      created_at: now,
      updated_at: now
    };
    this.sessions.set(key, session);
    return session;
  }

  endSession(input: { tenant_id: string; store_id: string; call_id: string }) {
    const session = this.getSession(input);
    if (!session) return;
    this.saveSession({ ...session, status: "ENDED" });
  }

  getSession(input: { tenant_id: string; store_id: string; call_id: string }): VoiceOrderSession | undefined {
    return this.sessions.get(sessionKey(input));
  }

  getOrCreateSession(input: SessionStartInput): VoiceOrderSession {
    return this.getSession(input) ?? this.startSession(input);
  }

  addItem(input: {
    tenant_id: string;
    store_id: string;
    call_id: string;
    language: string;
    entity: MenuEntity;
    quantity: number;
    notes?: string;
    fulfillment_type?: FulfillmentType;
  }): CartSnapshot {
    const session = this.getOrCreateSession(input);
    const cartLineId = createId("line");
    const item: CartItem = {
      cart_line_id: cartLineId,
      id: input.entity.entity_id,
      name: input.entity.name,
      price: input.entity.price ?? 0,
      quantity: input.quantity,
      notes: input.notes,
      addons: []
    };

    const cart: Cart = {
      ...session.cart,
      version: session.cart.version + 1,
      fulfillment_type: input.fulfillment_type ?? session.cart.fulfillment_type,
      items: [...session.cart.items, item]
    };

    this.saveSession({ ...session, status: "CART_BUILDING", cart });
    return this.snapshot(input);
  }

  removeItem(input: {
    tenant_id: string;
    store_id: string;
    call_id: string;
    cart_line_id?: string;
    item_id?: string;
    quantity?: number;
  }): CartSnapshot {
    const session = this.requireSession(input);
    let removed = false;
    const items = session.cart.items.flatMap((item) => {
      const matches =
        (input.cart_line_id && item.cart_line_id === input.cart_line_id) ||
        (input.item_id && item.id === input.item_id);
      if (!matches || removed) return [item];
      removed = true;

      if (input.quantity && item.quantity > input.quantity) {
        return [{ ...item, quantity: item.quantity - input.quantity }];
      }
      return [];
    });

    const cart: Cart = {
      ...session.cart,
      version: session.cart.version + 1,
      items
    };
    this.saveSession({ ...session, cart, status: "CART_BUILDING" });
    return this.snapshot(input);
  }

  setFulfillment(input: {
    tenant_id: string;
    store_id: string;
    call_id: string;
    language: string;
    fulfillment_type: FulfillmentType;
  }): CartSnapshot {
    const session = this.getOrCreateSession(input);
    this.saveSession({
      ...session,
      status: "CART_BUILDING",
      cart: {
        ...session.cart,
        fulfillment_type: input.fulfillment_type,
        version: session.cart.version + 1
      }
    });
    return this.snapshot(input);
  }

  setCustomer(input: {
    tenant_id: string;
    store_id: string;
    call_id: string;
    language: string;
    customer: CustomerDetails;
  }): CartSnapshot {
    const session = this.getOrCreateSession(input);
    this.saveSession({
      ...session,
      cart: {
        ...session.cart,
        customer: input.customer,
        version: session.cart.version + 1
      }
    });
    return this.snapshot(input);
  }

  setDeliveryAddress(input: {
    tenant_id: string;
    store_id: string;
    call_id: string;
    language: string;
    delivery_address: DeliveryAddress;
  }): CartSnapshot {
    const session = this.getOrCreateSession(input);
    this.saveSession({
      ...session,
      cart: {
        ...session.cart,
        delivery_address: input.delivery_address,
        version: session.cart.version + 1
      }
    });
    return this.snapshot(input);
  }

  snapshot(input: { tenant_id: string; store_id: string; call_id: string }): CartSnapshot {
    const session = this.requireSession(input);
    const price = this.calculatePrice(session.cart);
    return {
      cart: session.cart,
      price,
      summary: summarizeCart(session.cart, price),
      missing: this.missingFields(session.cart)
    };
  }

  confirmOrder(input: {
    tenant_id: string;
    store_id: string;
    call_id: string;
    payment_type: "CASH" | "CARD" | "ONLINE";
  }): ConfirmedOrderAttempt {
    const session = this.requireSession(input);
    const missing = this.missingFields(session.cart);
    if (missing.length > 0) {
      throw new Error(`Cannot confirm order yet. Missing: ${missing.join(", ")}`);
    }

    const now = new Date().toISOString();
    const price = this.calculatePrice(session.cart);
    const payload = buildFoodHubPayload({
      tenant_id: input.tenant_id,
      store_id: input.store_id,
      cart: session.cart,
      price,
      payment_type: input.payment_type,
      external_reference_id: createExternalReferenceId()
    });

    const attempt: ConfirmedOrderAttempt = {
      tenant_id: input.tenant_id,
      store_id: input.store_id,
      order_attempt_id: createId("ordatt"),
      call_id: input.call_id,
      external_reference_id: payload.external_reference_id,
      state: "CONFIRMED",
      cart_version: session.cart.version,
      payment_type: input.payment_type,
      price,
      payload,
      created_at: now,
      updated_at: now
    };

    this.attempts.set(attempt.order_attempt_id, attempt);
    this.saveSession({ ...session, status: "CONFIRMING", payment_type: input.payment_type });
    return attempt;
  }

  getAttempt(input: {
    tenant_id: string;
    store_id: string;
    order_attempt_id: string;
  }): ConfirmedOrderAttempt | undefined {
    const attempt = this.attempts.get(input.order_attempt_id);
    if (!attempt) return undefined;
    if (attempt.tenant_id !== input.tenant_id || attempt.store_id !== input.store_id) return undefined;
    return attempt;
  }

  markSubmitting(input: { tenant_id: string; store_id: string; order_attempt_id: string }) {
    const attempt = this.requireAttempt(input);
    this.saveAttempt({ ...attempt, state: "SUBMITTING" });
  }

  markSubmitted(input: {
    tenant_id: string;
    store_id: string;
    order_attempt_id: string;
    foodhub_order_id: string;
    resource_uri: string;
  }): ConfirmedOrderAttempt {
    const attempt = this.requireAttempt(input);
    return this.saveAttempt({
      ...attempt,
      state: "SUBMITTED",
      foodhub_order_id: input.foodhub_order_id,
      resource_uri: input.resource_uri
    });
  }

  markFailed(input: {
    tenant_id: string;
    store_id: string;
    order_attempt_id: string;
    error: unknown;
  }): ConfirmedOrderAttempt {
    const attempt = this.requireAttempt(input);
    return this.saveAttempt({
      ...attempt,
      state: "FAILED",
      last_error: input.error
    });
  }

  recordPayment(input: {
    tenant_id: string;
    store_id: string;
    order_attempt_id: string;
    provider: string;
    payment_attempt_id: string;
    idempotency_key: string;
    amount: number;
    currency: string;
    url?: string;
    expires_at?: string;
  }): PaymentAttempt {
    const payment: PaymentAttempt = {
      tenant_id: input.tenant_id,
      store_id: input.store_id,
      order_attempt_id: input.order_attempt_id,
      provider: input.provider,
      payment_attempt_id: input.payment_attempt_id,
      idempotency_key: input.idempotency_key,
      amount: input.amount,
      currency: input.currency,
      status: "CREATED",
      url: input.url,
      expires_at: input.expires_at
    };
    this.payments.set(payment.payment_attempt_id, payment);
    return payment;
  }

  private calculatePrice(cart: Cart): PriceBreakdown {
    const subtotal = calculateSubtotal(cart);
    const deliveryFee = cart.fulfillment_type === "DELIVERY" ? this.pricing.defaultDeliveryFee ?? 0 : 0;
    const serviceFee = this.pricing.serviceFee ?? 0;
    const tax = this.pricing.tax ?? 0;
    const total = subtotal + deliveryFee + serviceFee + tax;
    return {
      subtotal,
      charges: {
        tax,
        ...(deliveryFee > 0 ? { delivery_fee: deliveryFee } : {}),
        ...(serviceFee > 0 ? { service_fee: serviceFee } : {})
      },
      discounts: [],
      total
    };
  }

  private missingFields(cart: Cart): string[] {
    const missing: string[] = [];
    if (cart.items.length === 0) missing.push("at least one menu item");
    if (!cart.fulfillment_type) missing.push("delivery or collection choice");
    if (!cart.customer?.first_name) missing.push("customer first name");
    if (!cart.customer?.phone) missing.push("customer phone number");
    if (cart.fulfillment_type === "DELIVERY") {
      const address = cart.delivery_address;
      if (!address) {
        missing.push("delivery address");
      } else {
        if (!address.confirmed) missing.push("confirmed delivery address");
        if (!address.postcode && !address.formatted_address) missing.push("postcode or formatted address");
      }
    }
    return missing;
  }

  private requireSession(input: { tenant_id: string; store_id: string; call_id: string }) {
    const session = this.getSession(input);
    if (!session) {
      throw new Error("Call session has not started yet.");
    }
    return session;
  }

  private requireAttempt(input: { tenant_id: string; store_id: string; order_attempt_id: string }) {
    const attempt = this.getAttempt(input);
    if (!attempt) {
      throw new Error("Order attempt was not found for this store.");
    }
    return attempt;
  }

  private saveSession(session: VoiceOrderSession) {
    this.sessions.set(sessionKey(session), {
      ...session,
      updated_at: new Date().toISOString()
    });
  }

  private saveAttempt(attempt: ConfirmedOrderAttempt): ConfirmedOrderAttempt {
    const updated = { ...attempt, updated_at: new Date().toISOString() };
    this.attempts.set(updated.order_attempt_id, updated);
    return updated;
  }
}

function summarizeCart(cart: Cart, price: PriceBreakdown): string {
  if (cart.items.length === 0) return "The cart is empty.";
  const items = cart.items
    .map((item) => `${item.quantity} x ${item.name}${item.notes ? ` (${item.notes})` : ""}`)
    .join("; ");
  const pounds = (price.total / 100).toFixed(2);
  return `${items}. ${cart.fulfillment_type ?? "Fulfillment not set"}. Total GBP ${pounds}.`;
}

function buildFoodHubPayload(input: {
  tenant_id: string;
  store_id: string;
  cart: Cart;
  price: PriceBreakdown;
  payment_type: "CASH" | "CARD" | "ONLINE";
  external_reference_id: string;
}): CreateFoodHubOrder {
  const customer = input.cart.customer;
  if (!customer) {
    throw new Error("Customer details are required before building a FoodHub order.");
  }

  const items = input.cart.items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    category_name: item.category_name,
    notes: item.notes,
    addons: item.addons
  }));

  return {
    external_reference_id: input.external_reference_id,
    source: "AIMate Voice Agent",
    fulfillment_type: input.cart.fulfillment_type ?? "COLLECTION",
    placed_on: new Date().toISOString(),
    notes: input.cart.notes,
    customer: {
      first_name: customer.first_name,
      last_name: customer.last_name ?? "Customer",
      phone: customer.phone,
      email: customer.email
    },
    ...(input.cart.fulfillment_type === "DELIVERY" && input.cart.delivery_address
      ? {
          delivery: {
            type: "DELIVERY_BY_RESTAURANT" as const,
            notes: input.cart.delivery_address.notes,
            address: {
              type: "STREET_ADDRESS" as const,
              address1: input.cart.delivery_address.address1,
              address2: input.cart.delivery_address.address2,
              city: input.cart.delivery_address.city,
              postcode: input.cart.delivery_address.postcode,
              formatted_address: input.cart.delivery_address.formatted_address,
              flat_no: input.cart.delivery_address.flat_no,
              unit_number: input.cart.delivery_address.unit_number
            }
          }
        }
      : {}),
    items,
    payment: {
      ...input.price,
      payment_type: input.payment_type,
      payment_status: input.payment_type === "CASH" ? "UNPAID" : "UNPAID"
    }
  };
}
