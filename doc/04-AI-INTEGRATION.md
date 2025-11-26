# Deep Terminal - AI Integration & Prompts
**Version:** 1.0  
**Date:** November 2025

---

## 1. AI Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                          │
│  [Explain Button] [Chat Panel] [Analysis Request]           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI REQUEST ROUTER                         │
│  - Rate limiting check                                       │
│  - Context assembly                                          │
│  - Prompt selection                                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    PROMPT ENGINE                             │
│  - System prompts                                            │
│  - Dynamic context injection                                 │
│  - Response formatting                                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    OPENROUTER API                            │
│  Primary: Claude 3.5 Sonnet                                  │
│  Fallback: GPT-4o-mini                                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  RESPONSE PROCESSOR                          │
│  - Validation                                                │
│  - Safety check                                              │
│  - Token counting                                            │
│  - Caching                                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. OpenRouter Configuration

```typescript
// lib/api/openrouter.ts

import OpenAI from 'openai';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://deep-terminal.com',
    'X-Title': 'Deep Terminal',
  },
});

// Model configuration
export const AI_MODELS = {
  // Primary model for analysis (best quality)
  primary: 'anthropic/claude-3.5-sonnet',
  
  // Fast model for explanations (cost-effective)
  fast: 'anthropic/claude-3-haiku',
  
  // Fallback model
  fallback: 'openai/gpt-4o-mini',
} as const;

// Cost per 1M tokens (approximate)
export const MODEL_COSTS = {
  'anthropic/claude-3.5-sonnet': { input: 3.00, output: 15.00 },
  'anthropic/claude-3-haiku': { input: 0.25, output: 1.25 },
  'openai/gpt-4o-mini': { input: 0.15, output: 0.60 },
};

// Function to call OpenRouter
export async function callAI(params: {
  model?: keyof typeof AI_MODELS;
  systemPrompt: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}) {
  const model = AI_MODELS[params.model || 'fast'];
  
  const response = await openrouter.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: params.systemPrompt },
      { role: 'user', content: params.userMessage },
    ],
    temperature: params.temperature ?? 0.3,
    max_tokens: params.maxTokens ?? 1000,
    stream: params.stream ?? false,
  });
  
  return response;
}
```

---

## 3. System Prompts

### 3.1 Core AI Identity Prompt

```typescript
// lib/ai/prompts/system.ts

export const CORE_IDENTITY = `You are the AI Analyst for Deep Terminal, an educational financial analysis platform for retail investors learning about U.S. equities.

## YOUR ROLE
You are a knowledgeable financial educator and analyst who helps users understand:
- Financial metrics and how to interpret them
- How different economic indicators connect and affect stocks
- Professional-grade fundamental analysis frameworks
- Risk assessment and portfolio considerations

## CRITICAL RULES - NEVER VIOLATE
1. NEVER give specific buy, sell, or hold recommendations
2. NEVER provide price predictions or target prices
3. NEVER promise or imply potential returns
4. NEVER act as a financial advisor or fiduciary
5. ALWAYS remind users you provide education, not advice
6. ALWAYS encourage users to do their own research and consult professionals

## YOUR COMMUNICATION STYLE
- Clear and educational, avoiding unnecessary jargon
- When you must use financial terms, explain them briefly
- Structured and organized responses
- Professional but approachable tone
- Adapt complexity to user's knowledge level when known

## DISCLAIMER
End substantive responses with: "This is educational content only, not investment advice. Always do your own research and consult a financial advisor before making investment decisions."`;
```

### 3.2 Explain Metric Prompt

```typescript
// lib/ai/prompts/explain.ts

export const EXPLAIN_METRIC_PROMPT = `${CORE_IDENTITY}

## TASK
You are explaining a specific financial metric or concept to a user. Provide a clear, educational explanation.

## RESPONSE FORMAT
Structure your response in these sections:

**What it is:** A simple 1-2 sentence definition.

**Why it matters:** Explain the significance for investors (2-3 sentences).

**How to interpret it:** Practical guidance on reading this metric (2-4 sentences).

**Current context:** If specific values are provided, explain what they suggest in context.

**Related concepts:** List 2-3 related metrics or concepts to explore.

