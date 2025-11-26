import YahooFinance from 'yahoo-finance2';
import type { StockQuote, MarketIndex, MarketSector } from '@/types';
import { getCachedQuote, cacheQuote, get, set } from '@/lib/redis';

// Create a singleton instance
const yahooFinance = new YahooFinance();

// =============================================================================
// TYPES
// =============================================================================

/**
 * Yahoo Finance quote response type (simplified)
 */
interface YahooQuoteResult {
  symbol: string;
  shortName?: string;
  longName?: string;
  exchange?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketPreviousClose?: number;
  regularMarketVolume?: number;
  averageDailyVolume3Month?: number;
  averageDailyVolume10Day?: number;
  marketCap?: number;
  trailingPE?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
}

/**
 * Extended StockQuote with additional fields from Yahoo Finance
 */
export interface ExtendedStockQuote extends StockQuote {
  /** P/E ratio (trailing twelve months) */
  peRatio: number | null;
  /** 52-week high */
  weekHigh52: number;
  /** 52-week low */
  weekLow52: number;
}

/**
 * Symbol search result
 */
export interface SymbolSearchResult {
  /** Stock symbol */
  symbol: string;
  /** Company/ETF name */
  name: string;
  /** Exchange (NYSE, NASDAQ, etc.) */
  exchange: string;
  /** Security type (EQUITY, ETF, etc.) */
  type: string;
}

/**
 * Valid chart time ranges
 */
export type ChartRange = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';

/**
 * OHLCV data point for charts
 */
export interface ChartDataPoint {
  /** Unix timestamp in milliseconds */
  timestamp: number;
  /** Opening price */
  open: number;
  /** High price */
  high: number;
  /** Low price */
  low: number;
  /** Closing price */
  close: number;
  /** Trading volume */
  volume: number;
}

// =============================================================================
// CACHE CONFIG
// =============================================================================

const SEARCH_CACHE_TTL = 3600; // 1 hour
const SEARCH_CACHE_PREFIX = 'search:';
const CHART_CACHE_PREFIX = 'chart:';
const INDICES_CACHE_KEY = 'market:indices';
const INDICES_CACHE_TTL = 60; // 60 seconds
const SECTORS_CACHE_KEY = 'market:sectors';
const SECTORS_CACHE_TTL = 60; // 60 seconds

// Chart cache TTLs based on range
const CHART_CACHE_TTL: Record<ChartRange, number> = {
  '1D': 60,      // 1 minute for intraday
  '1W': 300,     // 5 minutes for weekly
  '1M': 3600,    // 1 hour for monthly
  '3M': 3600,    // 1 hour
  '1Y': 3600,    // 1 hour
  '5Y': 86400,   // 24 hours for long-term
};

// Chart intervals based on range
const CHART_INTERVALS: Record<ChartRange, '5m' | '30m' | '1d' | '1wk'> = {
  '1D': '5m',
  '1W': '30m',
  '1M': '1d',
  '3M': '1d',
  '1Y': '1d',
  '5Y': '1wk',
};

// Chart periods in days (approximate)
const CHART_PERIODS: Record<ChartRange, number> = {
  '1D': 1,
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '1Y': 365,
  '5Y': 1825,
};

// US exchanges filter
const US_EXCHANGES = [
  'NYQ', 'NMS', 'NGM', 'NCM', 'NYS', 'NAS', 'PCX', 'ASE', 'BTS',
  'NYSE', 'NASDAQ', 'AMEX', 'ARCA', 'BATS'
];

// Market indices symbols and names
const INDEX_SYMBOLS: Record<string, string> = {
  'SPY': 'S&P 500',
  'DIA': 'Dow Jones',
  'QQQ': 'Nasdaq 100',
  'IWM': 'Russell 2000',
};

// Market sector ETF symbols and names
const SECTOR_SYMBOLS: Record<string, string> = {
  'XLK': 'Technology',
  'XLV': 'Healthcare',
  'XLF': 'Financials',
  'XLE': 'Energy',
  'XLI': 'Industrials',
  'XLP': 'Consumer Staples',
  'XLY': 'Consumer Discretionary',
  'XLB': 'Materials',
  'XLRE': 'Real Estate',
  'XLU': 'Utilities',
  'XLC': 'Communication',
};

