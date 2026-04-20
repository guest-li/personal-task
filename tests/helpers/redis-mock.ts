// Mock for @/server/redis in test environment
// In-memory implementation for testing

const store = new Map<string, { value: string; expiresAt?: number }>();

export const redis = {
  incr: async (_key: string): Promise<number> => 1,
  expire: async (_key: string, _seconds: number): Promise<void> => {},
  get: async (key: string): Promise<string | null> => {
    const entry = store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.value;
  },
  set: async (key: string, value: string, mode?: string, ttl?: number): Promise<void> => {
    let expiresAt: number | undefined;
    if (mode === "EX" && ttl) {
      expiresAt = Date.now() + ttl * 1000;
    }
    store.set(key, { value, expiresAt });
  },
  del: async (...keys: string[]): Promise<void> => {
    keys.forEach((key) => store.delete(key));
  },
  keys: async (pattern: string): Promise<string[]> => {
    const regex = new RegExp(pattern.replace("*", ".*"));
    return Array.from(store.keys()).filter((key) => regex.test(key));
  },
};
