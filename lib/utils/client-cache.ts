interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class ClientCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private inFlight = new Map<string, Promise<T>>();
  private ttlMs: number;

  constructor(ttlMs: number) {
    this.ttlMs = ttlMs;
  }

  get(key: string): T | null {
    const now = Date.now();
    const cached = this.cache.get(key);

    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  async getOrFetch(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const pending = this.inFlight.get(key);
    if (pending) {
      return pending;
    }

    const fetchPromise = fetcher().then((data) => {
      this.set(key, data);
      return data;
    });

    this.inFlight.set(key, fetchPromise);

    try {
      return await fetchPromise;
    } finally {
      this.inFlight.delete(key);
    }
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
      this.inFlight.delete(key);
    } else {
      this.cache.clear();
      this.inFlight.clear();
    }
  }

  has(key: string): boolean {
    const now = Date.now();
    const cached = this.cache.get(key);
    return cached !== undefined && cached.expiresAt > now;
  }
}

export function createClientCache<T>(ttlMs: number): ClientCache<T> {
  return new ClientCache<T>(ttlMs);
}