// =============================================================================
// HELPER: Map Yahoo Quote to ExtendedStockQuote
// =============================================================================

function mapQuoteToStockQuote(quote: YahooQuoteResult, symbol: string): ExtendedStockQuote {
  return {
    symbol: quote.symbol || symbol,
    name: quote.shortName || quote.longName || symbol,
    exchange: quote.exchange || 'Unknown',
    price: quote.regularMarketPrice || 0,
    change: quote.regularMarketChange || 0,
    changePercent: quote.regularMarketChangePercent || 0,
    open: quote.regularMarketOpen || 0,
    high: quote.regularMarketDayHigh || 0,
    low: quote.regularMarketDayLow || 0,
    close: quote.regularMarketPrice || 0,
    previousClose: quote.regularMarketPreviousClose || 0,
    volume: quote.regularMarketVolume || 0,
    avgVolume: quote.averageDailyVolume3Month || quote.averageDailyVolume10Day || 0,
    marketCap: quote.marketCap || 0,
    peRatio: quote.trailingPE ?? null,
    weekHigh52: quote.fiftyTwoWeekHigh || 0,
    weekLow52: quote.fiftyTwoWeekLow || 0,
    updatedAt: new Date(),
  };
}

// =============================================================================
// FUNCTION 1: GET SINGLE QUOTE
// =============================================================================

/**
 * Get real-time stock quote from Yahoo Finance
 * @param symbol - Stock symbol (e.g., 'AAPL', 'MSFT')
 * @returns ExtendedStockQuote or null if not found
 */
export async function getQuote(symbol: string): Promise<ExtendedStockQuote | null> {
  const upperSymbol = symbol.toUpperCase().trim();
  
  if (!upperSymbol) {
    return null;
  }

  try {
    // Check cache first
    const cached = await getCachedQuote(upperSymbol);
    if (cached) {
      return cached as unknown as ExtendedStockQuote;
    }

    // Fetch from Yahoo Finance
    const quote = await yahooFinance.quote(upperSymbol);
    
    if (!quote || !quote.regularMarketPrice) {
      return null;
    }

    const stockQuote: ExtendedStockQuote = {
      symbol: quote.symbol || upperSymbol,
      name: quote.shortName || quote.longName || upperSymbol,
      exchange: quote.exchange || 'Unknown',
      price: quote.regularMarketPrice || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      open: quote.regularMarketOpen || 0,
      high: quote.regularMarketDayHigh || 0,
      low: quote.regularMarketDayLow || 0,
      close: quote.regularMarketPrice || 0,
      previousClose: quote.regularMarketPreviousClose || 0,
      volume: quote.regularMarketVolume || 0,
      avgVolume: quote.averageDailyVolume3Month || quote.averageDailyVolume10Day || 0,
      marketCap: quote.marketCap || 0,
      peRatio: quote.trailingPE || null,
      weekHigh52: quote.fiftyTwoWeekHigh || 0,
      weekLow52: quote.fiftyTwoWeekLow || 0,
      updatedAt: new Date(),
    };

    // Cache the result
    await cacheQuote(upperSymbol, stockQuote as any);

    return stockQuote;
  } catch (error) {
    // Handle specific Yahoo Finance errors
    if (error instanceof Error) {
      // Symbol not found or invalid
      if (error.message.includes('Not Found') || error.message.includes('Invalid')) {
        console.warn(`Symbol not found: ${upperSymbol}`);
        return null;
      }
      console.error(`Error fetching quote for ${upperSymbol}:`, error.message);
    }
    return null;
  }
}

// =============================================================================
// FUNCTION 2: GET MULTIPLE QUOTES
// =============================================================================

/**
 * Get real-time quotes for multiple symbols
 * @param symbols - Array of stock symbols
 * @returns Array of ExtendedStockQuote (excludes failed symbols)
 */
