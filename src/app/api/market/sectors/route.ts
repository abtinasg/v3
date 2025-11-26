import { NextResponse } from 'next/server';
import { getSectors } from '@/lib/market';
import { successResponse, errorResponse } from '@/lib/api';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rate-limit';

/**
 * GET /api/market/sectors
 * 
 * Returns major market sector ETFs with performance data
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

    // Fetch sectors data
    const sectors = await getSectors();

    if (!sectors || sectors.length === 0) {
      return errorResponse('NOT_FOUND', 'Unable to fetch market sectors');
    }

    // Format response with sectors data
    const response = {
      sectors: sectors.map(sector => ({
        symbol: sector.symbol,
        name: sector.name,
        changePercent: sector.changePercent,
        volume: sector.volume,
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
    console.error('Error in /api/market/sectors:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch market sectors');
  }
}
