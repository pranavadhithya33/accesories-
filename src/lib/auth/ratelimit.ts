import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (e) {
  console.error("Failed to initialize Redis:", e);
}

// 5 attempts per 15 minutes
const MAX_ATTEMPTS = 5;
const WINDOW_IN_SECONDS = 15 * 60;

export async function checkRateLimit(ip: string, action: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  if (!redis) {
    // If Redis is not configured, bypass rate limiting
    return { success: true, limit: MAX_ATTEMPTS, remaining: MAX_ATTEMPTS, reset: 0 };
  }

  const key = `ratelimit:${action}:${ip}`;
  
  try {
    const currentCount = await redis.incr(key);
    
    if (currentCount === 1) {
      await redis.expire(key, WINDOW_IN_SECONDS);
    }
    
    const ttl = await redis.ttl(key);
    
    return {
      success: currentCount <= MAX_ATTEMPTS,
      limit: MAX_ATTEMPTS,
      remaining: Math.max(0, MAX_ATTEMPTS - currentCount),
      reset: Date.now() + (ttl * 1000)
    };
  } catch (error) {
    console.error("Rate limiting error:", error);
    // Fail open if Redis has an issue
    return { success: true, limit: MAX_ATTEMPTS, remaining: MAX_ATTEMPTS, reset: 0 };
  }
}