export async function getMultipleQuotes(symbols: string[]): Promise<ExtendedStockQuote[]> {
  if (!symbols || symbols.length === 0) {
    return [];
  }

  // Normalize symbols
  const upperSymbols = [...new Set(symbols.map(s => s.toUpperCase().trim()).filter(Boolean))];
  
  if (upperSymbols.length === 0) {
    return [];
  }

  // Check cache for each symbol
  const cachedQuotes: ExtendedStockQuote[] = [];
  const uncachedSymbols: string[] = [];

  await Promise.all(
    upperSymbols.map(async (symbol) => {
      const cached = await getCachedQuote(symbol);
      if (cached) {
        cachedQuotes.push(cached as unknown as ExtendedStockQuote);
      } else {
        uncachedSymbols.push(symbol);
      }
    })
  );

  // If all symbols were cached, return early
  if (uncachedSymbols.length === 0) {
    return cachedQuotes;
  }

  try {
    // Batch fetch uncached symbols
    const results = await yahooFinance.quote(uncachedSymbols);
    
    // Handle single result (when only one symbol is requested)
    const quotesArray = Array.isArray(results) ? results : [results];
    
    const freshQuotes: ExtendedStockQuote[] = [];

    for (const quote of quotesArray) {
      if (!quote || !quote.regularMarketPrice) {
        continue;
      }

      const stockQuote: ExtendedStockQuote = {
        symbol: quote.symbol || '',
        name: quote.shortName || quote.longName || quote.symbol || '',
        exchange: quote.exchange || 'Unknown',
        price: quote.regularMarketPrice || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        open: quote.regularMarketOpen || 0,
        high: quote.regularMarketDayHigh || 0,
        low: quote.regularMarketDayLow || 0,
        close: quote.regularMarketPrice || 0,
        previousClose: quote.regularMarketPreviousClose || 0,
        volume: quote.regularMarketVolume || 0,
        avgVolume: quote.averageDailyVolume3Month || quote.averageDailyVolume10Day || 0,
        marketCap: quote.marketCap || 0,
        peRatio: quote.trailingPE || null,
        weekHigh52: quote.fiftyTwoWeekHigh || 0,
        weekLow52: quote.fiftyTwoWeekLow || 0,
        updatedAt: new Date(),
      };

      freshQuotes.push(stockQuote);

      // Cache each result
      await cacheQuote(stockQuote.symbol, stockQuote as any);
    }

    return [...cachedQuotes, ...freshQuotes];
  } catch (error) {
    console.error('Error fetching multiple quotes:', error);
    // Return cached quotes even if batch fetch fails
    return cachedQuotes;
  }
}

// =============================================================================
// FUNCTION 3: SEARCH SYMBOLS
// =============================================================================

/**
 * Search for stock/ETF symbols
 * @param query - Search query (company name or symbol)
 * @returns Array of search results (limited to 10, US exchanges only)
 */
export async function searchSymbols(query: string): Promise<SymbolSearchResult[]> {
  const trimmedQuery = query.trim();
  
  if (!trimmedQuery || trimmedQuery.length < 1) {
    return [];
  }

  try {
    // Check cache first
    const cacheKey = `${SEARCH_CACHE_PREFIX}${trimmedQuery.toLowerCase()}`;
    const cached = await get<string>(cacheKey);
    
    if (cached) {
      try {
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      } catch {
        // Continue to fetch if cache parse fails
      }
    }

    // Search Yahoo Finance
    const searchResults = await yahooFinance.search(trimmedQuery, {
      quotesCount: 20, // Fetch more to filter
      newsCount: 0,
    });

    if (!searchResults || !searchResults.quotes) {
      return [];
    }

    // Filter and map results
    const results: SymbolSearchResult[] = [];
    
    for (const item of searchResults.quotes) {
      // Skip non-Yahoo Finance results
      if (!item.isYahooFinance) continue;
      
      // Type guard for Yahoo Finance quotes
      if ('exchange' in item && 'quoteType' in item) {
        const exchange = String(item.exchange || '');
        const quoteType = String(item.quoteType || '');
        const symbol = String(item.symbol || '');
        
        // Only include equities and ETFs from US exchanges
        const isUSExchange = US_EXCHANGES.includes(exchange);
        const isValidType = quoteType === 'EQUITY' || quoteType === 'ETF';
        
        if (isUSExchange && isValidType && symbol) {
          results.push({
            symbol,
            name: String(item.shortname || item.longname || symbol),
            exchange,
            type: quoteType,
          });
        }
      }
      
      // Limit to 10 results
      if (results.length >= 10) break;
    }

    // Cache results
    await set(cacheKey, results, SEARCH_CACHE_TTL);

    return results;
  } catch (error) {
    console.error('Error searching symbols:', error);
    return [];
  }
}

