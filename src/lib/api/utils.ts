import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import type { UserProfile, SubscriptionTier, PersonalityType, RiskTolerance, ExperienceLevel } from '@/types';

// =============================================================================
// ERROR CODES
// =============================================================================

/**
 * Standard error codes for API responses
 */
export const ERROR_CODES = {
  // Authentication errors (AUTH_xxx)
  UNAUTHORIZED: { code: 'AUTH_001', message: 'Unauthorized', status: 401 },
  FORBIDDEN: { code: 'AUTH_002', message: 'Forbidden', status: 403 },
  
  // Data errors (DATA_xxx)
  NOT_FOUND: { code: 'DATA_001', message: 'Not found', status: 404 },
  
  // Rate limiting errors (RATE_xxx)
  RATE_LIMITED: { code: 'RATE_001', message: 'Rate limit exceeded', status: 429 },
  
  // Validation errors (VAL_xxx)
  INVALID_REQUEST: { code: 'VAL_001', message: 'Invalid request', status: 400 },
  INVALID_SYMBOL: { code: 'VAL_002', message: 'Invalid stock symbol', status: 400 },
  MISSING_PARAMS: { code: 'VAL_003', message: 'Missing required parameters', status: 400 },
  
  // Internal errors (INT_xxx)
  INTERNAL_ERROR: { code: 'INT_001', message: 'Internal error', status: 500 },
  SERVICE_UNAVAILABLE: { code: 'INT_002', message: 'Service temporarily unavailable', status: 503 },
  DATABASE_ERROR: { code: 'INT_003', message: 'Database error', status: 500 },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

// =============================================================================
// RESPONSE TYPES
// =============================================================================

/**
 * Standard API success response
 */
export interface APISuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    cached?: boolean;
    timestamp?: string;
    [key: string]: any;
  };
}

/**
 * Standard API error response
 */
export interface APIErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * Combined API response type
 */
export type APIResponse<T> = APISuccessResponse<T> | APIErrorResponse;

// =============================================================================
// RESPONSE HELPERS
// =============================================================================

/**
 * Create a success response
 * 
 * @param data - Response data
 * @param meta - Optional metadata (cached, timestamp, etc.)
 * @returns Formatted success response object
 * 
 * @example
 * ```ts
 * return NextResponse.json(successResponse({ quote: stockData }));
 * ```
 */
export function successResponse<T>(
  data: T,
  meta?: Record<string, any>
): APISuccessResponse<T> {
  return {
    success: true,
    data,
    meta: meta ? {
      ...meta,
      timestamp: meta.timestamp ?? new Date().toISOString(),
    } : undefined,
  };
}

/**
 * Create an error response as NextResponse
 * 
 * @param code - Error code from ERROR_CODES
 * @param message - Error message (overrides default)
 * @param status - HTTP status code (overrides default)
 * @returns NextResponse with error body
 * 
 * @example
 * ```ts
 * return errorResponse('NOT_FOUND', 'Stock not found');
 * ```
 */
export function errorResponse(
  code: ErrorCode | string,
  message?: string,
  status?: number
): NextResponse<APIErrorResponse> {
  const errorDef = ERROR_CODES[code as ErrorCode];
  
  const errorCode = errorDef?.code ?? code;
  const errorMessage = message ?? errorDef?.message ?? 'An error occurred';
  const httpStatus = status ?? errorDef?.status ?? 500;

  return NextResponse.json(
    {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
      },
    },
    { status: httpStatus }
  );
}

/**
 * Create an error response with custom error object
 */
export function customErrorResponse(
  errorCode: string,
  message: string,
  status: number,
  headers?: HeadersInit
): NextResponse<APIErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: errorCode,
        message,
      },
    },
    { status, headers }
  );
}

// =============================================================================
// AUTH HELPERS
// =============================================================================

/**
 * Get authenticated user and their profile
 * 
 * This function:
 * 1. Gets the user from Clerk authentication
 * 2. Syncs/creates user profile in the database
 * 3. Returns the full user profile with subscription info
 * 
 * @param req - The incoming request (optional, for future use)
 * @returns User profile with subscription tier
 * @throws Redirects with UNAUTHORIZED error if not logged in
 * 
 * @example
 * ```ts
 * export async function GET(req: Request) {
 *   try {
 *     const user = await getAuthUser(req);
 *     // user has full profile including subscription
 *   } catch (error) {
 *     if (error instanceof AuthError) {
 *       return errorResponse('UNAUTHORIZED');
 *     }
 *   }
 * }
 * ```
 */
