import { Redis } from '@upstash/redis';

// Types
interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  timestamp: number;
}

// Initialize Upstash Redis client
let redis: Redis | null = null;

try {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    redis = new Redis({
      url,
      token,
    });
  } else {
    console.warn('Redis credentials not found. Caching will be disabled.');
  }
} catch (error) {
  console.error('Failed to initialize Redis:', error);
}

// ============================================
// GENERIC CACHE FUNCTIONS
// ============================================

/**
 * Get a value from cache
 */
export async function get<T>(key: string): Promise<T | null> {
  if (!redis) return null;

  try {
    const value = await redis.get<T>(key);
    return value;
  } catch (error) {
    console.error(`Redis GET error for key "${key}":`, error);
    return null;
  }
}

/**
 * Set a value in cache with optional TTL
 */
export async function set(
  key: string,
  value: any,
  ttlSeconds?: number
): Promise<void> {
  if (!redis) return;

  try {
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } else {
      await redis.set(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error(`Redis SET error for key "${key}":`, error);
  }
}

/**
 * Delete a key from cache
 */
export async function del(key: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Redis DEL error for key "${key}":`, error);
  }
}

// ============================================
// STOCK QUOTE CACHING (60 seconds TTL)
// ============================================

const QUOTE_TTL = 60; // 60 seconds
const QUOTE_PREFIX = 'quote:';

/**
 * Cache a stock quote (60 second TTL)
 */
export async function cacheQuote(
  symbol: string,
  data: StockQuote
): Promise<void> {
  const key = `${QUOTE_PREFIX}${symbol.toUpperCase()}`;
  await set(key, data, QUOTE_TTL);
}

/**
 * Get cached stock quote
 */
export async function getCachedQuote(
  symbol: string
): Promise<StockQuote | null> {
  const key = `${QUOTE_PREFIX}${symbol.toUpperCase()}`;
  const cached = await get<string>(key);
  
  if (!cached) return null;
  
  try {
    return typeof cached === 'string' ? JSON.parse(cached) : cached;
  } catch (error) {
    console.error('Failed to parse cached quote:', error);
    return null;
  }
}

// ============================================
// FUNDAMENTALS CACHING (1 hour TTL)
// ============================================

const FUNDAMENTALS_TTL = 3600; // 1 hour
const FUNDAMENTALS_PREFIX = 'fundamentals:';

/**
 * Cache stock fundamentals (1 hour TTL)
 */
export async function cacheFundamentals(
  symbol: string,
  data: any
): Promise<void> {
  const key = `${FUNDAMENTALS_PREFIX}${symbol.toUpperCase()}`;
  await set(key, data, FUNDAMENTALS_TTL);
}

/**
 * Get cached stock fundamentals
 */
export async function getCachedFundamentals(symbol: string): Promise<any | null> {
  const key = `${FUNDAMENTALS_PREFIX}${symbol.toUpperCase()}`;
  const cached = await get<string>(key);
  
  if (!cached) return null;
  
  try {
    return typeof cached === 'string' ? JSON.parse(cached) : cached;
  } catch (error) {
    console.error('Failed to parse cached fundamentals:', error);
    return null;
  }
}

// ============================================
// AI EXPLANATION CACHING (24 hours TTL)
// ============================================

const EXPLANATION_TTL = 86400; // 24 hours
const EXPLANATION_PREFIX = 'explanation:';

/**
 * Cache an AI explanation (24 hour TTL)
 */
export async function cacheExplanation(
  id: string,
  explanation: string
): Promise<void> {
  const key = `${EXPLANATION_PREFIX}${id}`;
  await set(key, explanation, EXPLANATION_TTL);
}

/**
 * Get cached AI explanation
 */
export async function getCachedExplanation(id: string): Promise<string | null> {
  const key = `${EXPLANATION_PREFIX}${id}`;
  const cached = await get<string>(key);
  
  if (!cached) return null;
  
  try {
    return typeof cached === 'string' ? JSON.parse(cached) : cached;
  } catch (error) {
    console.error('Failed to parse cached explanation:', error);
    return null;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Clear all cached data for a specific symbol
 */
export async function clearSymbolCache(symbol: string): Promise<void> {
  const upperSymbol = symbol.toUpperCase();
  await Promise.all([
    del(`${QUOTE_PREFIX}${upperSymbol}`),
    del(`${FUNDAMENTALS_PREFIX}${upperSymbol}`),
  ]);
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redis !== null;
}
