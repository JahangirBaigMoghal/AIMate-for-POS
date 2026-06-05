import { CreateFoodHubOrderSchema, type CreateFoodHubOrder } from "@aimate/domain";

export function validateCreateOrderPayload(payload: unknown): CreateFoodHubOrder {
  return CreateFoodHubOrderSchema.parse(payload);
}
