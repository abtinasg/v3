import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { SubscriptionTier } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export type RateLimitType = 'api' | 'ai' | 'search';

export interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Number of remaining requests in the current window */
  remaining: number;
  /** Unix timestamp (ms) when the rate limit resets */
  reset: number;
  /** Total limit for the current window */
  limit: number;
}

export interface RateLimitConfig {
  /** Requests allowed in the window */
  requests: number;
  /** Window duration in seconds */
  window: number;
}

// =============================================================================
// REDIS CLIENT
// =============================================================================

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
    console.warn('Redis credentials not found. Rate limiting will be disabled.');
  }
} catch (error) {
  console.error('Failed to initialize Redis for rate limiting:', error);
}

// =============================================================================
// RATE LIMIT CONFIGURATIONS
// =============================================================================

/**
 * Rate limit configurations per type and tier
 * 
 * API: General API requests
 * - Free: 60 requests per minute
 * - Pro: 300 requests per minute
 * 
 * AI: AI question/chat requests
 * - Free: 5 questions per day
 * - Pro: 100 requests per hour (to prevent abuse)
 * 
 * Search: Symbol search requests
 * - Free: 10 searches per hour
 * - Pro: 100 searches per hour
 */
const RATE_LIMITS: Record<RateLimitType, Record<SubscriptionTier, RateLimitConfig>> = {
  api: {
    free: { requests: 60, window: 60 },        // 60 per minute
    pro: { requests: 300, window: 60 },        // 300 per minute
  },
  ai: {
    free: { requests: 5, window: 86400 },      // 5 per day (24h)
    pro: { requests: 100, window: 3600 },      // 100 per hour
  },
  search: {
    free: { requests: 10, window: 3600 },      // 10 per hour
    pro: { requests: 100, window: 3600 },      // 100 per hour
  },
};

// =============================================================================
// RATE LIMITER INSTANCES
// =============================================================================

/**
 * Cache for rate limiter instances
 * Key format: `${type}:${tier}`
 */
const rateLimiters = new Map<string, Ratelimit>();

/**
 * Get or create a rate limiter instance for a specific type and tier
 */
function getRateLimiter(type: RateLimitType, tier: SubscriptionTier): Ratelimit | null {
  if (!redis) return null;

  const key = `${type}:${tier}`;
  
  if (!rateLimiters.has(key)) {
    const config = RATE_LIMITS[type][tier];
    
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.requests, `${config.window} s`),
      prefix: `ratelimit:${type}:${tier}`,
      analytics: true,
    });
    
    rateLimiters.set(key, limiter);
  }

  return rateLimiters.get(key)!;
}

// =============================================================================
// MAIN RATE LIMIT FUNCTION
// =============================================================================

/**
 * Check rate limit for a user
 * 
 * @param type - Type of rate limit ('api', 'ai', 'search')
 * @param userId - Unique user identifier (Clerk user ID)
 * @param tier - User's subscription tier ('free' or 'pro')
 * @returns RateLimitResult with success status, remaining count, and reset time
 * 
 * @example
 * ```ts
 * const result = await checkRateLimit('ai', 'user_123', 'free');
 * if (!result.success) {
 *   throw new Error('Rate limit exceeded');
 * }
 * ```
 */
export async function checkRateLimit(
  type: RateLimitType,
  userId: string,
  tier: SubscriptionTier
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[type][tier];
  
  // If Redis is not available, allow the request (fail open)
  if (!redis) {
    return {
      success: true,
      remaining: config.requests,
      reset: Date.now() + config.window * 1000,
      limit: config.requests,
    };
  }

  const limiter = getRateLimiter(type, tier);
  if (!limiter) {
    return {
      success: true,
      remaining: config.requests,
      reset: Date.now() + config.window * 1000,
      limit: config.requests,
    };
  }

  try {
    const result = await limiter.limit(userId);
    
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
      limit: config.requests,
    };
  } catch (error) {
    console.error(`Rate limit check failed for ${type}:${userId}:`, error);
    // Fail open on errors
    return {
      success: true,
      remaining: config.requests,
      reset: Date.now() + config.window * 1000,
      limit: config.requests,
    };
  }
}

