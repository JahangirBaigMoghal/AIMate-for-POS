export interface Lock {
  release(): Promise<void>;
}

export interface LockManager {
  acquire(key: string, ttlMs: number): Promise<Lock | undefined>;
}

export class InMemoryLockManager implements LockManager {
  private readonly locks = new Map<string, number>();

  async acquire(key: string, ttlMs: number): Promise<Lock | undefined> {
    const now = Date.now();
    const existing = this.locks.get(key);
    if (existing && existing > now) return undefined;
    this.locks.set(key, now + ttlMs);
    return {
      release: async () => {
        this.locks.delete(key);
      }
    };
  }
}
