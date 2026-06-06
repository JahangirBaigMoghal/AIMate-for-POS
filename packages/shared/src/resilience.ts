import { IntegrationError } from "./errors";

export class CircuitBreakerOpenError extends IntegrationError {
  constructor(message: string, details?: unknown) {
    super(message, details);
    this.name = "CircuitBreakerOpenError";
  }
}

/**
 * A simple, robust Circuit Breaker to prevent cascading failures to external services.
 */
export class CircuitBreaker {
  private state: "CLOSED" | "OPEN" | "HALF-OPEN" = "CLOSED";
  private failureCount = 0;
  private lastStateChange: number = Date.now();

  constructor(
    private readonly failureThreshold = 5,
    private readonly cooldownMs = 10_000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.checkCooldown();

    if (this.state === "OPEN") {
      throw new CircuitBreakerOpenError(
        "Circuit breaker is currently OPEN. Requests are temporarily blocked."
      );
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  getState(): "CLOSED" | "OPEN" | "HALF-OPEN" {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  private checkCooldown() {
    if (this.state === "OPEN" && Date.now() - this.lastStateChange > this.cooldownMs) {
      this.state = "HALF-OPEN";
      this.lastStateChange = Date.now();
    }
  }

  private onSuccess() {
    if (this.state === "HALF-OPEN" || this.state === "CLOSED") {
      this.state = "CLOSED";
      this.failureCount = 0;
    }
  }

  private onFailure() {
    this.failureCount++;
    if (this.state === "HALF-OPEN" || this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      this.lastStateChange = Date.now();
    }
  }
}

/**
 * Executes a promise-returning function with exponential backoff retry logic.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 200,
  factor = 2
): Promise<T> {
  let currentDelay = delayMs;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay *= factor;
    }
  }
  throw new Error("Retry failed");
}