## GUIDELINES
- Keep explanations concise (150-300 words total)
- Use analogies when helpful
- Avoid implying that any value is "good" or "bad" in absolute terms
- Frame everything as context-dependent
- Never recommend actions based on metric values`;

export const EXPLAIN_CONCEPT_PROMPT = `${CORE_IDENTITY}

## TASK
You are explaining a financial concept, term, or market phenomenon.

## RESPONSE FORMAT
Structure your response:

**Definition:** Clear explanation in plain language.

**How it works:** The mechanics or process behind the concept.

**Why investors care:** Relevance to investment analysis.

**Example:** A concrete example to illustrate.

## GUIDELINES
- Assume the user is learning
- Build understanding from basics
- Connect to real-world implications
- Keep under 300 words`;
```

### 3.3 Stock Analysis Prompt

```typescript
// lib/ai/prompts/analysis.ts

export const STOCK_ANALYSIS_PROMPT = `${CORE_IDENTITY}

## TASK
You are generating a professional-grade fundamental analysis report for a U.S. stock. This should resemble the quality and structure of CFA-level analysis, but written accessibly for retail investors.

## STOCK DATA PROVIDED
You will receive current financial data for the stock including:
- Company profile and business description
- Price and valuation metrics
- Fundamental ratios (profitability, growth, health)
- Risk metrics
- Historical performance
- Sector and market context

## REPORT STRUCTURE

### Executive Summary (Required)
3-4 sentences capturing:
- What the company does
- Current financial position highlights
- Key considerations for analysis
- Overall risk/reward context (WITHOUT recommendations)

### Macro & Market Context (Optional)
- Current economic environment relevance
- Interest rate and inflation context
- How macro trends affect this sector/company

### Industry Position (Optional)
- Competitive landscape
- Market share and positioning
- Industry tailwinds and headwinds

### Business Quality (Optional)
- Business model analysis
- Competitive advantages (or lack thereof)
- Management quality indicators
- Growth drivers

### Financial Analysis (Required)
- Revenue and earnings trends
- Profitability metrics interpretation
- Balance sheet health
- Cash flow quality
- Working capital efficiency

### Valuation Context (Required)
- Current multiples vs historical
- Current multiples vs sector
- What the valuation implies about expectations
- NOTE: Never state if "overvalued" or "undervalued" - only describe the context

### Risk Assessment (Required)
- Key business risks
- Financial risks (leverage, liquidity)
- Market risks (volatility, correlation)
- Concentration risks

### Scenarios to Consider (Optional)
- Bull case factors (what could go right)
- Bear case factors (what could go wrong)
- Key metrics to watch

## CRITICAL GUIDELINES
1. Present analysis objectively - don't advocate for or against the stock
2. Use phrases like "investors might consider" not "you should"
3. Highlight both positives and negatives
4. Be specific with numbers and data when available
5. Explain the "so what" behind every data point
6. End with educational disclaimer

## LENGTH
- Summary analysis: 400-600 words
- Standard analysis: 800-1200 words
- Comprehensive analysis: 1500-2500 words`;
```

### 3.4 Chat Context Prompt

```typescript
// lib/ai/prompts/chat.ts

export const CHAT_PROMPT = `${CORE_IDENTITY}

## TASK
You are having a conversation with a user about financial markets, stocks, or investing concepts. Respond helpfully while staying within your educational role.

## CONTEXT
You may receive context about:
- Current page the user is viewing
- Stock symbol being analyzed
- Selected indicators or metrics
- User's knowledge level (if known)
- Previous messages in conversation

## GUIDELINES
1. Answer questions directly and clearly
2. If a question is outside your scope (specific advice, predictions), politely redirect to education
3. When referencing data, be specific about what it shows
4. Offer to explain concepts in more detail if user seems confused
5. Suggest related topics or follow-up questions when relevant
6. Keep responses focused - answer what was asked
7. For complex topics, break down into digestible parts

## RESPONSE LENGTH
- Simple questions: 50-150 words
- Explanations: 150-300 words
- Complex analysis: 300-500 words
- Always prefer concise over verbose

## WHEN YOU DON'T KNOW
If asked about real-time events or data you don't have:
"I don't have access to real-time data for that. Based on the data shown in Deep Terminal, [provide what you can]."`;
```

### 3.5 Personality-Aware Prompts

