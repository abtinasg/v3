import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getFundamentals } from '@/lib/market';
import { 
  successResponse, 
  errorResponse, 
  getAuthUser, 
  getQueryParam,
  AuthError 
} from '@/lib/api';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rate-limit';
import type { SubscriptionTier } from '@/types';

// Symbol validation schema: 1-5 uppercase characters
const symbolSchema = z.string().min(1).max(5).toUpperCase();

// Tier query param validation
const tierSchema = z.enum(['free', 'pro']).optional();

/**
 * GET /api/stocks/:symbol/fundamentals
 * 
 * Returns comprehensive fundamental metrics for a stock
 * Requires authentication - metrics depth based on subscription tier
 * 
 * Query Parameters:
 * - tier: 'free' | 'pro' (optional override, respects actual subscription)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    // 1. Require authentication and get user profile
    let user;
    try {
      user = await getAuthUser(request);
    } catch (error) {
      if (error instanceof AuthError) {
        return errorResponse('UNAUTHORIZED', 'Authentication required');
      }
      throw error;
    }

    // 2. Get user's subscription tier
    const userTier = user.subscription;

    // 3. Extract and validate symbol from params
    const { symbol: rawSymbol } = await params;
    
    const symbolParseResult = symbolSchema.safeParse(rawSymbol);
    
    if (!symbolParseResult.success) {
      return errorResponse('INVALID_SYMBOL', 'Symbol must be 1-5 characters');
    }
    
    const symbol = symbolParseResult.data;

    // 4. Get and validate tier query param
    const tierParam = getQueryParam(request, 'tier');
    const tierParseResult = tierSchema.safeParse(tierParam);
    
    if (!tierParseResult.success) {
      return errorResponse('INVALID_REQUEST', 'Invalid tier parameter. Must be "free" or "pro"');
    }
    
    const requestedTier = tierParseResult.data;

    // 5. Determine effective tier: 
    // - Free users always get free tier metrics
    // - Pro users can request either tier (default to pro)
    let effectiveTier: SubscriptionTier;
    if (userTier === 'free') {
      effectiveTier = 'free';
    } else {
      // Pro user: use requested tier or default to 'pro'
      effectiveTier = requestedTier ?? 'pro';
    }

    // Rate limit check
    const rateLimitResult = await checkRateLimit('api', user.id, userTier);
    
    if (!rateLimitResult.success) {
      return rateLimitExceededResponse(rateLimitResult);
    }

    // 6. Fetch fundamentals with appropriate tier
    const fundamentals = await getFundamentals(symbol, effectiveTier);

    if (!fundamentals) {
      return errorResponse('NOT_FOUND', `Fundamental data not found for symbol '${symbol}'`);
    }

    // 7. Format response according to FundamentalsResponse spec
    const response = {
      symbol: fundamentals.symbol,
      valuation: fundamentals.valuation,
      profitability: fundamentals.profitability,
      growth: fundamentals.growth,
      incomeStatement: fundamentals.incomeStatement,
      balanceSheet: fundamentals.balanceSheet,
      cashFlow: fundamentals.cashFlow,
      leverage: fundamentals.leverage,
      efficiency: fundamentals.efficiency,
      perShare: fundamentals.perShare,
      fiscalYear: fundamentals.fiscalYear,
      fiscalQuarter: fundamentals.fiscalQuarter,
      lastUpdated: fundamentals.lastUpdated instanceof Date 
        ? fundamentals.lastUpdated.toISOString() 
        : fundamentals.lastUpdated,
    };

    return NextResponse.json(
      successResponse(response, {
        cached: true, // Data may be cached in fundamentals service
        tier: effectiveTier,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          'Cache-Control': 'private, max-age=300, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Error in /api/stocks/[symbol]/fundamentals:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch fundamental data');
  }
}