// =============================================================================
// FUNCTION 4: GET MARKET INDICES
// =============================================================================

/**
 * Get current quotes for major market indices
 * @returns Array of MarketIndex sorted by symbol
 */
export async function getIndices(): Promise<MarketIndex[]> {
  try {
    // Check cache first
    const cached = await get<string>(INDICES_CACHE_KEY);
    
    if (cached) {
      try {
        const parsedCache = typeof cached === 'string' ? JSON.parse(cached) : cached;
        // Parse Date objects
        return parsedCache.map((index: any) => ({
          ...index,
          updatedAt: new Date(index.updatedAt),
        }));
      } catch {
        // Continue to fetch if cache parse fails
      }
    }

    // Fetch quotes for all index symbols
    const symbols = Object.keys(INDEX_SYMBOLS);
    const quotes = await yahooFinance.quote(symbols);
    
    // Handle single result (when only one symbol is requested)
    const quotesArray = Array.isArray(quotes) ? quotes : [quotes];
    
    const indices: MarketIndex[] = [];

    for (const quote of quotesArray) {
      if (!quote || !quote.regularMarketPrice) {
        continue;
      }

      const symbol = quote.symbol || '';
      const name = INDEX_SYMBOLS[symbol] || symbol;

      const index: MarketIndex = {
        symbol,
        name,
        price: quote.regularMarketPrice || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        previousClose: quote.regularMarketPreviousClose || 0,
        dayHigh: quote.regularMarketDayHigh || 0,
        dayLow: quote.regularMarketDayLow || 0,
        volume: quote.regularMarketVolume || 0,
        updatedAt: new Date(),
      };

      indices.push(index);
    }

    // Sort by symbol
    indices.sort((a, b) => a.symbol.localeCompare(b.symbol));

    // Cache results
    await set(INDICES_CACHE_KEY, indices, INDICES_CACHE_TTL);

    return indices;
  } catch (error) {
    console.error('Error fetching market indices:', error);
    return [];
  }
}

// =============================================================================
// FUNCTION 5: GET MARKET SECTORS
// =============================================================================

/**
 * Get current quotes for major market sectors
 * @returns Array of MarketSector sorted by changePercent (best to worst)
 */
export async function getSectors(): Promise<MarketSector[]> {
  try {
    // Check cache first
    const cached = await get<string>(SECTORS_CACHE_KEY);
    
    if (cached) {
      try {
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      } catch {
        // Continue to fetch if cache parse fails
      }
    }

    // Fetch quotes for all sector symbols
    const symbols = Object.keys(SECTOR_SYMBOLS);
    const quotes = await yahooFinance.quote(symbols);
    
    // Handle single result (when only one symbol is requested)
    const quotesArray = Array.isArray(quotes) ? quotes : [quotes];
    
    const sectors: MarketSector[] = [];

    for (const quote of quotesArray) {
      if (!quote || !quote.regularMarketPrice) {
        continue;
      }

      const symbol = quote.symbol || '';
      const name = SECTOR_SYMBOLS[symbol] || symbol;

      // Note: Using existing MarketSector type which has additional fields
      // The user spec wants a simpler type with just symbol, name, changePercent, price, volume
      const sector: MarketSector = {
        symbol,
        name,
        changePercent: quote.regularMarketChangePercent || 0,
        weekChange: 0, // Not calculated in this version
        monthChange: 0, // Not calculated in this version
        ytdChange: 0, // Not calculated in this version
        volume: quote.regularMarketVolume || 0,
      };

      sectors.push(sector);
    }

    // Sort by changePercent (best to worst)
    sectors.sort((a, b) => b.changePercent - a.changePercent);

    // Cache results
    await set(SECTORS_CACHE_KEY, sectors, SECTORS_CACHE_TTL);

    return sectors;
  } catch (error) {
    console.error('Error fetching market sectors:', error);
    return [];
  }
}

