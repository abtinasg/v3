# Deep In - Data Sources & Metrics

## Supported Assets

| Type | Examples | Supported |
|------|----------|-----------|
| US Stocks | AAPL, MSFT, GOOGL | ✅ |
| ETFs | SPY, QQQ, VTI, VOO | ✅ |
| Crypto | BTC, ETH | ❌ (v2) |
| International | TSM, BABA | ❌ (v2) |

### ETF-Specific Metrics
| Metric | Description |
|--------|-------------|
| Expense Ratio | Annual fee (lower = better) |
| AUM | Assets Under Management |
| Holdings Count | Number of stocks in ETF |
| Top Holdings | Largest positions |
| Dividend Yield | Distribution yield |
| Tracking Error | vs benchmark |

---

## Data Providers

### 1. Yahoo Finance (yfinance)
- **Use for:** Historical prices, fundamentals, financials
- **Cost:** Free (unofficial API)
- **Limit:** ~2000 requests/hour
- **Data:** Price, volume, dividends, splits, income statement, balance sheet

### 2. Finnhub
- **Use for:** Real-time quotes, news, basic fundamentals
- **Cost:** Free tier = 60 calls/min
- **Data:** Quote, company profile, news, basic metrics

### 3. Alpha Vantage
- **Use for:** Backup data source, technical indicators
- **Cost:** Free tier = 5 calls/min
- **Data:** Time series, technical indicators

### 4. Financial Modeling Prep (FMP)
- **Use for:** Detailed financials, ratios
- **Cost:** Free tier = 250 calls/day
- **Data:** Financial statements, ratios, DCF

### 5. FRED (Federal Reserve Economic Data) 🆕
- **Use for:** Macroeconomic data
- **Cost:** Free (API key required)
- **Limit:** 120 requests/min
- **Data:** GDP, CPI, interest rates, unemployment, etc.
- **API:** https://fred.stlouisfed.org/docs/api/

---

## Data Source Matrix

| Metric Category | Primary Source | Fallback | Calculated |
|-----------------|---------------|----------|------------|
| Price/Quote | Finnhub | Yahoo | - |
| Financials | Yahoo | FMP | - |
| Fundamentals | Yahoo | FMP | - |
| Macro/Economy | FRED | - | - |
| Industry | FMP | - | Backend |
| Ratios | Yahoo | - | Backend |
| Valuation | Yahoo | - | Backend |
| Risk | Yahoo | - | Backend |
| Scores | - | - | Backend |

---

## All Metrics (170+)

### 🌍 Macro / Economic (از FRED)
| Metric | FRED Series | Source |
|--------|-------------|--------|
| GDP Growth Rate | A191RL1Q225SBEA | FRED |
| Real GDP | GDPC1 | FRED |
| Nominal GDP | GDP | FRED |
| GDP per Capita | A939RX0Q048SBEA | FRED |
| CPI (Consumer Price Index) | CPIAUCSL | FRED |
| PPI (Producer Price Index) | PPIACO | FRED |
| Core Inflation | CPILFESL | FRED |
| Federal Funds Rate | FEDFUNDS | FRED |
| 10-Year Treasury | DGS10 | FRED |
| Exchange Rate (USD Index) | DTWEXBGS | FRED |
| Unemployment Rate | UNRATE | FRED |
| Wage Growth | CES0500000003 | FRED |
| Labor Productivity | OPHNFB | FRED |
| Consumer Confidence | UMCSENT | FRED |
| Business Confidence | BSCICP03USM665S | FRED |

### 🏭 Industry
| Metric | Source | Calculation |
|--------|--------|-------------|
| Industry Growth Rate | FMP | API |
| Market Size | FMP | API |
| Market Share | Backend | Revenue / Industry Revenue |
| HHI Index | Backend | Σ(market share²) × 10000 |
| CR4 (Top 4 Concentration) | Backend | Sum of top 4 market shares |

### 💧 Liquidity Ratios
| Metric | Source | Formula |
|--------|--------|---------|
| Current Ratio | Yahoo | Current Assets / Current Liabilities |
| Quick Ratio | Backend | (CA - Inventory) / CL |
| Cash Ratio | Backend | Cash / Current Liabilities |
| Days Sales Outstanding | Backend | (Receivables / Revenue) × 365 |
| Days Inventory Outstanding | Backend | (Inventory / COGS) × 365 |
| Days Payables Outstanding | Backend | (Payables / COGS) × 365 |
| Cash Conversion Cycle | Backend | DSO + DIO - DPO |

