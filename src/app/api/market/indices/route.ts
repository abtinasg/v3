import { NextResponse } from 'next/server';
import { getIndices } from '@/lib/market';
import { successResponse, errorResponse } from '@/lib/api';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rate-limit';

/**
 * GET /api/market/indices
 * 
 * Returns major US market indices (SPY, DIA, QQQ, IWM)
 * Public endpoint - no authentication required
 * Rate limited by IP address
 */
export async function GET(request: Request) {
  try {
    // Rate limit check using IP as identifier for public endpoint
    const ip = request.headers.get('x-forwarded-for') ?? 
               request.headers.get('x-real-ip') ?? 
               'anonymous';
    
    const rateLimitResult = await checkRateLimit('api', ip, 'free');
    
    if (!rateLimitResult.success) {
      return rateLimitExceededResponse(rateLimitResult);
    }

    // Fetch indices data
    const indices = await getIndices();

    if (!indices || indices.length === 0) {
      return errorResponse('NOT_FOUND', 'Unable to fetch market indices');
    }

    // Format response with indices data
    const response = {
      indices: indices.map(index => ({
        symbol: index.symbol,
        name: index.name,
        price: index.price,
        change: index.change,
        changePercent: index.changePercent,
        previousClose: index.previousClose,
        dayHigh: index.dayHigh,
        dayLow: index.dayLow,
        volume: index.volume,
        updatedAt: index.updatedAt.toISOString(),
      })),
    };

    return NextResponse.json(
      successResponse(response, {
        cached: true, // Data is cached in yahoo service
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('Error in /api/market/indices:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch market indices');
  }
}
