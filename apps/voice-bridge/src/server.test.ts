import { describe, expect, it } from "vitest";
import { buildServer } from "./server";

describe("voice bridge", () => {
  it("returns health", async () => {
    const app = buildServer();
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json().service).toBe("voice-bridge");
    await app.close();
  });
});