// =============================================================================
// FUNCTION 6: GET CHART DATA
// =============================================================================

/**
 * Get historical chart data for a symbol
 * @param symbol - Stock symbol (e.g., 'AAPL', 'MSFT')
 * @param range - Time range ('1D' | '1W' | '1M' | '3M' | '1Y' | '5Y')
 * @returns Array of OHLCV data points
 */
export async function getChartData(
  symbol: string,
  range: ChartRange
): Promise<ChartDataPoint[]> {
  const upperSymbol = symbol.toUpperCase().trim();
  
  if (!upperSymbol) {
    return [];
  }

  // Validate range
  if (!CHART_INTERVALS[range]) {
    console.warn(`Invalid chart range: ${range}`);
    return [];
  }

  try {
    // Check cache first
    const cacheKey = `${CHART_CACHE_PREFIX}${upperSymbol}:${range}`;
    const cached = await get<string>(cacheKey);
    
    if (cached) {
      try {
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      } catch {
        // Continue to fetch if cache parse fails
      }
    }

    // Calculate period dates
    const now = new Date();
    const period2 = now;
    const period1 = new Date(now);
    period1.setDate(period1.getDate() - CHART_PERIODS[range]);

    // For 1D, we need to handle market hours
    // Get data from last trading session
    if (range === '1D') {
      // Go back a few days to ensure we get data (handles weekends)
      period1.setDate(period1.getDate() - 5);
    }

    // Fetch chart data from Yahoo Finance
    const chartResult = await yahooFinance.chart(upperSymbol, {
      period1,
      period2,
      interval: CHART_INTERVALS[range],
      return: 'array',
    });

    if (!chartResult || !chartResult.quotes || chartResult.quotes.length === 0) {
      return [];
    }

    // Map quotes to ChartDataPoint format
    let dataPoints: ChartDataPoint[] = chartResult.quotes
      .filter((quote) => {
        // Filter out entries with null values
        return (
          quote.open !== null &&
          quote.high !== null &&
          quote.low !== null &&
          quote.close !== null &&
          quote.volume !== null
        );
      })
      .map((quote) => ({
        timestamp: quote.date.getTime(),
        open: quote.open as number,
        high: quote.high as number,
        low: quote.low as number,
        close: quote.close as number,
        volume: quote.volume as number,
      }));

    // For 1D range, filter to only include data from the last trading day
    if (range === '1D' && dataPoints.length > 0) {
      const lastPoint = dataPoints[dataPoints.length - 1];
      if (lastPoint) {
        const lastTimestamp = lastPoint.timestamp;
        const lastDate = new Date(lastTimestamp);
        const startOfLastDay = new Date(
          lastDate.getFullYear(),
          lastDate.getMonth(),
          lastDate.getDate()
        ).getTime();
        
        dataPoints = dataPoints.filter((point) => point.timestamp >= startOfLastDay);
      }
    }

    // Cache the results
    await set(cacheKey, dataPoints, CHART_CACHE_TTL[range]);

    return dataPoints;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Not Found') || error.message.includes('Invalid')) {
        console.warn(`Chart data not found for: ${upperSymbol}`);
        return [];
      }
      console.error(`Error fetching chart data for ${upperSymbol}:`, error.message);
    }
    return [];
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  getQuote,
  getMultipleQuotes,
  searchSymbols,
  getIndices,
  getSectors,
  getChartData,
};
