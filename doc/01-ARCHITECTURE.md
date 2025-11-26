# Deep - Technical Architecture Document
## Version 1.0 | November 2025

---

## 1. System Overview

Deep is an AI-powered financial education platform with three main surfaces:
- **Deep Terminal**: AI-enhanced market overview dashboard
- **Stock Dashboard**: Fundamental & risk metrics per stock
- **AI Analyst**: Professional-grade analysis engine

---

## 2. Tech Stack

### Frontend
```
Framework:       Next.js 14 (App Router)
Language:        TypeScript
Styling:         Tailwind CSS + shadcn/ui
State:           Zustand (global) + React Query (server)
Charts:          Recharts / TradingView Lightweight Charts
Real-time:       WebSocket (market data stream)
```

### Backend
```
Runtime:         Node.js 20 LTS
Framework:       Next.js API Routes + tRPC (optional)
Database:        PostgreSQL (Neon)
Cache:           Redis (Upstash)
Queue:           BullMQ (background jobs)
```

### AI Layer
```
Router:          OpenRouter API
Primary Model:   Claude 3.5 Sonnet (analysis)
Fallback:        GPT-4o-mini (simple explanations)
Embeddings:      text-embedding-3-small
Vector DB:       Neon pgvector
```

### Auth & Payments
```
Auth:            Clerk
Payments:        Stripe (Pro subscription)
```

### Data Sources
```
Market Data:     Yahoo Finance API (free tier)
Fundamentals:    Financial Modeling Prep / Finnhub
Macro Data:      FRED API
News:            Alpha Vantage News / Finnhub News
```

### Infrastructure
```
Hosting:         Vercel (frontend + API)
Database:        Neon (PostgreSQL + pgvector)
Cache:           Upstash Redis
CDN:             Vercel Edge
Monitoring:      Vercel Analytics + Sentry
```

---

## 3. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js)                         │
├─────────────────────────────────────────────────────────────────┤
│  Deep Terminal  │  Stock Dashboard  │  AI Chat Panel  │ Profile │
└────────┬────────────────┬───────────────────┬───────────────────┘
         │                │                   │
         ▼                ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API LAYER (Next.js API Routes)              │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  /api/market │ /api/stocks  │  /api/ai     │  /api/user         │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────────┘
       │              │              │                │
       ▼              ▼              ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Yahoo/FMP    │ │  PostgreSQL  │ │  OpenRouter  │ │    Clerk     │
│ Finnhub/FRED │ │    (Neon)    │ │  (AI Models) │ │   (Auth)     │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
                        │
                        ▼
                 ┌──────────────┐
                 │    Redis     │
                 │   (Cache)    │
                 └──────────────┘
```

---

## 4. Database Schema (Core Tables)

### Users & Profiles
```sql
-- users (managed by Clerk, we store extended data)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  deep_score INTEGER DEFAULT 0,
  personality_type TEXT,
  risk_tolerance TEXT,
  experience_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deep Score quiz responses
CREATE TABLE score_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  question_id TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Study Lists (Watchlists)
```sql
CREATE TABLE study_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  name TEXT DEFAULT 'My Study List',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE study_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES study_lists(id),
  symbol TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, symbol)
);
```

### AI Conversations
```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  context_type TEXT NOT NULL, -- 'terminal', 'stock', 'general'
  context_symbol TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_conversations(id),
  role TEXT NOT NULL, -- 'user', 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Stock Data Cache
```sql
CREATE TABLE stock_cache (
  symbol TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  data_type TEXT NOT NULL, -- 'quote', 'fundamentals', 'metrics'
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE macro_cache (
  indicator_id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. API Structure

### Market Data APIs
```
GET  /api/market/indices          → Major US indices
GET  /api/market/sectors          → Sector performance
GET  /api/market/macro            → Key macro indicators
GET  /api/market/news             → Market news feed
```

### Stock APIs
```
GET  /api/stocks/:symbol/quote    → Price, change, volume
GET  /api/stocks/:symbol/fundamentals → Full metrics (~150)
GET  /api/stocks/:symbol/risk     → Risk panel data
GET  /api/stocks/:symbol/chart    → Historical prices
POST /api/stocks/search           → Symbol search
```

### AI APIs
```
POST /api/ai/chat                 → General AI chat
POST /api/ai/explain              → Explain metric/indicator
POST /api/ai/analyze              → Full stock analysis
POST /api/ai/compare              → Multi-indicator reasoning
```

### User APIs
```
GET  /api/user/profile            → User profile + score
POST /api/user/score              → Submit quiz answers
GET  /api/user/study-list         → Get watchlist
POST /api/user/study-list         → Add to watchlist
DELETE /api/user/study-list/:id   → Remove from watchlist
```

---

## 6. Key Technical Decisions

### Caching Strategy
```
Redis TTLs:
- Stock quotes:     60 seconds
- Fundamentals:     1 hour
- Macro data:       15 minutes
- AI responses:     24 hours (for common questions)
- News:             5 minutes
```

### AI Cost Optimization
```
1. Cache common explanations (P/E ratio, etc.)
2. Use cheaper model for simple "what is" questions
3. Use Claude for complex analysis
4. Pre-generate top 50 stock analyses
5. Rate limit free tier (5 questions/day)
```

### Rate Limiting
```
Free tier:
- 5 AI questions per day
- 3 stocks in study list
- 10 stock searches per hour

Pro tier:
- Unlimited AI questions
- Unlimited study list
- 100 searches per hour
```

---

## 7. Security Considerations

```
1. All API routes protected by Clerk middleware
2. Rate limiting on all public endpoints
3. Input validation with Zod schemas
4. SQL injection prevention (Prisma/Drizzle ORM)
5. No storing of sensitive financial data
6. HTTPS only, secure cookies
7. CSP headers configured
```

---

## 8. Environment Variables

```env
# Database
DATABASE_URL=
DIRECT_URL=

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# AI
OPENROUTER_API_KEY=

# Market Data
YAHOO_FINANCE_API_KEY=
FMP_API_KEY=
FINNHUB_API_KEY=
FRED_API_KEY=

# Cache
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## 9. Folder Structure

```
deep/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (sign-in, sign-up)
│   │   ├── (dashboard)/        # Protected routes
│   │   │   ├── terminal/       # Deep Terminal
│   │   │   ├── stock/[symbol]/ # Stock Dashboard
│   │   │   ├── profile/        # User profile
│   │   │   └── score/          # Deep Score quiz
│   │   ├── api/                # API routes
│   │   │   ├── market/
│   │   │   ├── stocks/
│   │   │   ├── ai/
│   │   │   └── user/
│   │   ├── layout.tsx
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── ui/                 # shadcn components
│   │   ├── terminal/           # Terminal components
│   │   ├── stock/              # Stock dashboard components
│   │   ├── ai/                 # AI chat components
│   │   └── shared/             # Shared components
│   ├── lib/
│   │   ├── api/                # API client functions
│   │   ├── db/                 # Database utilities
│   │   ├── ai/                 # AI prompt templates
│   │   ├── market/             # Market data utilities
│   │   └── utils/              # General utilities
│   ├── stores/                 # Zustand stores
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript types
│   └── constants/              # App constants
├── prisma/                     # Prisma schema
├── public/                     # Static assets
└── docs/                       # Documentation
```
