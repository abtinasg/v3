# Deep - Data Models & Types
## Version 1.0 | November 2025

---

## 1. User Types

```typescript
// User profile (extended from Clerk)
interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  
  // Deep-specific
  deepScore: number | null;
  personalityType: PersonalityType | null;
  riskTolerance: RiskTolerance | null;
  experienceLevel: ExperienceLevel | null;
  
  // Subscription
  subscription: SubscriptionTier;
  subscriptionExpiresAt: Date | null;
  
  // Usage tracking
  aiQuestionsToday: number;
  lastQuestionDate: Date | null;
  
  createdAt: Date;
  updatedAt: Date;
}

type PersonalityType = 
  | 'cautious-saver'
  | 'steady-builder'
  | 'growth-hunter'
  | 'strategic-analyst'
  | 'trend-surfer';

type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

type SubscriptionTier = 'free' | 'pro';
```

---

## 2. Deep Score Types

```typescript
interface DeepScoreQuiz {
  questions: ScoreQuestion[];
  totalQuestions: number;
}

interface ScoreQuestion {
  id: string;
  text: string;
  type: QuestionType;
  category: QuestionCategory;
  options: QuestionOption[];
}

type QuestionType = 'single' | 'multiple' | 'scale';
type QuestionCategory = 'knowledge' | 'behavior' | 'risk';

interface QuestionOption {
  id: string;
  text: string;
  value: number;
  personalityWeight?: Partial<Record<PersonalityType, number>>;
}

interface ScoreResult {
  overallScore: number;  // 0-100
  breakdown: {
    knowledge: number;
    behavior: number;
    risk: number;
  };
  personalityType: PersonalityType;
  personalityStrength: number;  // confidence 0-1
  riskTolerance: RiskTolerance;
  recommendations: string[];
}

interface ScoreResponse {
  id: string;
  userId: string;
  questionId: string;
  answer: string | string[];
  createdAt: Date;
}
```

---

## 3. Market Data Types

```typescript
// Index data
interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  updatedAt: Date;
}

// Sector data
interface MarketSector {
  symbol: string;       // ETF symbol (XLK, XLV, etc.)
  name: string;
  changePercent: number;
  weekChange: number;
  monthChange: number;
  ytdChange: number;
  volume: number;
}

// Macro indicator
interface MacroIndicator {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  lastUpdate: Date;
  source: string;
  description: string;
}

// Treasury yields
interface TreasuryYield {
  maturity: '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y' | '10Y' | '30Y';
  rate: number;
  change: number;
  previousRate: number;
}

// News item
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: Date;
  symbols: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  relevanceScore: number;
}
```

---

## 4. Stock Data Types

```typescript
// Basic quote
interface StockQuote {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  close: number;
  previousClose: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  updatedAt: Date;
}

// Company profile
interface CompanyProfile {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  exchange: string;
  ceo: string;
  employees: number;
  headquarters: string;
  website: string;
  ipoDate: string;
}

// Fundamental metrics (full set ~150)
interface FundamentalMetrics {
  symbol: string;
  
  // Valuation
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
  
  // Profitability
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
  
  // Growth
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
  
  // Income Statement
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
  
  // Balance Sheet
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
  
  // Cash Flow
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
  
  // Leverage & Liquidity
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
  
  // Efficiency
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
  
  // Per Share
  perShare: {
    bookValue: number | null;
    tangibleBookValue: number | null;
    revenuePerShare: number | null;
    fcfPerShare: number | null;
    dividend: number | null;
    dividendYield: number | null;
    payoutRatio: number | null;
  };
  
  // Metadata
  fiscalYear: number;
  fiscalQuarter: number;
  lastUpdated: Date;
}

// Risk metrics
interface RiskMetrics {
  symbol: string;
  
  // Overall
  overallRiskScore: number;  // 1-100
  riskLevel: 'low' | 'medium' | 'high';
  
  // Market-based
  marketRisk: {
    beta: number | null;
    volatility30D: number | null;
    volatility90D: number | null;
    volatility1Y: number | null;
    maxDrawdown1Y: number | null;
    maxDrawdown3Y: number | null;
    valueAtRisk95: number | null;
    valueAtRisk99: number | null;
    expectedShortfall: number | null;
    sharpeRatio: number | null;
    sortinoRatio: number | null;
    informationRatio: number | null;
    treynorRatio: number | null;
  };
  
  // Fundamental
  fundamentalRisk: {
    debtRisk: 'low' | 'medium' | 'high';
    earningsStability: number | null;
    revenueStability: number | null;
    cashFlowStability: number | null;
    marginStability: number | null;
    interestCoverageRisk: 'low' | 'medium' | 'high';
    altmanZScore: number | null;
    piotroskiScore: number | null;
    beneishMScore: number | null;
  };
  
  // Liquidity
  liquidityRisk: {
    avgBidAskSpread: number | null;
    avgDailyVolume: number | null;
    avgDollarVolume: number | null;
    volumeVolatility: number | null;
    turnoverRatio: number | null;
    marketCapCategory: 'micro' | 'small' | 'mid' | 'large' | 'mega';
    floatPercentage: number | null;
  };
  
  // Behavioral/Valuation
  behavioralRisk: {
    peDeviation: number | null;
    pbDeviation: number | null;
    psDeviation: number | null;
    valuationRisk: 'low' | 'medium' | 'high';
    momentumScore: number | null;
    rsiLevel: number | null;
    priceToMovingAvg50: number | null;
    priceToMovingAvg200: number | null;
  };
  
  lastUpdated: Date;
}

// Chart data
interface OHLCV {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartData {
  symbol: string;
  range: string;
  interval: string;
  data: OHLCV[];
}
```

