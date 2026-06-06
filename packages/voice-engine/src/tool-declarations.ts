/**
 * Gemini Live API function declarations for the AIMate voice agent tools.
 *
 * These declarations tell Gemini WHEN and HOW to call our local functions
 * during a live voice conversation.
 */

export type FunctionDeclaration = {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, {
      type: string;
      description?: string;
      enum?: string[];
      default?: unknown;
    }>;
    required?: string[];
  };
};

export function buildToolDeclarations(): FunctionDeclaration[] {
  return [
    {
      name: "search_menu",
      description:
        "Search the restaurant menu for items matching the customer's request. " +
        "Use this whenever the customer asks about menu items, prices, availability, " +
        "or wants to know what's available. Returns matching items with names, prices, and IDs.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query — what the customer is looking for, e.g. 'chicken burger', 'pizza', 'drinks'"
          },
          fulfillment_type: {
            type: "string",
            description: "How the customer wants to receive the order",
            enum: ["DELIVERY", "COLLECTION", "INSTORE"]
          },
          max_results: {
            type: "integer",
            description: "Maximum number of results to return (1-10)",
            default: 5
          }
        },
        required: ["query"]
      }
    },
    {
      name: "add_item_to_cart",
      description:
        "Add an exact, available menu item to the active cart. Prefer item_id from search_menu results. " +
        "If you only have a spoken item name, pass it as query and the system will refuse ambiguous matches.",
      parameters: {
        type: "object",
        properties: {
          item_id: {
            type: "string",
            description: "Exact menu item ID from search_menu results"
          },
          query: {
            type: "string",
            description: "Customer's spoken item name when item_id is not yet known"
          },
          quantity: {
            type: "integer",
            description: "Quantity to add",
            default: 1
          },
          notes: {
            type: "string",
            description: "Short item-level notes such as no onions or mild spice"
          },
          fulfillment_type: {
            type: "string",
            description: "Delivery mode if already known",
            enum: ["DELIVERY", "COLLECTION", "INSTORE"]
          }
        }
      }
    },
    {
      name: "remove_item_from_cart",
      description:
        "Remove an item or reduce quantity from the active cart. Use cart_line_id from get_cart when possible.",
      parameters: {
        type: "object",
        properties: {
          cart_line_id: {
            type: "string",
            description: "Cart line ID from get_cart"
          },
          item_id: {
            type: "string",
            description: "Menu item ID if cart_line_id is not known"
          },
          quantity: {
            type: "integer",
            description: "Quantity to remove; omit to remove the line"
          }
        }
      }
    },
    {
      name: "set_fulfillment",
      description:
        "Set whether the order is for DELIVERY, COLLECTION, or INSTORE before final confirmation.",
      parameters: {
        type: "object",
        properties: {
          fulfillment_type: {
            type: "string",
            enum: ["DELIVERY", "COLLECTION", "INSTORE"],
            description: "How the customer wants to receive the order"
          },
          requested_time: {
            type: "string",
            description: "Optional ISO datetime for scheduled orders"
          }
        },
        required: ["fulfillment_type"]
      }
    },
    {
      name: "set_customer_details",
      description:
        "Capture caller details needed by FoodHub before confirmation. Phone is required before confirming.",
      parameters: {
        type: "object",
        properties: {
          first_name: {
            type: "string",
            description: "Customer first name"
          },
          last_name: {
            type: "string",
            description: "Customer last name if available"
          },
          phone: {
            type: "string",
            description: "Customer phone number"
          },
          email: {
            type: "string",
            description: "Customer email if available"
          }
        },
        required: ["first_name"]
      }
    },
    {
      name: "set_delivery_address",
      description:
        "Capture and confirm a delivery address. Call once to store details, then call again with confirmed=true after reading it back.",
      parameters: {
        type: "object",
        properties: {
          address1: { type: "string", description: "Street address line" },
          address2: { type: "string", description: "Additional address line" },
          city: { type: "string", description: "Town or city" },
          postcode: { type: "string", description: "Postcode or ZIP" },
          formatted_address: { type: "string", description: "Single-line normalized address" },
          flat_no: { type: "string", description: "Flat number" },
          unit_number: { type: "string", description: "House or unit number" },
          notes: { type: "string", description: "Delivery instructions" },
          confirmed: {
            type: "boolean",
            description: "True only after the caller confirms the address",
            default: false
          }
        }
      }
    },
    {
      name: "get_cart",
      description:
        "Review the active cart, missing fields, line IDs, and total. Use before confirmation and whenever the caller asks what they ordered.",
      parameters: {
        type: "object",
        properties: {}
      }
    },
    {
      name: "confirm_order",
      description:
        "Create a confirmed internal order attempt after reading the full order, fulfillment, customer details, payment method, and total to the caller. " +
        "ONLY call this after the caller explicitly agrees. This does not submit to FoodHub yet.",
      parameters: {
        type: "object",
        properties: {
          customer_confirmed: {
            type: "boolean",
            description: "Must be true after explicit customer confirmation"
          },
          payment_type: {
            type: "string",
            description: "How the customer will pay",
            enum: ["CASH", "CARD", "ONLINE"],
            default: "CASH"
          }
        },
        required: ["customer_confirmed"]
      }
    },
    {
      name: "get_store_context",
      description:
        "Get current store information including opening hours, delivery zones, " +
        "and store settings. Use this at the start of a call or when the customer " +
        "asks about store hours, delivery areas, or store policies.",
      parameters: {
        type: "object",
        properties: {
          store_id: {
            type: "string",
            description: "The store identifier"
          }
        },
        required: ["store_id"]
      }
    },
    {
      name: "create_foodhub_order",
      description:
        "Submit the confirmed order to the restaurant POS system. " +
        "ONLY call this after confirm_order has returned an order_attempt_id and the caller has explicitly confirmed final submission. " +
        "If FoodHub credentials are not configured, the system records a mock submission for development testing.",
      parameters: {
        type: "object",
        properties: {
          order_attempt_id: {
            type: "string",
            description: "The unique order attempt identifier"
          },
          customer_confirmed: {
            type: "boolean",
            description: "Must be true — confirms the customer explicitly agreed to the order"
          }
        },
        required: ["order_attempt_id", "customer_confirmed"]
      }
    },
    {
      name: "create_payment_link",
      description:
        "Create a secure hosted payment link and send it to the customer via SMS. " +
        "Use this when the customer wants to pay by card. " +
        "NEVER ask for card numbers, CVV, or expiry dates over the phone — always use this tool instead.",
      parameters: {
        type: "object",
        properties: {
          order_attempt_id: {
            type: "string",
            description: "The order attempt to create payment for"
          },
          amount: {
            type: "integer",
            description: "Total payment amount in pence (e.g. 699 for £6.99)"
          },
          currency: {
            type: "string",
            description: "Three-letter currency code",
            default: "GBP"
          }
        },
        required: ["order_attempt_id", "amount"]
      }
    },
    {
      name: "handoff_to_staff",
      description:
        "Transfer the call to a human staff member at the restaurant. " +
        "Use this when: the customer requests to speak to a person, " +
        "the situation is too complex for AI handling, " +
        "there is a safety concern, or after two failed clarification attempts.",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description: "Why the handoff is needed — be specific for the staff briefing"
          },
          urgency: {
            type: "string",
            description: "How urgent the transfer is",
            enum: ["LOW", "MEDIUM", "HIGH"]
          },
          summary: {
            type: "string",
            description: "Brief summary of the conversation so far and recommended next action for staff"
          }
        },
        required: ["reason", "urgency", "summary"]
      }
    }
  ];
}
