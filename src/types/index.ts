// TypeScript types and interfaces for Deep application

// =============================================================================
// 1. USER TYPES
// =============================================================================

/**
 * User profile interface extending Clerk user data with Deep-specific fields
 */
export interface UserProfile {
  /** Unique identifier */
  id: string;
  /** Clerk authentication ID */
  clerkId: string;
  /** User email address */
  email: string;
  /** User display name */
  name: string;

  // Deep-specific fields
  /** Deep score (0-100) or null if not taken */
  deepScore: number | null;
  /** User's personality type based on quiz */
  personalityType: PersonalityType | null;
  /** User's risk tolerance level */
  riskTolerance: RiskTolerance | null;
  /** User's investment experience level */
  experienceLevel: ExperienceLevel | null;

  // Subscription
  /** Current subscription tier */
  subscription: SubscriptionTier;
  /** Subscription expiration date */
  subscriptionExpiresAt: Date | null;

  // Usage tracking
  /** Number of AI questions asked today */
  aiQuestionsToday: number;
  /** Date of last AI question */
  lastQuestionDate: Date | null;

  /** Account creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Personality types based on investment behavior and preferences
 */
export type PersonalityType =
  | 'cautious-saver'
  | 'steady-builder'
  | 'growth-hunter'
  | 'strategic-analyst'
  | 'trend-surfer';

/**
 * Risk tolerance levels for investment recommendations
 */
export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

/**
 * Experience levels for content personalization
 */
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Subscription tiers with different feature access levels
 */
export type SubscriptionTier = 'free' | 'pro';

// =============================================================================
// 2. MARKET TYPES
// =============================================================================

/**
 * Market index data (S&P 500, NASDAQ, etc.)
 */
export interface MarketIndex {
  /** Index symbol (e.g., 'SPY', 'QQQ') */
  symbol: string;
  /** Full index name */
  name: string;
  /** Current price */
  price: number;
  /** Price change from previous close */
  change: number;
  /** Percentage change */
  changePercent: number;
  /** Previous day's closing price */
  previousClose: number;
  /** Day high */
  dayHigh: number;
  /** Day low */
  dayLow: number;
  /** Trading volume */
  volume: number;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Market sector performance data
 */
export interface MarketSector {
  /** Sector ETF symbol (e.g., 'XLK' for Technology) */
  symbol: string;
  /** Sector name */
  name: string;
  /** Daily percentage change */
  changePercent: number;
  /** One week percentage change */
  weekChange: number;
  /** One month percentage change */
  monthChange: number;
  /** Year-to-date percentage change */
  ytdChange: number;
  /** Trading volume */
  volume: number;
}

/**
 * Macroeconomic indicator data
 */
export interface MacroIndicator {
  /** Unique identifier */
  id: string;
  /** Indicator name */
  name: string;
  /** Current value */
  value: number;
  /** Previous value */
  previousValue: number;
  /** Change from previous value */
  change: number;
  /** Unit of measurement */
  unit: string;
  /** Update frequency */
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  /** Last update timestamp */
  lastUpdate: Date;
  /** Data source */
  source: string;
  /** Description of the indicator */
  description: string;
}

/**
 * Treasury yield curve data
 */
export interface TreasuryYield {
  /** Maturity period */
  maturity: '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y' | '10Y' | '30Y';
  /** Current yield rate */
  rate: number;
  /** Change from previous rate */
  change: number;
  /** Previous yield rate */
  previousRate: number;
}

/**
 * Financial news item
 */
export interface NewsItem {
  /** Unique identifier */
  id: string;
  /** Article title */
  title: string;
  /** Article summary */
  summary: string;
  /** News source */
  source: string;
  /** Article URL */
  url: string;
  /** Publication timestamp */
  publishedAt: Date;
  /** Related stock symbols */
  symbols: string[];
  /** Sentiment analysis result */
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  /** Relevance score for filtering */
  relevanceScore: number;
}

// =============================================================================
// 3. STOCK TYPES
// =============================================================================

/**
 * Real-time stock quote data
 */
export interface StockQuote {
  /** Stock symbol */
  symbol: string;
  /** Company name */
  name: string;
  /** Exchange (NYSE, NASDAQ, etc.) */
  exchange: string;
  /** Current price */
  price: number;
  /** Price change */
  change: number;
  /** Percentage change */
  changePercent: number;
  /** Opening price */
  open: number;
  /** Day high */
  high: number;
  /** Day low */
  low: number;
  /** Previous close */
  close: number;
  /** Previous day's closing price */
  previousClose: number;
  /** Trading volume */
  volume: number;
  /** Average daily volume */
  avgVolume: number;
  /** Market capitalization */
  marketCap: number;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Company profile information
 */
export interface CompanyProfile {
  /** Stock symbol */
  symbol: string;
  /** Company name */
  name: string;
  /** Company description */
  description: string;
  /** Sector classification */
  sector: string;
  /** Industry classification */
  industry: string;
  /** Trading exchange */
  exchange: string;
  /** CEO name */
  ceo: string;
  /** Number of employees */
  employees: number;
  /** Headquarters location */
  headquarters: string;
  /** Company website */
  website: string;
  /** IPO date */
  ipoDate: string;
}

/**
 * OHLCV data point for stock charts
 */
export interface OHLCV {
  /** Timestamp */
  timestamp: Date;
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

/**
 * Fundamental metrics for stock analysis (~80 metrics)
 */
export interface FundamentalMetrics {
  /** Stock symbol */
  symbol: string;

