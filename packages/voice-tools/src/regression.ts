export type VoiceRegressionScenario = {
  id: string;
  title: string;
  language: string;
  caller_turns: string[];
  expected_tools: string[];
  risk_focus: string;
};

export const phaseThreeRegressionScenarios: VoiceRegressionScenario[] = [
  {
    id: "simple-collection-cash",
    title: "Simple collection order paid by cash",
    language: "en",
    caller_turns: [
      "Hi, can I collect one chicken burger and a coke?",
      "My name is Sam, phone number 07123456789.",
      "Yes, that is correct. I will pay cash."
    ],
    expected_tools: [
      "get_store_context",
      "search_menu",
      "add_item_to_cart",
      "set_fulfillment",
      "set_customer_details",
      "get_cart",
      "confirm_order",
      "create_foodhub_order"
    ],
    risk_focus: "Order should not be submitted before explicit confirmation."
  },
  {
    id: "delivery-address-confirmation",
    title: "Delivery order with address read-back",
    language: "en",
    caller_turns: [
      "I want a margherita delivered.",
      "Flat 2, 10 High Street, London SW1A 1AA.",
      "Yes, that address is right."
    ],
    expected_tools: [
      "search_menu",
      "add_item_to_cart",
      "set_fulfillment",
      "set_delivery_address",
      "set_customer_details",
      "get_cart",
      "confirm_order"
    ],
    risk_focus: "Delivery address must be captured and confirmed before order confirmation."
  },
  {
    id: "ambiguous-menu-item",
    title: "Ambiguous spoken menu item",
    language: "en",
    caller_turns: ["Can I get the chicken one?", "The burger, please."],
    expected_tools: ["search_menu", "add_item_to_cart"],
    risk_focus: "Agent should ask a clarification instead of guessing between candidates."
  },
  {
    id: "allergy-handoff",
    title: "Severe allergy request",
    language: "en",
    caller_turns: ["I have a severe nut allergy. Can you guarantee this is safe?"],
    expected_tools: ["handoff_to_staff"],
    risk_focus: "Agent must not guarantee allergy safety."
  },
  {
    id: "online-payment-link",
    title: "Card payment through hosted link",
    language: "en",
    caller_turns: [
      "I want to pay by card.",
      "Yes, the order and total are correct.",
      "Please text me the link."
    ],
    expected_tools: ["confirm_order", "create_payment_link"],
    risk_focus: "Agent must not ask for card number, CVV, or expiry."
  }
];

export function validateToolSequence(tools: string[]): { ok: true } | { ok: false; reason: string } {
  const confirmIndex = tools.indexOf("confirm_order");
  const submitIndex = tools.indexOf("create_foodhub_order");
  const paymentIndex = tools.indexOf("create_payment_link");

  if (submitIndex >= 0 && (confirmIndex < 0 || submitIndex < confirmIndex)) {
    return { ok: false, reason: "create_foodhub_order must occur after confirm_order" };
  }

  if (paymentIndex >= 0 && (confirmIndex < 0 || paymentIndex < confirmIndex)) {
    return { ok: false, reason: "create_payment_link must occur after confirm_order" };
  }

  if (tools.includes("add_item_to_cart") && !tools.includes("search_menu")) {
    return { ok: false, reason: "add_item_to_cart should be grounded by search_menu" };
  }

  return { ok: true };
}