// =============================================================================
// MIDDLEWARE HELPER
// =============================================================================

/**
 * Rate limit error response
 */
export class RateLimitError extends Error {
  public readonly remaining: number;
  public readonly reset: number;
  public readonly limit: number;

  constructor(message: string, result: RateLimitResult) {
    super(message);
    this.name = 'RateLimitError';
    this.remaining = result.remaining;
    this.reset = result.reset;
    this.limit = result.limit;
  }
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
    'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
  };
}

/**
 * Rate limit middleware for API routes
 * 
 * Gets the authenticated user from Clerk, checks their subscription tier,
 * and enforces rate limits. Throws RateLimitError if exceeded.
 * 
 * @param req - The incoming request
 * @param type - Type of rate limit to apply ('api', 'ai', 'search')
 * @returns Object containing userId, tier, and rate limit result
 * @throws RateLimitError if rate limit is exceeded
 * 
 * @example
 * ```ts
 * export async function POST(req: Request) {
 *   try {
 *     const { userId, tier, rateLimit } = await withRateLimit(req, 'ai');
 *     // Process request...
 *   } catch (error) {
 *     if (error instanceof RateLimitError) {
 *       return NextResponse.json(
 *         { error: 'Rate limit exceeded' },
 *         { 
 *           status: 429,
 *           headers: createRateLimitHeaders(error)
 *         }
 *       );
 *     }
 *     throw error;
 *   }
 * }
 * ```
 */
export async function withRateLimit(
  req: Request,
  type: RateLimitType
): Promise<{
  userId: string;
  tier: SubscriptionTier;
  rateLimit: RateLimitResult;
}> {
  // Get authenticated user from Clerk
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized: No user found');
  }

  // TODO: Get user's subscription tier from database
  // For now, default to 'free' - should be fetched from user profile
  const tier: SubscriptionTier = 'free';

  // Check rate limit
  const result = await checkRateLimit(type, userId, tier);

  if (!result.success) {
    throw new RateLimitError(
      `Rate limit exceeded. Try again after ${new Date(result.reset).toISOString()}`,
      result
    );
  }

  return {
    userId,
    tier,
    rateLimit: result,
  };
}

/**
 * Create a rate limit exceeded response
 */
export function rateLimitExceededResponse(result: RateLimitResult): NextResponse {
  const resetDate = new Date(result.reset);
  const retryAfterSeconds = Math.ceil((result.reset - Date.now()) / 1000);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Try again after ${resetDate.toISOString()}`,
        retryAfter: retryAfterSeconds,
      },
    },
    {
      status: 429,
      headers: createRateLimitHeaders(result),
    }
  );
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get the rate limit configuration for a type and tier
 */
export function getRateLimitConfig(
  type: RateLimitType,
  tier: SubscriptionTier
): RateLimitConfig {
  return RATE_LIMITS[type][tier];
}

/**
 * Check remaining AI questions for a user (useful for UI display)
 * 
 * @param userId - User ID
 * @param tier - Subscription tier
 * @returns Object with remaining questions and reset time
 */
export async function getAIQuestionsRemaining(
  userId: string,
  tier: SubscriptionTier
): Promise<{ remaining: number; reset: number; limit: number }> {
  const result = await checkRateLimit('ai', userId, tier);
  return {
    remaining: result.remaining,
    reset: result.reset,
    limit: result.limit,
  };
}

/**
 * Reset rate limit for a user (admin function)
 * Note: This only works by waiting for the natural reset
 * For immediate reset, you'd need to delete the Redis key directly
 */
export async function resetRateLimit(
  type: RateLimitType,
  userId: string,
  tier: SubscriptionTier
): Promise<boolean> {
  if (!redis) return false;

  try {
    // The key format used by @upstash/ratelimit
    const prefix = `ratelimit:${type}:${tier}`;
    const key = `${prefix}:${userId}`;
    
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`Failed to reset rate limit for ${userId}:`, error);
    return false;
  }
}