### 🧱 Leverage / Solvency
| Metric | Source | Formula |
|--------|--------|---------|
| Debt-to-Assets | Backend | Total Debt / Total Assets |
| Debt-to-Equity | Yahoo | Total Debt / Equity |
| Financial Debt-to-Equity | Backend | Financial Debt / Equity |
| Interest Coverage | Backend | EBIT / Interest Expense |
| Debt Service Coverage (DSCR) | Backend | NOI / Debt Service |
| Equity Multiplier | Backend | Assets / Equity |
| Debt-to-EBITDA | Backend | Debt / EBITDA |

### ⚙️ Activity / Efficiency
| Metric | Source | Formula |
|--------|--------|---------|
| Total Asset Turnover | Backend | Revenue / Total Assets |
| Fixed Asset Turnover | Backend | Revenue / Fixed Assets |
| Inventory Turnover | Backend | COGS / Inventory |
| Receivables Turnover | Backend | Revenue / Receivables |
| Payables Turnover | Backend | COGS / Payables |
| Working Capital Turnover | Backend | Revenue / Working Capital |

### 💰 Profitability
| Metric | Source | Formula |
|--------|--------|---------|
| Gross Profit Margin | Yahoo | Gross Profit / Revenue |
| Operating Profit Margin | Yahoo | Operating Income / Revenue |
| EBITDA Margin | Backend | EBITDA / Revenue |
| Net Profit Margin | Yahoo | Net Income / Revenue |
| ROA | Yahoo | Net Income / Assets |
| ROE | Yahoo | Net Income / Equity |
| ROIC | Backend | NOPLAT / Invested Capital |
| NOPLAT | Backend | EBIT × (1 - Tax Rate) |

### 📈 DuPont Analysis
| Metric | Source | Formula |
|--------|--------|---------|
| Net Profit Margin | Yahoo | Net Income / Revenue |
| Asset Turnover | Backend | Revenue / Assets |
| Equity Multiplier | Backend | Assets / Equity |
| ROE (DuPont) | Backend | NPM × AT × EM |
| Operating Margin | Yahoo | Operating Income / Revenue |
| Interest Burden | Backend | EBT / EBIT |
| Tax Burden | Backend | Net Income / EBT |

### 📈 Growth Metrics
| Metric | Source | Formula |
|--------|--------|---------|
| Revenue Growth YoY | Yahoo | (Rev₁ - Rev₀) / Rev₀ |
| EPS Growth YoY | Yahoo | (EPS₁ - EPS₀) / EPS₀ |
| DPS Growth | Backend | (DPS₁ - DPS₀) / DPS₀ |
| FCF Growth | Backend | (FCF₁ - FCF₀) / FCF₀ |
| 3Y Revenue CAGR | Backend | (Rev₃/Rev₀)^(1/3) - 1 |
| 5Y Revenue CAGR | Backend | (Rev₅/Rev₀)^(1/5) - 1 |
| Sustainable Growth Rate | Backend | ROE × Retention Ratio |
| Retention Ratio | Backend | 1 - Payout Ratio |
| Payout Ratio | Yahoo | Dividends / Net Income |

### 💵 Cash Flow
| Metric | Source | Formula |
|--------|--------|---------|
| Operating Cash Flow | Yahoo | From Cash Flow Statement |
| Investing Cash Flow | Yahoo | From Cash Flow Statement |
| Financing Cash Flow | Yahoo | From Cash Flow Statement |
| Free Cash Flow (FCF) | Yahoo | OCF - CapEx |
| FCFF | Backend | EBIT(1-t) + D&A - CapEx - ΔNWC |
| FCFE | Backend | FCFF - Interest(1-t) + Net Borrowing |
| Cash Flow Adequacy | Backend | OCF / (CapEx + Debt + Dividends) |
| Cash Reinvestment Ratio | Backend | (CapEx - D&A) / OCF |