  /** Valuation ratios */
  valuation: {
    peRatio: number | null;
    forwardPE: number | null;
    pegRatio: number | null;
    pbRatio: number | null;
    psRatio: number | null;
    evToEbitda: number | null;
    evToRevenue: number | null;
    evToFcf: number | null;
    priceToFcf: number | null;
    enterpriseValue: number | null;
  };

  /** Profitability metrics */
  profitability: {
    grossMargin: number | null;
    operatingMargin: number | null;
    ebitdaMargin: number | null;
    netMargin: number | null;
    roe: number | null;
    roa: number | null;
    roic: number | null;
    roce: number | null;
  };

  /** Growth metrics */
  growth: {
    revenueGrowthYoy: number | null;
    revenueGrowth3Y: number | null;
    revenueGrowth5Y: number | null;
    revenueGrowthQoQ: number | null;
    epsGrowthYoy: number | null;
    epsGrowth3Y: number | null;
    epsGrowth5Y: number | null;
    epsGrowthQoQ: number | null;
    fcfGrowthYoy: number | null;
    fcfGrowth3Y: number | null;
  };

  /** Income statement data */
  incomeStatement: {
    revenue: number | null;
    costOfRevenue: number | null;
    grossProfit: number | null;
    operatingExpenses: number | null;
    researchAndDevelopment: number | null;
    sellingGeneralAdmin: number | null;
    operatingIncome: number | null;
    ebitda: number | null;
    interestExpense: number | null;
    taxExpense: number | null;
    netIncome: number | null;
    eps: number | null;
    epsDiluted: number | null;
  };

  /** Balance sheet data */
  balanceSheet: {
    totalAssets: number | null;
    totalLiabilities: number | null;
    totalEquity: number | null;
    cash: number | null;
    shortTermInvestments: number | null;
    cashAndEquivalents: number | null;
    accountsReceivable: number | null;
    inventory: number | null;
    currentAssets: number | null;
    propertyPlantEquipment: number | null;
    goodwill: number | null;
    intangibleAssets: number | null;
    accountsPayable: number | null;
    shortTermDebt: number | null;
    currentLiabilities: number | null;
    longTermDebt: number | null;
    totalDebt: number | null;
    netDebt: number | null;
    retainedEarnings: number | null;
  };

  /** Cash flow data */
  cashFlow: {
    operatingCashFlow: number | null;
    capitalExpenditures: number | null;
    freeCashFlow: number | null;
    dividendsPaid: number | null;
    shareRepurchases: number | null;
    acquisitions: number | null;
    investingCashFlow: number | null;
    financingCashFlow: number | null;
    netChangeInCash: number | null;
  };

  /** Leverage and liquidity ratios */
  leverage: {
    debtToEquity: number | null;
    debtToAssets: number | null;
    debtToEbitda: number | null;
    netDebtToEbitda: number | null;
    interestCoverage: number | null;
    currentRatio: number | null;
    quickRatio: number | null;
    cashRatio: number | null;
  };

  /** Efficiency ratios */
  efficiency: {
    assetTurnover: number | null;
    inventoryTurnover: number | null;
    receivablesTurnover: number | null;
    payablesTurnover: number | null;
    daysInventory: number | null;
    daysReceivables: number | null;
    daysPayables: number | null;
    cashConversionCycle: number | null;
  };