```typescript
// lib/ai/prompts/personality.ts

export const PERSONALITY_MODIFIERS = {
  cautious_saver: `
## USER PROFILE: Cautious Saver
This user prefers safety and capital preservation. When explaining:
- Emphasize risk factors and downside scenarios
- Highlight stability metrics (low debt, consistent dividends)
- Frame volatility in terms of potential capital loss
- Be extra clear about uncertainties`,

  steady_builder: `
## USER PROFILE: Steady Builder  
This user values balance and diversification. When explaining:
- Discuss both growth and stability aspects
- Connect metrics to long-term compounding
- Mention diversification considerations
- Balance opportunities with risks`,

  growth_hunter: `
## USER PROFILE: Growth Hunter
This user seeks high returns and accepts volatility. When explaining:
- Can dive deeper into growth metrics and trends
- Discuss competitive dynamics and market opportunity
- Still mention risks but in context of risk/reward
- Can use more advanced terminology`,

  strategic_analyst: `
## USER PROFILE: Strategic Analyst
This user is data-driven and enjoys research. When explaining:
- Provide more detailed numerical analysis
- Discuss methodologies and frameworks
- Can reference more advanced concepts
- Include more "why" behind the metrics`,

  trend_surfer: `
## USER PROFILE: Trend Surfer
This user follows momentum and market trends. When explaining:
- Include relevant price action context
- Discuss sentiment and flow indicators
- Connect fundamentals to price movements
- Keep education grounded despite shorter focus`,
};

export function getPersonalizedPrompt(
  basePrompt: string,
  personalityType?: PersonalityType
): string {
  if (!personalityType) return basePrompt;
  
  const modifier = PERSONALITY_MODIFIERS[personalityType];
  return `${basePrompt}\n\n${modifier}`;
}
```

---

## 4. Context Assembly

```typescript
// lib/ai/context.ts

interface AIContext {
  // Page context
  currentPage: string;
  symbol?: string;
  
  // Data context
  stockData?: {
    quote: StockQuote;
    fundamentals: StockFundamentals;
    riskMetrics: StockRiskMetrics;
  };
  marketData?: {
    indices: MarketIndex[];
    sectors: SectorPerformance[];
  };
  selectedIndicators?: string[];
  
  // User context
  userProfile?: {
    personalityType: PersonalityType;
    knowledgeScore: number;
    riskTolerance: RiskTolerance;
  };
  
  // Conversation context
  conversationHistory?: ChatMessage[];
}

export function assembleContext(context: AIContext): string {
  let contextString = '';
  
  // Add stock data if available
  if (context.stockData) {
    contextString += `\n## CURRENT STOCK DATA: ${context.symbol}\n`;
    contextString += formatStockData(context.stockData);
  }
  
  // Add market context if available
  if (context.marketData) {
    contextString += `\n## MARKET CONTEXT\n`;
    contextString += formatMarketData(context.marketData);
  }
  
  // Add selected indicators
  if (context.selectedIndicators?.length) {
    contextString += `\n## USER SELECTED INDICATORS\n`;
    contextString += context.selectedIndicators.join(', ');
  }
  
  // Add user level indicator
  if (context.userProfile) {
    const level = getKnowledgeLevel(context.userProfile.knowledgeScore);
    contextString += `\n## USER KNOWLEDGE LEVEL: ${level}\n`;
    contextString += `Adjust explanation complexity accordingly.`;
  }
  
  return contextString;
}

function formatStockData(data: AIContext['stockData']): string {
  if (!data) return '';
  
  return `
Price: $${data.quote.price} (${data.quote.changePercent > 0 ? '+' : ''}${data.quote.changePercent.toFixed(2)}%)
Market Cap: $${formatLargeNumber(data.quote.marketCap)}

Key Metrics:
- P/E Ratio: ${data.fundamentals.peRatio ?? 'N/A'}
- P/B Ratio: ${data.fundamentals.pbRatio ?? 'N/A'}
- Gross Margin: ${data.fundamentals.grossMargin ? (data.fundamentals.grossMargin * 100).toFixed(1) + '%' : 'N/A'}
- Net Margin: ${data.fundamentals.netMargin ? (data.fundamentals.netMargin * 100).toFixed(1) + '%' : 'N/A'}
- ROE: ${data.fundamentals.roe ? (data.fundamentals.roe * 100).toFixed(1) + '%' : 'N/A'}
- Debt/Equity: ${data.fundamentals.debtToEquity ?? 'N/A'}
- Revenue Growth YoY: ${data.fundamentals.revenueGrowthYoY ? (data.fundamentals.revenueGrowthYoY * 100).toFixed(1) + '%' : 'N/A'}

Risk Profile:
- Beta: ${data.riskMetrics.beta ?? 'N/A'}
- 30D Volatility: ${data.riskMetrics.volatility30D ? (data.riskMetrics.volatility30D * 100).toFixed(1) + '%' : 'N/A'}
- Risk Score: ${data.riskMetrics.overallRiskScore}/10 (${data.riskMetrics.riskLevel})
`;
}

