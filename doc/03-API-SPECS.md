# Deep - API Specifications
## Version 1.0 | November 2025

---

## 1. API Overview

Base URL: `/api`
Authentication: Clerk JWT (Bearer token)
Rate Limiting: Based on subscription tier

### Response Format
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    cached: boolean;
    timestamp: string;
  };
}
```

---

## 2. Market Data APIs

### 2.1 GET /api/market/indices
Returns major US market indices.

**Response:**
```typescript
interface IndicesResponse {
  indices: {
    symbol: string;      // "SPY", "DIA", "QQQ", "IWM"
    name: string;        // "S&P 500"
    price: number;
    change: number;
    changePercent: number;
    previousClose: number;
    dayHigh: number;
    dayLow: number;
    volume: number;
    updatedAt: string;
  }[];
}
```

**Example:**
```json
{
  "success": true,
  "data": {
    "indices": [
      {
        "symbol": "SPY",
        "name": "S&P 500",
        "price": 595.42,
        "change": 5.23,
        "changePercent": 0.89,
        "previousClose": 590.19,
        "dayHigh": 596.10,
        "dayLow": 592.35,
        "volume": 45230000,
        "updatedAt": "2025-11-26T14:30:00Z"
      }
    ]
  },
  "meta": { "cached": true, "timestamp": "2025-11-26T14:30:05Z" }
}
```

---

### 2.2 GET /api/market/sectors
Returns sector performance data.

**Response:**
```typescript
interface SectorsResponse {
  sectors: {
    symbol: string;      // "XLK", "XLV", "XLF"
    name: string;        // "Technology"
    changePercent: number;
    weekChange: number;
    monthChange: number;
    ytdChange: number;
  }[];
}
```

---

### 2.3 GET /api/market/macro
Returns key macroeconomic indicators.

**Response:**
```typescript
interface MacroResponse {
  indicators: {
    id: string;          // "FED_RATE", "CPI", "UNEMPLOYMENT"
    name: string;
    value: number;
    previousValue: number;
    change: number;
    unit: string;        // "%", "$", "basis points"
    lastUpdate: string;
    source: string;      // "FRED"
  }[];
  yields: {
    maturity: string;    // "2Y", "10Y", "30Y"
    rate: number;
    change: number;
  }[];
}
```

---

### 2.4 GET /api/market/news
Returns market news feed.

**Query Parameters:**
- `limit`: number (default: 20, max: 50)
- `symbols`: string (comma-separated, optional)

**Response:**
```typescript
interface NewsResponse {
  items: {
    id: string;
    title: string;
    summary: string;
    source: string;
    url: string;
    publishedAt: string;
    symbols: string[];
    sentiment?: 'positive' | 'negative' | 'neutral';
  }[];
}
```

---

## 3. Stock APIs

### 3.1 GET /api/stocks/:symbol/quote
Returns real-time quote data.

**Response:**
```typescript
interface QuoteResponse {
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
  peRatio: number;
  weekHigh52: number;
  weekLow52: number;
  updatedAt: string;
}
```

---

### 3.2 GET /api/stocks/:symbol/fundamentals
Returns comprehensive fundamental metrics.

**Query Parameters:**
- `tier`: 'free' | 'pro' (determines metric depth)

**Response (Pro tier - ~150 metrics):**
```typescript
interface FundamentalsResponse {
  symbol: string;
  
  // Valuation
  valuation: {
    peRatio: number;
    pegRatio: number;
    pbRatio: number;
    psRatio: number;
    evToEbitda: number;
    evToRevenue: number;
    priceToFcf: number;
    enterpriseValue: number;
  };
  
  // Profitability
  profitability: {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    roe: number;
    roa: number;
    roic: number;
    roce: number;
  };
  
  // Growth
  growth: {
    revenueGrowthYoy: number;
    revenueGrowth3Y: number;
    revenueGrowth5Y: number;
    epsGrowthYoy: number;
    epsGrowth3Y: number;
    epsGrowth5Y: number;
    fcfGrowthYoy: number;
  };
  
  // Income Statement
  incomeStatement: {
    revenue: number;
    costOfRevenue: number;
    grossProfit: number;
    operatingExpenses: number;
    operatingIncome: number;
    netIncome: number;
    eps: number;
    epsDiluted: number;
  };
  