  /** Per share data */
  perShare: {
    bookValue: number | null;
    tangibleBookValue: number | null;
    revenuePerShare: number | null;
    fcfPerShare: number | null;
    dividend: number | null;
    dividendYield: number | null;
    payoutRatio: number | null;
  };

  /** Fiscal year of data */
  fiscalYear: number;
  /** Fiscal quarter of data */
  fiscalQuarter: number;
  /** Last data update timestamp */
  lastUpdated: Date;
}

/**
 * Risk level classification
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * Market capitalization category
 */
export type MarketCapCategory = 'micro' | 'small' | 'mid' | 'large' | 'mega';

/**
 * Risk metrics for stock analysis
 */
export interface RiskMetrics {
  /** Stock symbol */
  symbol: string;

  /** Overall risk score (0-100) */
  overallRiskScore: number;
  /** Overall risk level */
  riskLevel: RiskLevel;

  /** Market-based risk metrics */
  marketRisk: {
    /** Beta coefficient vs market (SPY) */
    beta: number | null;
    /** 30-day volatility (annualized) */
    volatility30D: number | null;
    /** 90-day volatility (annualized) */
    volatility90D: number | null;
    /** Maximum drawdown over 1 year */
    maxDrawdown1Y: number | null;
  };

  /** Fundamental risk metrics */
  fundamentalRisk: {
    /** Debt risk based on debt-to-equity ratio */
    debtRisk: RiskLevel;
    /** Interest coverage risk */
    interestCoverageRisk: RiskLevel;
  };

  /** Liquidity risk metrics */
  liquidityRisk: {
    /** Average daily trading volume */
    avgDailyVolume: number | null;
    /** Volume-based risk level */
    volumeRisk: RiskLevel;
    /** Market cap category */
    marketCapCategory: MarketCapCategory;
  };

  /** Last update timestamp */
  lastUpdated: Date;
}

// =============================================================================
// 4. AI TYPES
// =============================================================================

/**
 * AI conversation session
 */
export interface AIConversation {
  /** Unique identifier */
  id: string;
  /** User ID */
  userId: string;
  /** Context type for the conversation */
  contextType: ConversationContext;
  /** Related stock symbol if applicable */
  contextSymbol: string | null;
  /** Active technical indicators */
  contextIndicators: string[];
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Conversation context types
 */
export type ConversationContext = 'terminal' | 'stock' | 'general';

/**
 * Individual message in an AI conversation
 */
export interface AIMessage {
  /** Unique identifier */
  id: string;
  /** Conversation ID */
  conversationId: string;
  /** Message role */
  role: 'user' | 'assistant';
  /** Message content */
  content: string;
  /** Optional context information */
  context?: AIContext;
  /** Creation timestamp */
  createdAt: Date;
}

/**
 * Context information for AI messages
 */
export interface AIContext {
  /** Context type */
  type: string;
  /** Related stock symbol */
  symbol?: string;
  /** Active indicators */
  indicators?: string[];
  /** Current page state */
  pageState?: Record<string, any>;
}

// =============================================================================
// 5. STUDY LIST TYPES
// =============================================================================

/**
 * User-created study list for tracking stocks
 */
export interface StudyList {
  /** Unique identifier */
  id: string;
  /** User ID */
  userId: string;
  /** List name */
  name: string;
  /** Creation timestamp */
  createdAt: Date;
}

/**
 * Individual item in a study list
 */
export interface StudyListItem {
  /** Unique identifier */
  id: string;
  /** Study list ID */
  listId: string;
  /** Stock symbol */
  symbol: string;
  /** Date added to list */
  addedAt: Date;
  /** Optional user notes */
  notes?: string;
}

// =============================================================================
// 6. API RESPONSE WRAPPER
// =============================================================================

/**
 * Generic API response wrapper
 */
export interface APIResponse<T = any> {
  /** Success status */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message if failed */
  error?: string;
  /** Additional metadata */
  meta?: {
    /** Total count for paginated responses */
    total?: number;
    /** Current page number */
    page?: number;
    /** Items per page */
    limit?: number;
    /** Request timestamp */
    timestamp?: Date;
    /** Response time in milliseconds */
    responseTime?: number;
  };
}
