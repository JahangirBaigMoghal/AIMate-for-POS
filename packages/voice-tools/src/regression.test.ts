import { describe, expect, it } from "vitest";
import { phaseThreeRegressionScenarios, validateToolSequence } from "./regression";

describe("voice regression harness", () => {
  it("defines core Phase III regression scenarios", () => {
    expect(phaseThreeRegressionScenarios.length).toBeGreaterThanOrEqual(5);
    expect(phaseThreeRegressionScenarios.map((scenario) => scenario.id)).toContain(
      "simple-collection-cash"
    );
  });

  it("rejects unsafe tool orderings", () => {
    expect(validateToolSequence(["create_foodhub_order"]).ok).toBe(false);
    expect(validateToolSequence(["confirm_order", "create_foodhub_order"]).ok).toBe(true);
    expect(validateToolSequence(["add_item_to_cart"]).ok).toBe(false);
  });
});
