import type { OHLCV, RiskMetrics, RiskLevel, MarketCapCategory, FundamentalMetrics } from '@/types';
import { get, set } from '@/lib/redis';
import { getChartData } from './yahoo';

// =============================================================================
// CACHE CONFIG
// =============================================================================

const RISK_CACHE_TTL = 3600; // 1 hour
const RISK_CACHE_PREFIX = 'risk:';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate daily returns from price history
 */
function calculateDailyReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const prevPrice = prices[i - 1];
    const currentPrice = prices[i];
    if (prevPrice && currentPrice && prevPrice > 0) {
      returns.push((currentPrice - prevPrice) / prevPrice);
    }
  }
  return returns;
}

/**
 * Calculate standard deviation
 */
function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate annualized volatility from daily returns
 */
function annualizedVolatility(dailyReturns: number[]): number {
  if (dailyReturns.length === 0) return 0;
  const dailyStdDev = standardDeviation(dailyReturns);
  // Annualize using ~252 trading days
  return dailyStdDev * Math.sqrt(252) * 100; // Return as percentage
}

/**
 * Calculate beta coefficient vs benchmark
 */
function calculateBeta(stockReturns: number[], benchmarkReturns: number[]): number | null {
  if (stockReturns.length < 30 || benchmarkReturns.length < 30) {
    return null;
  }

  // Use minimum length
  const length = Math.min(stockReturns.length, benchmarkReturns.length);
  const stockSlice = stockReturns.slice(-length);
  const benchmarkSlice = benchmarkReturns.slice(-length);

  // Calculate means
  const stockMean = stockSlice.reduce((a, b) => a + b, 0) / length;
  const benchmarkMean = benchmarkSlice.reduce((a, b) => a + b, 0) / length;

  // Calculate covariance and variance
  let covariance = 0;
  let benchmarkVariance = 0;

  for (let i = 0; i < length; i++) {
    const stockVal = stockSlice[i];
    const benchmarkVal = benchmarkSlice[i];
    if (stockVal === undefined || benchmarkVal === undefined) continue;
    
    const stockDiff = stockVal - stockMean;
    const benchmarkDiff = benchmarkVal - benchmarkMean;
    covariance += stockDiff * benchmarkDiff;
    benchmarkVariance += benchmarkDiff * benchmarkDiff;
  }

  covariance /= length;
  benchmarkVariance /= length;

  if (benchmarkVariance === 0) return null;

  return covariance / benchmarkVariance;
}

/**
 * Calculate maximum drawdown
 */
