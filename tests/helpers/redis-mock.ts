// Mock for @/server/redis in test environment
// Always returns count=1 so rate limiting never triggers

export const redis = {
  incr: async (_key: string): Promise<number> => 1,
  expire: async (_key: string, _seconds: number): Promise<void> => {},
  get: async (_key: string): Promise<string | null> => null,
  set: async (_key: string, _value: string): Promise<void> => {},
  del: async (_key: string): Promise<void> => {},
};
