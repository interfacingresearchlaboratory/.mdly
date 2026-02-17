/**
 * One-time token store for Electron auth flow.
 * Uses Upstash Redis (KV_REST_API_*) in production; in-memory fallback when Redis is not configured.
 */

const TTL_SECONDS = 120;
const KEY_PREFIX = "electron-auth:";

interface StoredValue {
  jwt: string;
}

const memoryStore = new Map<string, { value: StoredValue; expiresAt: number }>();

let redisClientInstance: InstanceType<typeof import("@upstash/redis").Redis> | null = null;

function getRedisClient(): InstanceType<typeof import("@upstash/redis").Redis> | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    console.log("[electron-auth-token-store] Redis not configured, using memory store");
    return null;
  }
  // Reuse the same Redis client instance to avoid connection issues
  if (!redisClientInstance) {
    // Lazy-load to avoid importing @upstash/redis when not used (e.g. edge)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis } = require("@upstash/redis") as typeof import("@upstash/redis");
    redisClientInstance = new Redis({ url, token });
    console.log("[electron-auth-token-store] Created new Redis client instance");
  }
  return redisClientInstance;
}

export async function setElectronAuthToken(token: string, jwt: string): Promise<void> {
  const key = KEY_PREFIX + token;
  console.log("[electron-auth-token-store] Storing token, key:", key.substring(0, 30) + "...", "JWT length:", jwt.length);
  const redis = getRedisClient();
  if (redis) {
    console.log("[electron-auth-token-store] Storing in Redis, key:", key, "TTL:", TTL_SECONDS);
    try {
      const result = await redis.set(key, JSON.stringify({ jwt }), { ex: TTL_SECONDS });
      console.log("[electron-auth-token-store] Redis set result:", result);
      // Verify it was stored
      const verify = await redis.get(key);
      console.log("[electron-auth-token-store] Redis verify after set:", verify ? "Found" : "Not found");
      return;
    } catch (error) {
      console.error("[electron-auth-token-store] Redis set failed:", error);
      throw error;
    }
  }
  console.log("[electron-auth-token-store] Storing in memory store");
  memoryStore.set(key, {
    value: { jwt },
    expiresAt: Date.now() + TTL_SECONDS * 1000,
  });
  console.log("[electron-auth-token-store] Token stored, memory store size:", memoryStore.size);
}

export async function getAndDeleteElectronAuthToken(token: string): Promise<string | null> {
  const key = KEY_PREFIX + token;
  console.log("[electron-auth-token-store] Looking up token, key:", key.substring(0, 30) + "...");
  console.log("[electron-auth-token-store] Full token:", token);
  console.log("[electron-auth-token-store] Full key:", key);
  const redis = getRedisClient();
  if (redis) {
    console.log("[electron-auth-token-store] Using Redis");
    console.log("[electron-auth-token-store] Redis client URL:", process.env.KV_REST_API_URL?.substring(0, 30) + "...");
    try {
      // Try to get the key
      const raw = await redis.get(key);
      console.log("[electron-auth-token-store] Redis get result:", raw ? `Found (type: ${typeof raw}, length: ${typeof raw === 'string' ? raw.length : 'N/A'})` : "null/undefined");
      
      // Also try to check if key exists
      const exists = await redis.exists(key);
      console.log("[electron-auth-token-store] Redis exists check:", exists ? "Key exists" : "Key does not exist");
      
      if (raw == null) {
        console.log("[electron-auth-token-store] Token not found in Redis");
        // Try to list all keys with our prefix to debug
        try {
          const keys = await redis.keys(`${KEY_PREFIX}*`);
          console.log("[electron-auth-token-store] Keys with prefix:", keys.length, keys);
        } catch (e) {
          console.log("[electron-auth-token-store] Could not list keys:", e);
        }
        return null;
      }
      
      // Upstash Redis may return the parsed object directly, or a JSON string
      let parsed: StoredValue;
      if (typeof raw === "string") {
        parsed = JSON.parse(raw) as StoredValue;
      } else if (typeof raw === "object" && raw !== null) {
        // Already parsed by Redis
        parsed = raw as StoredValue;
      } else {
        console.log("[electron-auth-token-store] Unexpected Redis value type:", typeof raw);
        return null;
      }
      
      await redis.del(key);
      console.log("[electron-auth-token-store] Token found in Redis, JWT length:", parsed.jwt?.length ?? 0);
      return parsed.jwt ?? null;
    } catch (error) {
      console.error("[electron-auth-token-store] Redis get failed:", error);
      return null;
    }
  }
  console.log("[electron-auth-token-store] Using memory store, entries:", memoryStore.size);
  console.log("[electron-auth-token-store] Memory store keys:", Array.from(memoryStore.keys()).map(k => k.substring(0, 30) + "..."));
  const entry = memoryStore.get(key);
  if (!entry) {
    console.log("[electron-auth-token-store] Token not found in memory store");
    console.log("[electron-auth-token-store] Looking for key:", key);
    console.log("[electron-auth-token-store] Available keys:", Array.from(memoryStore.keys()));
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    console.log("[electron-auth-token-store] Token expired, expiresAt:", entry.expiresAt, "now:", Date.now());
    memoryStore.delete(key);
    return null;
  }
  memoryStore.delete(key);
  console.log("[electron-auth-token-store] Token found in memory store, JWT length:", entry.value.jwt?.length ?? 0);
  return entry.value.jwt;
}
