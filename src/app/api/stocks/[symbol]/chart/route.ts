import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getChartData, type ChartRange } from '@/lib/market';
import { successResponse, errorResponse, getQueryParam } from '@/lib/api';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rate-limit';

// Symbol validation schema: 1-5 uppercase characters
const symbolSchema = z.string().min(1).max(5).toUpperCase();

// Range validation schema
const rangeSchema = z.enum(['1D', '1W', '1M', '3M', '1Y', '5Y']).default('1M');

// Interval mapping for response (matches what yahoo.ts uses internally)
const RANGE_TO_INTERVAL: Record<ChartRange, string> = {
  '1D': '5m',
  '1W': '30m',
  '1M': '1d',
  '3M': '1d',
  '1Y': '1d',
  '5Y': '1wk',
};

// Cache TTL based on range (in seconds)
const CACHE_MAX_AGE: Record<ChartRange, number> = {
  '1D': 60,      // 1 minute for intraday
  '1W': 300,     // 5 minutes
  '1M': 300,     // 5 minutes
  '3M': 300,     // 5 minutes
  '1Y': 300,     // 5 minutes
  '5Y': 300,     // 5 minutes
};

/**
 * GET /api/stocks/:symbol/chart
 * 
 * Returns historical price data (OHLCV) for a stock
 * Public endpoint - no authentication required
 * Rate limited by IP address
 * 
 * Query Parameters:
 * - range: '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y' (default: '1M')
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    // 1. Extract and validate symbol from params
    const { symbol: rawSymbol } = await params;
    
    const symbolParseResult = symbolSchema.safeParse(rawSymbol);
    
    if (!symbolParseResult.success) {
      return errorResponse('INVALID_SYMBOL', 'Symbol must be 1-5 characters');
    }
    
    const symbol = symbolParseResult.data;

    // 2. Get and validate range query param
    const rangeParam = getQueryParam(request, 'range') ?? '1M';
    const rangeParseResult = rangeSchema.safeParse(rangeParam);
    
    if (!rangeParseResult.success) {
      return errorResponse('INVALID_REQUEST', 'Invalid range parameter. Must be one of: 1D, 1W, 1M, 3M, 1Y, 5Y');
    }
    
    const range = rangeParseResult.data as ChartRange;

    // 3. Rate limit check using IP as identifier for public endpoint
    const ip = request.headers.get('x-forwarded-for') ?? 
               request.headers.get('x-real-ip') ?? 
               'anonymous';
    
    const rateLimitResult = await checkRateLimit('api', ip, 'free');
    
    if (!rateLimitResult.success) {
      return rateLimitExceededResponse(rateLimitResult);
    }

    // 4. Fetch chart data
    const chartData = await getChartData(symbol, range);

    if (!chartData || chartData.length === 0) {
      return errorResponse('NOT_FOUND', `No chart data available for symbol '${symbol}'`);
    }

    // 5. Format response according to ChartResponse spec
    const response = {
      symbol,
      range,
      interval: RANGE_TO_INTERVAL[range],
      data: chartData.map(point => ({
        timestamp: new Date(point.timestamp).toISOString(),
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
        volume: point.volume,
      })),
    };

    // Cache based on range: 1D = 60s, others = 5 minutes
    const maxAge = CACHE_MAX_AGE[range];

    return NextResponse.json(
      successResponse(response, {
        cached: true,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=${Math.floor(maxAge / 2)}`,
        },
      }
    );
  } catch (error) {
    console.error('Error in /api/stocks/[symbol]/chart:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch chart data');
  }
}