  // Balance Sheet
  balanceSheet: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    cash: number;
    totalDebt: number;
    netDebt: number;
    currentAssets: number;
    currentLiabilities: number;
  };
  
  // Cash Flow
  cashFlow: {
    operatingCashFlow: number;
    capitalExpenditures: number;
    freeCashFlow: number;
    dividendsPaid: number;
    shareRepurchases: number;
  };
  
  // Leverage & Liquidity
  leverage: {
    debtToEquity: number;
    debtToAssets: number;
    interestCoverage: number;
    currentRatio: number;
    quickRatio: number;
    cashRatio: number;
  };
  
  // Efficiency
  efficiency: {
    assetTurnover: number;
    inventoryTurnover: number;
    receivablesTurnover: number;
    payablesTurnover: number;
    daysInventory: number;
    daysReceivables: number;
    daysPayables: number;
    cashConversionCycle: number;
  };
  
  // Per Share Data
  perShare: {
    bookValue: number;
    tangibleBookValue: number;
    revenue: number;
    freeCashFlow: number;
    dividend: number;
    dividendYield: number;
    payoutRatio: number;
  };
  
  lastUpdated: string;
  fiscalYear: number;
  fiscalQuarter: number;
}
```

---

### 3.3 GET /api/stocks/:symbol/risk
Returns risk metrics panel data.

**Response:**
```typescript
interface RiskResponse {
  symbol: string;
  
  // Overall
  overallRiskScore: number;  // 1-100
  riskLevel: 'low' | 'medium' | 'high';
  
  // Market-Based Risk
  marketRisk: {
    beta: number;
    volatility30D: number;
    volatility90D: number;
    maxDrawdown1Y: number;
    valueAtRisk95: number;
    expectedShortfall: number;
    sharpeRatio: number;
    sortinoRatio: number;
  };
  
  // Fundamental Risk
  fundamentalRisk: {
    debtRisk: 'low' | 'medium' | 'high';
    earningsStability: number;
    cashFlowStability: number;
    interestCoverageRisk: 'low' | 'medium' | 'high';
    altmanZScore: number;
    piotroskiScore: number;
  };
  
  // Liquidity Risk
  liquidityRisk: {
    avgBidAskSpread: number;
    avgDailyVolume: number;
    volumeVolatility: number;
    turnoverRatio: number;
    marketCapCategory: 'micro' | 'small' | 'mid' | 'large' | 'mega';
  };
  
  // Behavioral/Valuation Risk
  behavioralRisk: {
    peDeviation: number;      // vs 5-year average
    pbDeviation: number;
    valuationRisk: 'low' | 'medium' | 'high';
    momentumScore: number;
    rsiLevel: number;
  };
}
```

---

### 3.4 GET /api/stocks/:symbol/chart
Returns historical price data.

**Query Parameters:**
- `range`: '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y' | 'MAX'
- `interval`: '1m' | '5m' | '15m' | '1h' | '1d' | '1w' (auto-selected based on range)

**Response:**
```typescript
interface ChartResponse {
  symbol: string;
  range: string;
  interval: string;
  data: {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}
```

---

### 3.5 POST /api/stocks/search
Search for stock symbols.

**Request:**
```typescript
interface SearchRequest {
  query: string;
  limit?: number;  // default: 10
}
```

**Response:**
```typescript
interface SearchResponse {
  results: {
    symbol: string;
    name: string;
    exchange: string;
    type: 'stock' | 'etf';
  }[];
}
```

---

## 4. AI APIs

### 4.1 POST /api/ai/chat
General AI chat endpoint.

**Request:**
```typescript
interface ChatRequest {
  message: string;
  conversationId?: string;
  context?: {
    type: 'terminal' | 'stock' | 'general';
    symbols?: string[];
    indicators?: string[];
  };
}
```

**Response (streaming):**
```typescript
// SSE stream
data: { "type": "start", "conversationId": "..." }
data: { "type": "chunk", "content": "..." }
data: { "type": "chunk", "content": "..." }
data: { "type": "end" }
```

---

### 4.2 POST /api/ai/explain
Explain a specific metric or indicator.

**Request:**
```typescript
interface ExplainRequest {
  type: 'metric' | 'indicator' | 'index' | 'sector';
  id: string;           // "PE_RATIO", "SPY", "XLK"
  symbol?: string;      // for stock-specific context
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
}
```

**Response:**
```typescript
interface ExplainResponse {
  explanation: {
    whatItIs: string;
    howToInterpret: string;
    currentContext?: string;
    comparison?: string;
    learnMore?: string;
  };
  cached: boolean;
}
```

---

### 4.3 POST /api/ai/analyze
Full stock analysis (AI Analyst).

**Request:**
```typescript
interface AnalyzeRequest {
  symbol: string;
  depth: 'summary' | 'full';  // free vs pro
}
```

**Response:**
```typescript
interface AnalyzeResponse {
  symbol: string;
  generatedAt: string;
  
