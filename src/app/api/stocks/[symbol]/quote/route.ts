import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getQuote } from '@/lib/market';
import { successResponse, errorResponse } from '@/lib/api';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rate-limit';

// Symbol validation schema: 1-5 uppercase characters
const symbolSchema = z.string().min(1).max(5).toUpperCase();

/**
 * GET /api/stocks/:symbol/quote
 * 
 * Returns real-time quote data for a stock symbol
 * Public endpoint - no authentication required
 * Rate limited by IP address
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    // Extract and validate symbol from params
    const { symbol: rawSymbol } = await params;
    
    const parseResult = symbolSchema.safeParse(rawSymbol);
    
    if (!parseResult.success) {
      return errorResponse('INVALID_SYMBOL', 'Symbol must be 1-5 characters');
    }
    
    const symbol = parseResult.data;

    // Rate limit check using IP as identifier for public endpoint
    const ip = request.headers.get('x-forwarded-for') ?? 
               request.headers.get('x-real-ip') ?? 
               'anonymous';
    
    const rateLimitResult = await checkRateLimit('api', ip, 'free');
    
    if (!rateLimitResult.success) {
      return rateLimitExceededResponse(rateLimitResult);
    }

    // Fetch quote data (checks cache first, then Yahoo Finance)
    const quote = await getQuote(symbol);

    if (!quote) {
      return errorResponse('INVALID_SYMBOL', `Symbol '${symbol}' not found`);
    }

    // Format response according to QuoteResponse spec
    const response = {
      symbol: quote.symbol,
      name: quote.name,
      exchange: quote.exchange,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      open: quote.open,
      high: quote.high,
      low: quote.low,
      previousClose: quote.previousClose,
      volume: quote.volume,
      avgVolume: quote.avgVolume,
      marketCap: quote.marketCap,
      peRatio: quote.peRatio,
      weekHigh52: quote.weekHigh52,
      weekLow52: quote.weekLow52,
      updatedAt: quote.updatedAt instanceof Date 
        ? quote.updatedAt.toISOString() 
        : quote.updatedAt,
    };

    return NextResponse.json(
      successResponse(response, {
        cached: true, // Data may be cached in yahoo service
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('Error in /api/stocks/[symbol]/quote:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch stock quote');
  }
}