function getKnowledgeLevel(score: number): string {
  if (score < 30) return 'Beginner';
  if (score < 60) return 'Intermediate';
  return 'Advanced';
}
```

---

## 5. Pre-Generated Responses

For common explanations, use cached responses to reduce AI costs:

```typescript
// lib/ai/cache/explanations.ts

export const METRIC_EXPLANATIONS: Record<string, ExplainResponse> = {
  'pe_ratio': {
    explanation: 'The P/E ratio measures how much investors pay for each dollar of company earnings.',
    whatItIs: 'Price-to-Earnings (P/E) ratio is calculated by dividing the stock price by earnings per share (EPS).',
    whyItMatters: 'It helps compare valuations across companies and indicates market expectations for future growth.',
    howToInterpret: 'A higher P/E suggests investors expect higher growth, while a lower P/E might indicate undervaluation or concerns. Compare to sector averages and historical values for context.',
    relatedConcepts: ['Forward P/E', 'PEG Ratio', 'Earnings Per Share'],
  },
  
  'market_cap': {
    explanation: 'Market capitalization represents the total value of a company\'s outstanding shares.',
    whatItIs: 'Market Cap = Stock Price × Number of Shares Outstanding',
    whyItMatters: 'It indicates company size, affects index inclusion, and influences investment characteristics like volatility and liquidity.',
    howToInterpret: 'Large-cap (>$10B) tends to be more stable. Mid-cap ($2-10B) offers growth potential. Small-cap (<$2B) can be more volatile but may offer higher growth.',
    relatedConcepts: ['Enterprise Value', 'Shares Outstanding', 'Float'],
  },
  
  // ... more pre-generated explanations
};

export async function getExplanation(
  metric: string,
  context?: ExplainContext
): Promise<ExplainResponse> {
  // Check cache first
  const cached = METRIC_EXPLANATIONS[metric.toLowerCase().replace(/\s+/g, '_')];
  
  if (cached && !context?.currentValue) {
    return cached;
  }
  
  // If context-specific, generate dynamically but use cached as base
  if (cached && context) {
    return enhanceWithContext(cached, context);
  }
  
  // Generate from AI if not cached
  return await generateExplanation(metric, context);
}
```

---

## 6. Rate Limiting & Usage Tracking

```typescript
// lib/ai/ratelimit.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Different limits for different tiers
export const AI_LIMITS = {
  free: {
    questionsPerDay: 5,
    analysisPerMonth: 3,
  },
  pro: {
    questionsPerDay: Infinity,
    analysisPerMonth: Infinity,
  },
};

// Rate limiter for AI requests
export const aiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute max
  analytics: true,
});

export async function checkAIUsage(
  userId: string,
  type: 'question' | 'analysis',
  plan: 'free' | 'pro'
): Promise<{ allowed: boolean; remaining: number; resetAt?: Date }> {
  const limit = plan === 'pro' 
    ? Infinity 
    : type === 'question' 
      ? AI_LIMITS.free.questionsPerDay
      : AI_LIMITS.free.analysisPerMonth;
  
  if (limit === Infinity) {
    return { allowed: true, remaining: Infinity };
  }
  
  const key = `ai:${type}:${userId}`;
  const ttl = type === 'question' ? 86400 : 2592000; // 1 day or 30 days
  
  const current = await redis.get<number>(key) || 0;
  
  if (current >= limit) {
    const ttlRemaining = await redis.ttl(key);
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(Date.now() + ttlRemaining * 1000),
    };
  }
  
  await redis.incr(key);
  await redis.expire(key, ttl);
  
  return {
    allowed: true,
    remaining: limit - current - 1,
  };
}