---

## 5. AI Conversation Types

```typescript
// Conversation
interface AIConversation {
  id: string;
  userId: string;
  contextType: ConversationContext;
  contextSymbol: string | null;
  contextIndicators: string[];
  createdAt: Date;
  updatedAt: Date;
}

type ConversationContext = 'terminal' | 'stock' | 'general';

// Message
interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  context?: MessageContext;
  createdAt: Date;
}

interface MessageContext {
  type: string;
  symbol?: string;
  indicators?: string[];
  pageState?: Record<string, any>;
}

// AI Request/Response
interface AIRequest {
  type: 'chat' | 'explain' | 'analyze' | 'compare';
  message?: string;
  conversationId?: string;
  context: AIRequestContext;
}

interface AIRequestContext {
  currentPage: 'terminal' | 'stock' | 'profile' | 'score';
  selectedSymbol?: string;
  selectedIndicators?: string[];
  userLevel: ExperienceLevel;
  personalityType?: PersonalityType;
}

interface AIResponse {
  content: string;
  conversationId: string;
  messageId: string;
  cached: boolean;
  tokensUsed?: number;
}
```

---

## 6. Study List Types

```typescript
interface StudyList {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
}

interface StudyListItem {
  id: string;
  listId: string;
  symbol: string;
  addedAt: Date;
  notes?: string;
  
  // Enriched data (populated on fetch)
  quote?: StockQuote;
  priceAtAdd?: number;
  gainSinceAdd?: number;
}

interface StudyListWithItems extends StudyList {
  items: StudyListItem[];
  itemCount: number;
}
```

---

## 7. Cache Types

```typescript
// Stock cache entry
interface StockCacheEntry {
  symbol: string;
  dataType: 'quote' | 'fundamentals' | 'risk' | 'chart';
  data: any;
  updatedAt: Date;
  expiresAt: Date;
}

// Macro cache entry
interface MacroCacheEntry {
  indicatorId: string;
  data: MacroIndicator;
  updatedAt: Date;
  expiresAt: Date;
}

// AI response cache
interface AICacheEntry {
  key: string;  // hash of prompt + context
  response: string;
  createdAt: Date;
  hitCount: number;
}

// Cache TTLs (in seconds)
const CACHE_TTL = {
  QUOTE: 60,
  FUNDAMENTALS: 3600,
  RISK: 3600,
  CHART_1D: 60,
  CHART_OTHER: 3600,
  MACRO: 900,
  NEWS: 300,
  AI_COMMON: 86400,
  AI_STOCK: 3600,
} as const;
```

---

## 8. Subscription & Usage Types

```typescript
interface Subscription {
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

interface UsageLimits {
  tier: SubscriptionTier;
  aiQuestionsPerDay: number;
  studyListMaxItems: number;
  searchesPerHour: number;
  apiCallsPerMinute: number;
}

const TIER_LIMITS: Record<SubscriptionTier, UsageLimits> = {
  free: {
    tier: 'free',
    aiQuestionsPerDay: 5,
    studyListMaxItems: 3,
    searchesPerHour: 10,
    apiCallsPerMinute: 60,
  },
  pro: {
    tier: 'pro',
    aiQuestionsPerDay: Infinity,
    studyListMaxItems: Infinity,
    searchesPerHour: 100,
    apiCallsPerMinute: 300,
  },
};

interface UsageTracking {
  userId: string;
  date: string;  // YYYY-MM-DD
  aiQuestionsUsed: number;
  searchesUsed: number;
  stocksAnalyzed: string[];
}
```

---

## 9. Zod Schemas (Validation)

```typescript
import { z } from 'zod';

// API Request Schemas
export const symbolSchema = z.string().min(1).max(10).toUpperCase();

export const timeRangeSchema = z.enum(['1D', '1W', '1M', '3M', '1Y', '5Y', 'MAX']);

export const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().uuid().optional(),
  context: z.object({
    type: z.enum(['terminal', 'stock', 'general']),
    symbols: z.array(symbolSchema).optional(),
    indicators: z.array(z.string()).optional(),
  }).optional(),
});

export const explainRequestSchema = z.object({
  type: z.enum(['metric', 'indicator', 'index', 'sector']),
  id: z.string().min(1).max(50),
  symbol: symbolSchema.optional(),
});

export const scoreSubmissionSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.union([z.string(), z.array(z.string())]),
  })),
});

export const studyListAddSchema = z.object({
  symbol: symbolSchema,
});
```