export async function getAuthUser(req?: Request): Promise<UserProfile> {
  // Get authenticated user from Clerk
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    throw new AuthError('Not authenticated');
  }

  // Get Clerk user details
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    throw new AuthError('User not found');
  }

  // Find or create user profile in database
  let userProfile = await db.userProfile.findUnique({
    where: { clerkId },
  });

  if (!userProfile) {
    // Create new user profile
    userProfile = await db.userProfile.create({
      data: {
        clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
        name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null,
        subscription: 'free',
        aiQuestionsToday: 0,
      },
    });
  } else {
    // Sync email and name if changed in Clerk
    const currentEmail = clerkUser.emailAddresses[0]?.emailAddress ?? '';
    const currentName = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null;
    
    if (userProfile.email !== currentEmail || userProfile.name !== currentName) {
      userProfile = await db.userProfile.update({
        where: { id: userProfile.id },
        data: {
          email: currentEmail,
          name: currentName,
        },
      });
    }
  }

  // Map database profile to UserProfile type
  return mapDbProfileToUserProfile(userProfile);
}

/**
 * Map database user profile to TypeScript UserProfile type
 */
function mapDbProfileToUserProfile(dbProfile: any): UserProfile {
  return {
    id: dbProfile.id,
    clerkId: dbProfile.clerkId,
    email: dbProfile.email,
    name: dbProfile.name ?? '',
    deepScore: dbProfile.deepScore,
    personalityType: dbProfile.personalityType as PersonalityType | null,
    riskTolerance: dbProfile.riskTolerance as RiskTolerance | null,
    experienceLevel: dbProfile.experienceLevel as ExperienceLevel | null,
    subscription: dbProfile.subscription as SubscriptionTier,
    subscriptionExpiresAt: null, // TODO: Add to schema if needed
    aiQuestionsToday: dbProfile.aiQuestionsToday,
    lastQuestionDate: dbProfile.lastQuestionDate,
    createdAt: dbProfile.createdAt,
    updatedAt: dbProfile.updatedAt,
  };
}

/**
 * Custom error class for authentication errors
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Check if user has required subscription tier
 * 
 * @param user - User profile
 * @param requiredTier - Required subscription tier
 * @returns true if user has required tier or higher
 */
export function hasSubscriptionTier(
  user: UserProfile,
  requiredTier: SubscriptionTier
): boolean {
  if (requiredTier === 'free') return true;
  return user.subscription === 'pro';
}

/**
 * Require specific subscription tier, throw FORBIDDEN if not met
 */
export function requireSubscription(
  user: UserProfile,
  requiredTier: SubscriptionTier
): void {
  if (!hasSubscriptionTier(user, requiredTier)) {
    throw new SubscriptionError(`This feature requires ${requiredTier} subscription`);
  }
}

/**
 * Custom error class for subscription errors
 */
export class SubscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

// =============================================================================
// REQUEST HELPERS
// =============================================================================

/**
 * Parse JSON body from request, with error handling
 */
export async function parseJsonBody<T>(req: Request): Promise<T> {
  try {
    const body = await req.json();
    return body as T;
  } catch {
    throw new ValidationError('Invalid JSON body');
  }
}

/**
 * Get query parameter from request URL
 */
export function getQueryParam(req: Request, param: string): string | null {
  const url = new URL(req.url);
  return url.searchParams.get(param);
}

/**
 * Get all query parameters as object
 */
export function getQueryParams(req: Request): Record<string, string> {
  const url = new URL(req.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// =============================================================================
// ERROR HANDLER WRAPPER
// =============================================================================

/**
 * Wrap an API handler with standard error handling
 * 
 * @example
 * ```ts
 * export const GET = withErrorHandler(async (req) => {
 *   const user = await getAuthUser(req);
 *   return NextResponse.json(successResponse({ user }));
 * });
 * ```
 */
export function withErrorHandler(
  handler: (req: Request, context?: any) => Promise<NextResponse>
) {
  return async (req: Request, context?: any): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof AuthError) {
        return errorResponse('UNAUTHORIZED', error.message);
      }

      if (error instanceof SubscriptionError) {
        return errorResponse('FORBIDDEN', error.message);
      }

      if (error instanceof ValidationError) {
        return errorResponse('INVALID_REQUEST', error.message);
      }

      // Generic error
      return errorResponse(
        'INTERNAL_ERROR',
        process.env.NODE_ENV === 'development' && error instanceof Error
          ? error.message
          : 'An unexpected error occurred'
      );
    }
  };
}

// =============================================================================
// CACHE HELPERS
// =============================================================================

/**
 * Create cache control headers
 */
export function cacheHeaders(maxAge: number, staleWhileRevalidate?: number): HeadersInit {
  let value = `public, max-age=${maxAge}`;
  if (staleWhileRevalidate) {
    value += `, stale-while-revalidate=${staleWhileRevalidate}`;
  }
  return { 'Cache-Control': value };
}

/**
 * No-cache headers for dynamic data
 */
export const NO_CACHE_HEADERS: HeadersInit = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};