### 📊 Valuation
| Metric | Source | Formula |
|--------|--------|---------|
| P/E Ratio | Yahoo | Price / EPS |
| Forward P/E | Yahoo | Price / Forward EPS |
| Justified P/E | Backend | (1 - b) / (r - g) |
| P/B Ratio | Yahoo | Price / Book Value |
| Justified P/B | Backend | (ROE - g) / (r - g) |
| P/S Ratio | Yahoo | Price / Sales per Share |
| P/CF Ratio | Backend | Price / Cash Flow per Share |
| EV | Backend | Market Cap + Debt - Cash |
| EV/EBITDA | Yahoo | EV / EBITDA |
| EV/Sales | Backend | EV / Revenue |
| EV/EBIT | Backend | EV / EBIT |
| Dividend Yield | Yahoo | DPS / Price |
| PEG Ratio | Yahoo | P/E / Growth Rate |

### 🎯 Intrinsic Value (DCF)
| Metric | Source | Formula |
|--------|--------|---------|
| Risk-Free Rate | FRED | 10-Year Treasury |
| Market Risk Premium | Backend | E(Rm) - Rf |
| Beta | Yahoo | Covariance / Variance |
| Cost of Equity (Re) | Backend | Rf + β(Rm - Rf) |
| Cost of Debt (Rd) | Backend | Interest / Debt |
| WACC | Backend | (E/V)Re + (D/V)Rd(1-t) |
| Terminal Value | Backend | FCF(1+g) / (WACC-g) |
| Intrinsic Value | Backend | DCF Model |
| Target Price | Yahoo | Analyst Target |
| Upside/Downside % | Backend | (Target - Price) / Price |

### 📉 Risk Metrics
| Metric | Source | Formula |
|--------|--------|---------|
| Beta | Yahoo | vs S&P 500 |
| Standard Deviation | Backend | σ of returns |
| Alpha | Backend | Actual - Expected Return |
| Sharpe Ratio | Backend | (Return - Rf) / σ |
| Sortino Ratio | Backend | (Return - Rf) / Downside σ |
| Max Drawdown | Backend | Peak to trough decline |
| VaR (95%) | Backend | Value at Risk |

### 📊 Technical Indicators
| Metric | Source | Formula |
|--------|--------|---------|
| RSI | Backend | Relative Strength Index |
| MACD | Backend | 12 EMA - 26 EMA |
| MACD Signal | Backend | 9 EMA of MACD |
| 50 Day MA | Yahoo | Moving Average |
| 200 Day MA | Yahoo | Moving Average |
| Bollinger Bands | Backend | MA ± 2σ |
| Trading Volume | Yahoo | Daily Volume |
| Relative Volume | Backend | Volume / Avg Volume |

### 🧮 Scoring (Backend Calculated)
| Metric | Formula | Range |
|--------|---------|-------|
| Profitability Score | Weighted avg of margins, ROE, ROIC | 0-100 |
| Growth Score | Weighted avg of growth rates | 0-100 |
| Valuation Score | Inverse of P/E, P/B vs sector | 0-100 |
| Risk Score | Inverse of beta, volatility | 0-100 |
| Health Score | Liquidity + Solvency ratios | 0-100 |
| **Total Score** | Weighted average | 0-100 |

### 🧾 Other Key Metrics
| Metric | Source | Formula |
|--------|--------|---------|
| Effective Tax Rate | Backend | Tax / EBT |
| Working Capital | Backend | CA - CL |
| Book Value per Share | Yahoo | Equity / Shares |
| Sales per Share | Backend | Revenue / Shares |
| Cash Flow per Share | Backend | OCF / Shares |
| DOL (Operating Leverage) | Backend | % EBIT / % Sales |
| DFL (Financial Leverage) | Backend | % EPS / % EBIT |
| Altman Z-Score | Backend | Bankruptcy predictor |
| Piotroski F-Score | Backend | 0-9 financial strength |
| Excess ROIC | Backend | ROIC - Industry ROIC |
| Peer Rank | Backend | Rank in sector |

---

## FRED API Integration

### Setup
```typescript
// lib/data-providers/fred.ts
const FRED_API_KEY = process.env.FRED_API_KEY;
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

export async function getFredSeries(seriesId: string) {
  const url = `${FRED_BASE_URL}/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json`;
  const res = await fetch(url);
  return res.json();
}
```