  // Summary (always included)
  summary: {
    overview: string;
    keyStrengths: string[];
    keyRisks: string[];
    conclusion: string;
  };
  
  // Full analysis (pro only)
  fullAnalysis?: {
    macroContext: {
      economicEnvironment: string;
      sectorOutlook: string;
      relevantFactors: string[];
    };
    
    businessAnalysis: {
      businessModel: string;
      competitivePosition: string;
      moatAnalysis: string;
      managementQuality: string;
    };
    
    financialAnalysis: {
      revenueAnalysis: string;
      profitabilityAnalysis: string;
      balanceSheetHealth: string;
      cashFlowQuality: string;
    };
    
    valuationAnalysis: {
      currentValuation: string;
      historicalComparison: string;
      peerComparison: string;
      fairValueEstimate: string;
    };
    
    riskAnalysis: {
      keyRisks: {
        risk: string;
        severity: 'low' | 'medium' | 'high';
        mitigation: string;
      }[];
      scenarios: {
        bull: string;
        base: string;
        bear: string;
      };
    };
  };
}
```

---

### 4.4 POST /api/ai/compare
Multi-indicator reasoning.

**Request:**
```typescript
interface CompareRequest {
  items: {
    type: 'stock' | 'index' | 'sector' | 'indicator';
    id: string;
  }[];
  question?: string;
}
```

**Response:**
```typescript
interface CompareResponse {
  analysis: {
    relationship: string;
    currentInteraction: string;
    implications: string;
    historicalContext?: string;
  };
}
```

---

## 5. User APIs

### 5.1 GET /api/user/profile
Get current user profile.

**Response:**
```typescript
interface ProfileResponse {
  id: string;
  email: string;
  name: string;
  subscription: 'free' | 'pro';
  deepScore: number | null;
  personalityType: string | null;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive' | null;
  createdAt: string;
  usage: {
    aiQuestionsToday: number;
    aiQuestionsLimit: number;
    studyListCount: number;
    studyListLimit: number;
  };
}
```

---

### 5.2 POST /api/user/score
Submit Deep Score quiz answers.

**Request:**
```typescript
interface ScoreRequest {
  answers: {
    questionId: string;
    answer: string | string[];
  }[];
}
```

**Response:**
```typescript
interface ScoreResponse {
  score: number;
  personalityType: string;
  breakdown: {
    knowledge: number;
    behavior: number;
    risk: number;
  };
  riskTolerance: string;
}
```

---

### 5.3 GET /api/user/study-list
Get user's study list.

**Response:**
```typescript
interface StudyListResponse {
  items: {
    id: string;
    symbol: string;
    name: string;
    addedAt: string;
    currentPrice: number;
    change: number;
    changePercent: number;
  }[];
  limit: number;
  canAdd: boolean;
}
```

---

### 5.4 POST /api/user/study-list
Add stock to study list.

**Request:**
```typescript
interface AddStudyListRequest {
  symbol: string;
}
```

**Response:**
```typescript
interface AddStudyListResponse {
  success: boolean;
  item: {
    id: string;
    symbol: string;
    name: string;
    addedAt: string;
  };
}
```

---

### 5.5 DELETE /api/user/study-list/:id
Remove stock from study list.

**Response:**
```typescript
interface DeleteStudyListResponse {
  success: boolean;
}
```

---

## 6. Error Codes

```typescript
const ERROR_CODES = {
  // Auth
  UNAUTHORIZED: 'AUTH_001',
  FORBIDDEN: 'AUTH_002',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_001',
  DAILY_LIMIT_EXCEEDED: 'RATE_002',
  
  // Validation
  INVALID_SYMBOL: 'VAL_001',
  INVALID_REQUEST: 'VAL_002',
  
  // Data
  SYMBOL_NOT_FOUND: 'DATA_001',
  DATA_UNAVAILABLE: 'DATA_002',
  
  // AI
  AI_ERROR: 'AI_001',
  AI_RATE_LIMIT: 'AI_002',
  
  // Subscription
  PRO_REQUIRED: 'SUB_001',
  STUDY_LIST_FULL: 'SUB_002',
};
```

---

## 7. Rate Limits

| Tier | AI Questions | Stock Searches | API Calls/min |
|------|--------------|----------------|---------------|
| Free | 5/day | 10/hour | 60 |
| Pro | Unlimited | 100/hour | 300 |

Headers returned:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1701234567
```