export async function trackTokenUsage(
  userId: string,
  model: string,
  inputTokens: number,
  outputTokens: number
): Promise<void> {
  const date = new Date().toISOString().split('T')[0];
  const key = `tokens:${userId}:${date}`;
  
  await redis.hincrby(key, `${model}:input`, inputTokens);
  await redis.hincrby(key, `${model}:output`, outputTokens);
  await redis.expire(key, 86400 * 90); // Keep 90 days
}
```

---

## 7. Streaming Implementation

```typescript
// lib/ai/stream.ts

import { OpenAIStream, StreamingTextResponse } from 'ai';

export async function streamAnalysis(
  symbol: string,
  context: AIContext,
  depth: 'summary' | 'standard' | 'comprehensive'
): Promise<StreamingTextResponse> {
  const systemPrompt = getPersonalizedPrompt(
    STOCK_ANALYSIS_PROMPT,
    context.userProfile?.personalityType
  );
  
  const userMessage = `
Generate a ${depth} analysis for ${symbol}.

${assembleContext(context)}

Please provide a professional-grade fundamental analysis following the structure in your instructions.
`;

  const response = await openrouter.chat.completions.create({
    model: AI_MODELS.primary,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: depth === 'comprehensive' ? 4000 : depth === 'standard' ? 2000 : 1000,
    stream: true,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

---

## 8. Safety & Content Filtering

```typescript
// lib/ai/safety.ts

// Patterns that indicate the AI might be giving advice
const ADVICE_PATTERNS = [
  /\byou should (buy|sell|hold)\b/i,
  /\bi recommend (buying|selling)\b/i,
  /\bthis is a (good|bad) (investment|buy)\b/i,
  /\bprice target\s*:?\s*\$?\d+/i,
  /\bwill (rise|fall|increase|decrease) to\b/i,
  /\bguaranteed (returns?|profit)\b/i,
];

export function validateAIResponse(response: string): {
  isValid: boolean;
  issues: string[];
  sanitized: string;
} {
  const issues: string[] = [];
  let sanitized = response;
  
  // Check for advice patterns
  for (const pattern of ADVICE_PATTERNS) {
    if (pattern.test(response)) {
      issues.push(`Contains potential advice: ${pattern.toString()}`);
    }
  }
  
  // Ensure disclaimer is present for substantive responses
  if (response.length > 500 && !response.includes('educational') && !response.includes('not investment advice')) {
    sanitized += '\n\n*This is educational content only, not investment advice.*';
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    sanitized,
  };
}

// Log and alert on violations
export async function reportSafetyIssue(
  userId: string,
  prompt: string,
  response: string,
  issues: string[]
): Promise<void> {
  console.warn('AI Safety Issue Detected', {
    userId,
    issues,
    promptPreview: prompt.slice(0, 100),
    responsePreview: response.slice(0, 200),
  });
  
  // In production, send to monitoring service
}
```

---

## 9. API Route Implementation

```typescript
// app/api/ai/explain/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { explainRequestSchema } from '@/lib/validations/ai';
import { getExplanation } from '@/lib/ai/cache/explanations';
import { checkAIUsage } from '@/lib/ai/ratelimit';
import { getUserPlan } from '@/lib/db/queries/user';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Please sign in' } },
        { status: 401 }
      );
    }

    // Parse and validate request
    const body = await req.json();
    const validated = explainRequestSchema.parse(body);

    // Check usage limits
    const plan = await getUserPlan(userId);
    const usage = await checkAIUsage(userId, 'question', plan);
    
    if (!usage.allowed) {
      return NextResponse.json(
        { 
          error: { 
            code: 'USAGE_LIMIT_EXCEEDED', 
            message: 'Daily question limit reached',
            details: { resetAt: usage.resetAt }
          } 
        },
        { status: 429 }
      );
    }

    // Get explanation (cached or generated)
    const explanation = await getExplanation(validated.target, validated.context);

    return NextResponse.json({
      ...explanation,
      remaining: usage.remaining,
    });

  } catch (error) {
    console.error('Explain API Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to generate explanation' } },
      { status: 500 }
    );
  }
}
```
