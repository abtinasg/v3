import { NextResponse } from 'next/server';
import { z } from 'zod';
import { searchSymbols } from '@/lib/market';
import { successResponse, errorResponse, parseJsonBody, ValidationError } from '@/lib/api';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rate-limit';

// Search request validation schema
const searchRequestSchema = z.object({
  query: z.string().min(1, 'Query is required').max(20, 'Query too long'),
});

/**
 * POST /api/stocks/search
 * 
 * Search for stock/ETF symbols
 * Public endpoint - no authentication required
 * Rate limited by IP address (search limiter)
 * 
 * Request body:
 * - query: string (1-20 characters)
 * 
 * Returns up to 10 matching results from US exchanges
 */
export async function POST(request: Request) {
  try {
    // 1. Rate limit check using IP as identifier (search limiter)
    const ip = request.headers.get('x-forwarded-for') ?? 
               request.headers.get('x-real-ip') ?? 
               'anonymous';
    
    const rateLimitResult = await checkRateLimit('search', ip, 'free');
    
    if (!rateLimitResult.success) {
      return rateLimitExceededResponse(rateLimitResult);
    }

    // 2. Parse and validate request body
    let body;
    try {
      body = await parseJsonBody<{ query: string }>(request);
    } catch (error) {
      if (error instanceof ValidationError) {
        return errorResponse('INVALID_REQUEST', error.message);
      }
      throw error;
    }

    const parseResult = searchRequestSchema.safeParse(body);
    
    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors[0]?.message ?? 'Invalid request';
      return errorResponse('INVALID_REQUEST', errorMessage);
    }

    const { query } = parseResult.data;

    // 3. Search for symbols (returns up to 10 results)
    const searchResults = await searchSymbols(query);

    // 4. Format response according to SearchResponse spec
    const response = {
      results: searchResults.map(result => ({
        symbol: result.symbol,
        name: result.name,
        exchange: result.exchange,
        type: result.type === 'ETF' ? 'etf' as const : 'stock' as const,
      })),
    };

    return NextResponse.json(
      successResponse(response, {
        cached: true,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Error in /api/stocks/search:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to search symbols');
  }
}