function calculateMaxDrawdown(prices: number[]): number {
  if (prices.length === 0) return 0;

  let maxDrawdown = 0;
  let peak = prices[0] ?? 0;

  for (const price of prices) {
    if (price > peak) {
      peak = price;
    }
    if (peak > 0) {
      const drawdown = (peak - price) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
  }

  return maxDrawdown * 100; // Return as percentage
}

/**
 * Determine debt risk level based on debt-to-equity ratio
 */
function getDebtRisk(debtToEquity: number | null): RiskLevel {
  if (debtToEquity === null) return 'medium';
  if (debtToEquity < 0.5) return 'low';
  if (debtToEquity <= 1.5) return 'medium';
  return 'high';
}

/**
 * Determine interest coverage risk level
 */
function getInterestCoverageRisk(interestCoverage: number | null): RiskLevel {
  if (interestCoverage === null) return 'medium';
  if (interestCoverage > 5) return 'low';
  if (interestCoverage >= 2) return 'medium';
  return 'high';
}

/**
 * Determine volume risk level based on average daily volume
 */
function getVolumeRisk(avgVolume: number | null): RiskLevel {
  if (avgVolume === null) return 'medium';
  if (avgVolume > 1000000) return 'low';
  if (avgVolume >= 100000) return 'medium';
  return 'high';
}

/**
 * Determine market cap category
 */
function getMarketCapCategory(marketCap: number | null): MarketCapCategory {
  if (marketCap === null) return 'mid';
  
  // Market cap thresholds (in USD)
  if (marketCap >= 200_000_000_000) return 'mega';      // > $200B
  if (marketCap >= 10_000_000_000) return 'large';      // $10B - $200B
  if (marketCap >= 2_000_000_000) return 'mid';         // $2B - $10B
  if (marketCap >= 300_000_000) return 'small';         // $300M - $2B
  return 'micro';                                        // < $300M
}

/**
 * Convert risk level to numeric score (0-100)
 */
function riskLevelToScore(level: RiskLevel): number {
  switch (level) {
    case 'low': return 20;
    case 'medium': return 50;
    case 'high': return 80;
  }
}

/**
 * Convert numeric score to risk level
 */
function scoreToRiskLevel(score: number): RiskLevel {
  if (score <= 33) return 'low';
  if (score <= 66) return 'medium';
  return 'high';
}

/**
 * Calculate market risk score from metrics
 */
function calculateMarketRiskScore(
  beta: number | null,
  volatility30D: number | null,
  volatility90D: number | null,
  maxDrawdown: number | null
): number {
  let score = 50; // Default to medium
  let components = 0;

  // Beta score (1.0 = neutral, higher = riskier)
  if (beta !== null) {
    const betaScore = Math.min(100, Math.max(0, (beta - 0.5) * 50 + 25));
    score += betaScore;
    components++;
  }

  // Volatility score (higher volatility = higher risk)
  if (volatility30D !== null) {
    // Typical stock volatility is 15-30%, consider >50% high risk
    const volScore = Math.min(100, Math.max(0, volatility30D * 2));
    score += volScore;
    components++;
  }

  if (volatility90D !== null) {
    const volScore = Math.min(100, Math.max(0, volatility90D * 2));
    score += volScore;
    components++;
  }

  // Max drawdown score (higher drawdown = higher risk)
  if (maxDrawdown !== null) {
    // 10% drawdown = low risk, 50%+ = high risk
    const ddScore = Math.min(100, Math.max(0, maxDrawdown * 2));
    score += ddScore;
    components++;
  }

  return components > 0 ? score / (components + 1) : 50;
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

/**
 * Calculate comprehensive risk metrics for a stock
 * @param symbol - Stock symbol
 * @param priceHistory - OHLCV price history (optional, will fetch if not provided)
 * @param fundamentals - Fundamental metrics (optional)
 * @param marketCap - Market capitalization (optional)
 * @param avgVolume - Average daily volume (optional)
 */
export async function calculateRiskMetrics(
  symbol: string,
  priceHistory?: OHLCV[],
  fundamentals?: FundamentalMetrics | null,
  marketCap?: number | null,
  avgVolume?: number | null
): Promise<RiskMetrics> {
  const upperSymbol = symbol.toUpperCase().trim();

  // Check cache first
  const cacheKey = `${RISK_CACHE_PREFIX}${upperSymbol}`;
  const cached = await get<string>(cacheKey);
  
  if (cached) {
    try {
      const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
      return {
        ...parsed,
        lastUpdated: new Date(parsed.lastUpdated),
      };
    } catch {
      // Continue to calculate if cache parse fails
    }
  }

  // Fetch price history if not provided
  let stockPrices: number[] = [];
  if (priceHistory && priceHistory.length > 0) {
    stockPrices = priceHistory.map(p => p.close);
  } else {
    // Fetch 1Y of data for risk calculations
    const chartData = await getChartData(upperSymbol, '1Y');
    stockPrices = chartData.map(p => p.close);
  }

  // Fetch SPY data for beta calculation
  let spyPrices: number[] = [];
  try {
    const spyData = await getChartData('SPY', '1Y');
    spyPrices = spyData.map(p => p.close);
  } catch (error) {
    console.warn('Could not fetch SPY data for beta calculation');
  }

  // Calculate daily returns
  const stockReturns = calculateDailyReturns(stockPrices);
  const spyReturns = calculateDailyReturns(spyPrices);

  // ==========================================================================
  // MARKET RISK CALCULATIONS
  // ==========================================================================

  // Beta (requires at least 30 data points)
  const beta = calculateBeta(stockReturns, spyReturns);

  // Volatility calculations
  const returns30D = stockReturns.slice(-30);
  const returns90D = stockReturns.slice(-90);
  
  const volatility30D = returns30D.length >= 20 
    ? annualizedVolatility(returns30D) 
    : null;
  
  const volatility90D = returns90D.length >= 60 
    ? annualizedVolatility(returns90D) 
    : null;

  // Max drawdown (1 year)
  const maxDrawdown1Y = stockPrices.length > 0 
    ? calculateMaxDrawdown(stockPrices) 
    : null;

  // ==========================================================================
  // FUNDAMENTAL RISK CALCULATIONS
  // ==========================================================================

  const debtToEquity = fundamentals?.leverage?.debtToEquity ?? null;
  const interestCoverage = fundamentals?.leverage?.interestCoverage ?? null;

  const debtRisk = getDebtRisk(debtToEquity);
  const interestCoverageRisk = getInterestCoverageRisk(interestCoverage);

  // ==========================================================================
  // LIQUIDITY RISK CALCULATIONS
  // ==========================================================================

  const volumeRisk = getVolumeRisk(avgVolume ?? null);
  const marketCapCategory = getMarketCapCategory(marketCap ?? null);

  // ==========================================================================
  // OVERALL RISK SCORE CALCULATION
  // ==========================================================================

  // Market risk score (40% weight)
  const marketRiskScore = calculateMarketRiskScore(
    beta,
    volatility30D,
    volatility90D,
    maxDrawdown1Y
  );

  // Fundamental risk score (30% weight)
  const fundamentalRiskScore = (
    riskLevelToScore(debtRisk) + 
    riskLevelToScore(interestCoverageRisk)
  ) / 2;

  // Liquidity risk score (30% weight)
  let liquidityRiskScore = riskLevelToScore(volumeRisk);
  // Adjust for market cap (smaller = riskier)
  switch (marketCapCategory) {
    case 'mega': liquidityRiskScore = Math.min(liquidityRiskScore, 20); break;
    case 'large': liquidityRiskScore = Math.min(liquidityRiskScore, 35); break;
    case 'mid': break; // No adjustment
    case 'small': liquidityRiskScore = Math.max(liquidityRiskScore, 60); break;
    case 'micro': liquidityRiskScore = Math.max(liquidityRiskScore, 75); break;
  }

  // Weighted average
  const overallRiskScore = Math.round(
    marketRiskScore * 0.4 +
    fundamentalRiskScore * 0.3 +
    liquidityRiskScore * 0.3
  );

  const riskLevel = scoreToRiskLevel(overallRiskScore);

  // ==========================================================================
  // BUILD RESULT
  // ==========================================================================

  const result: RiskMetrics = {
    symbol: upperSymbol,
    overallRiskScore,
    riskLevel,
    marketRisk: {
      beta,
      volatility30D,
      volatility90D,
      maxDrawdown1Y,
    },
    fundamentalRisk: {
      debtRisk,
      interestCoverageRisk,
    },
    liquidityRisk: {
      avgDailyVolume: avgVolume ?? null,
      volumeRisk,
      marketCapCategory,
    },
    lastUpdated: new Date(),
  };

  // Cache the result
  await set(cacheKey, result, RISK_CACHE_TTL);

  return result;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  calculateRiskMetrics,
};
