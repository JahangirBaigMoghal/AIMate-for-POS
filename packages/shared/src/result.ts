export type Ok<T> = { ok: true; data: T };
export type Err = { ok: false; error_code: string; message: string; details?: unknown };
export type Result<T> = Ok<T> | Err;

export function ok<T>(data: T): Ok<T> {
  return { ok: true, data };
}

export function err(error_code: string, message: string, details?: unknown): Err {
  return { ok: false, error_code, message, details };
}