### Key Series IDs
```typescript
const FRED_SERIES = {
  GDP_GROWTH: 'A191RL1Q225SBEA',
  REAL_GDP: 'GDPC1',
  CPI: 'CPIAUCSL',
  CORE_CPI: 'CPILFESL',
  FED_FUNDS: 'FEDFUNDS',
  TREASURY_10Y: 'DGS10',
  UNEMPLOYMENT: 'UNRATE',
  CONSUMER_SENTIMENT: 'UMCSENT',
};
```

### Caching Strategy
| Data Type | TTL | Reason |
|-----------|-----|--------|
| GDP | 24h | Quarterly updates |
| CPI | 24h | Monthly updates |
| Interest Rates | 1h | Daily updates |
| Unemployment | 24h | Monthly updates |

---

## Backend Calculation Engine

### Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    API Request                          │
│                   /api/stock/AAPL                       │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  Data Fetcher                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │  Yahoo  │  │ Finnhub │  │   FMP   │  │  FRED   │   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │
└───────┼────────────┼────────────┼────────────┼─────────┘
        │            │            │            │
┌───────▼────────────▼────────────▼────────────▼─────────┐
│                 Raw Data Store                          │
│         (Redis Cache + PostgreSQL)                      │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              Metrics Calculator                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  • Liquidity Ratios    • Profitability           │  │
│  │  • Leverage Ratios     • Growth Metrics          │  │
│  │  • Efficiency Ratios   • Valuation               │  │
│  │  • DCF Model           • Risk Metrics            │  │
│  │  • Scoring Engine      • Technical Indicators    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  API Response                           │
│              (Structured Metrics)                       │
└─────────────────────────────────────────────────────────┘
```

### Calculator Structure
```typescript
// lib/metrics/calculator.ts

export class MetricsCalculator {
  private rawData: RawFinancialData;
  private macroData: MacroData;
  
  constructor(rawData: RawFinancialData, macroData: MacroData) {
    this.rawData = rawData;
    this.macroData = macroData;
  }

  // Liquidity
  currentRatio() { return this.rawData.currentAssets / this.rawData.currentLiabilities; }
  quickRatio() { return (this.rawData.currentAssets - this.rawData.inventory) / this.rawData.currentLiabilities; }
  
  // Profitability
  roic() { return this.noplat() / this.investedCapital(); }
  noplat() { return this.rawData.ebit * (1 - this.effectiveTaxRate()); }
  
  // Valuation
  wacc() {
    const re = this.costOfEquity();
    const rd = this.costOfDebt();
    const e = this.rawData.marketCap;
    const d = this.rawData.totalDebt;
    const v = e + d;
    const t = this.effectiveTaxRate();
    return (e/v) * re + (d/v) * rd * (1 - t);
  }
  
  costOfEquity() {
    const rf = this.macroData.treasury10Y;
    const beta = this.rawData.beta;
    const mrp = 0.05; // Market risk premium
    return rf + beta * mrp;
  }
  
  // Scoring
  calculateScores() {
    return {
      profitability: this.profitabilityScore(),
      growth: this.growthScore(),
      valuation: this.valuationScore(),
      risk: this.riskScore(),
      health: this.healthScore(),
      total: this.totalScore(),
    };
  }
}
```

## Data Fetching Strategy

### On Page Load:
1. Check Redis cache (TTL: 5 min for quotes, 1 hour for fundamentals)
2. If miss, fetch from primary source
3. Run metrics calculator
4. Store in cache
5. Return to client

### Real-time Updates:
- WebSocket connection to Finnhub for price
- Update every 5 seconds during market hours
- Show "delayed" badge outside market hours

### Batch Processing:
- Nightly job to update all stock fundamentals
- Nightly job to fetch FRED macro data
- Store in PostgreSQL
- Pre-calculate all metrics
- Reduce API calls during day

### FRED Data Refresh
| Data | Frequency | Schedule |
|------|-----------|----------|
| GDP | Quarterly | After BEA release |
| CPI | Monthly | After BLS release |
| Fed Funds | Daily | Every morning |
| Unemployment | Monthly | First Friday |
