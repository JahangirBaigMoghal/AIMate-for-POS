export class AimateError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AimateError";
  }
}

export class PolicyError extends AimateError {
  constructor(message: string, details?: unknown) {
    super(message, "POLICY_ERROR", details);
  }
}

export class IntegrationError extends AimateError {
  constructor(message: string, details?: unknown) {
    super(message, "INTEGRATION_ERROR", details);
  }
}
