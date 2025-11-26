import type { FundamentalMetrics, SubscriptionTier } from '@/types';
import { get, set } from '@/lib/redis';

// =============================================================================
// CONSTANTS
// =============================================================================

const FMP_API_KEY = process.env.FMP_API_KEY;
const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';

// Cache configuration
const FUNDAMENTALS_CACHE_TTL = 3600; // 1 hour
const FUNDAMENTALS_CACHE_PREFIX = 'fundamentals:';

// =============================================================================
// TYPES
// =============================================================================

interface FMPProfile {
  symbol: string;
  mktCap?: number;
  // Additional profile fields if needed
}

interface FMPRatios {
  peRatioTTM?: number;
  pegRatioTTM?: number;
  priceToBookRatioTTM?: number;
  priceToSalesRatioTTM?: number;
  enterpriseValueOverEBITDATTM?: number;
  enterpriseValueOverRevenueTTM?: number;
  priceToFreeCashFlowsRatioTTM?: number;
  dividendYielPercentageTTM?: number;
  dividendYieldTTM?: number;
  payoutRatioTTM?: number;
  grossProfitMarginTTM?: number;
  operatingProfitMarginTTM?: number;
  netProfitMarginTTM?: number;
  returnOnAssetsTTM?: number;
  returnOnEquityTTM?: number;
  returnOnCapitalEmployedTTM?: number;
  debtRatioTTM?: number;
  debtEquityRatioTTM?: number;
  currentRatioTTM?: number;
  quickRatioTTM?: number;
  cashRatioTTM?: number;
  inventoryTurnoverTTM?: number;
  receivablesTurnoverTTM?: number;
  payablesTurnoverTTM?: number;
  assetTurnoverTTM?: number;
  interestCoverageTTM?: number;
  daysOfInventoryOutstandingTTM?: number;
  daysOfSalesOutstandingTTM?: number;
  daysOfPayablesOutstandingTTM?: number;
  operatingCycleTTM?: number;
  cashConversionCycleTTM?: number;
  freeCashFlowPerShareTTM?: number;
  bookValuePerShareTTM?: number;
  tangibleBookValuePerShareTTM?: number;
  revenuePerShareTTM?: number;
  priceEarningsRatioTTM?: number;
}

interface FMPIncomeStatement {
  date: string;
  symbol: string;
  reportedCurrency: string;
  calendarYear: string;
  period: string;
  revenue?: number;
  costOfRevenue?: number;
  grossProfit?: number;
  grossProfitRatio?: number;
  researchAndDevelopmentExpenses?: number;
  generalAndAdministrativeExpenses?: number;
  sellingAndMarketingExpenses?: number;
  sellingGeneralAndAdministrativeExpenses?: number;
  otherExpenses?: number;
  operatingExpenses?: number;
  costAndExpenses?: number;
  interestIncome?: number;
  interestExpense?: number;
  depreciationAndAmortization?: number;
  ebitda?: number;
  ebitdaratio?: number;
  operatingIncome?: number;
  operatingIncomeRatio?: number;
  totalOtherIncomeExpensesNet?: number;
  incomeBeforeTax?: number;
  incomeBeforeTaxRatio?: number;
  incomeTaxExpense?: number;
  netIncome?: number;
  netIncomeRatio?: number;
  eps?: number;
  epsdiluted?: number;
  weightedAverageShsOut?: number;
  weightedAverageShsOutDil?: number;
}

interface FMPBalanceSheet {
  date: string;
  symbol: string;
  reportedCurrency: string;
  calendarYear: string;
  period: string;
  cashAndCashEquivalents?: number;
  shortTermInvestments?: number;
  cashAndShortTermInvestments?: number;
  netReceivables?: number;
  inventory?: number;
  otherCurrentAssets?: number;
  totalCurrentAssets?: number;
  propertyPlantEquipmentNet?: number;
  goodwill?: number;
  intangibleAssets?: number;
  goodwillAndIntangibleAssets?: number;
  longTermInvestments?: number;
  taxAssets?: number;
  otherNonCurrentAssets?: number;
  totalNonCurrentAssets?: number;
  otherAssets?: number;
  totalAssets?: number;
  accountPayables?: number;
  shortTermDebt?: number;
  taxPayables?: number;
  deferredRevenue?: number;
  otherCurrentLiabilities?: number;
  totalCurrentLiabilities?: number;
  longTermDebt?: number;
  deferredRevenueNonCurrent?: number;
  deferredTaxLiabilitiesNonCurrent?: number;
  otherNonCurrentLiabilities?: number;
  totalNonCurrentLiabilities?: number;
  otherLiabilities?: number;
  capitalLeaseObligations?: number;
  totalLiabilities?: number;
  preferredStock?: number;
  commonStock?: number;
  retainedEarnings?: number;
  accumulatedOtherComprehensiveIncomeLoss?: number;
  othertotalStockholdersEquity?: number;
  totalStockholdersEquity?: number;
  totalEquity?: number;
  totalLiabilitiesAndStockholdersEquity?: number;
  minorityInterest?: number;
  totalLiabilitiesAndTotalEquity?: number;
  totalInvestments?: number;
  totalDebt?: number;
  netDebt?: number;
}

interface FMPCashFlow {
  date: string;
  symbol: string;
  reportedCurrency: string;
  calendarYear: string;
  period: string;
  netIncome?: number;
  depreciationAndAmortization?: number;
  deferredIncomeTax?: number;
  stockBasedCompensation?: number;
  changeInWorkingCapital?: number;
  accountsReceivables?: number;
  inventory?: number;
  accountsPayables?: number;
  otherWorkingCapital?: number;
  otherNonCashItems?: number;
  netCashProvidedByOperatingActivities?: number;
  investmentsInPropertyPlantAndEquipment?: number;
  acquisitionsNet?: number;
  purchasesOfInvestments?: number;
  salesMaturitiesOfInvestments?: number;
  otherInvestingActivites?: number;
  netCashUsedForInvestingActivites?: number;
  debtRepayment?: number;
  commonStockIssued?: number;
  commonStockRepurchased?: number;
  dividendsPaid?: number;
  otherFinancingActivites?: number;
  netCashUsedProvidedByFinancingActivities?: number;
  effectOfForexChangesOnCash?: number;
  netChangeInCash?: number;
  cashAtEndOfPeriod?: number;
  cashAtBeginningOfPeriod?: number;
  operatingCashFlow?: number;
  capitalExpenditure?: number;
  freeCashFlow?: number;
}

interface FMPGrowth {
  date: string;
  symbol: string;
  revenueGrowth?: number;
  grossProfitGrowth?: number;
  ebitgrowth?: number;
  operatingIncomeGrowth?: number;
  netIncomeGrowth?: number;
  epsgrowth?: number;
  epsdilutedGrowth?: number;
  weightedAverageSharesGrowth?: number;
  weightedAverageSharesDilutedGrowth?: number;
  dividendsperShareGrowth?: number;
  operatingCashFlowGrowth?: number;
  freeCashFlowGrowth?: number;
  tenYRevenueGrowthPerShare?: number;
  fiveYRevenueGrowthPerShare?: number;
  threeYRevenueGrowthPerShare?: number;
  tenYOperatingCFGrowthPerShare?: number;
  fiveYOperatingCFGrowthPerShare?: number;
  threeYOperatingCFGrowthPerShare?: number;
  tenYNetIncomeGrowthPerShare?: number;
  fiveYNetIncomeGrowthPerShare?: number;
  threeYNetIncomeGrowthPerShare?: number;
  tenYShareholdersEquityGrowthPerShare?: number;
  fiveYShareholdersEquityGrowthPerShare?: number;
  threeYShareholdersEquityGrowthPerShare?: number;
  tenYDividendperShareGrowthPerShare?: number;
  fiveYDividendperShareGrowthPerShare?: number;
  threeYDividendperShareGrowthPerShare?: number;
}

interface FMPKeyMetrics {
  symbol: string;
  date: string;
  period: string;
  revenuePerShare?: number;
  netIncomePerShare?: number;
  operatingCashFlowPerShare?: number;
  freeCashFlowPerShare?: number;
  cashPerShare?: number;
  bookValuePerShare?: number;
  tangibleBookValuePerShare?: number;
  shareholdersEquityPerShare?: number;
  interestDebtPerShare?: number;
  marketCap?: number;
  enterpriseValue?: number;
  peRatio?: number;
  priceToSalesRatio?: number;
  pocfratio?: number;
  pfcfRatio?: number;
  pbRatio?: number;
  ptbRatio?: number;
  evToSales?: number;
  enterpriseValueOverEBITDA?: number;
  evToOperatingCashFlow?: number;
  evToFreeCashFlow?: number;
  earningsYield?: number;
  freeCashFlowYield?: number;
  debtToEquity?: number;
  debtToAssets?: number;
  netDebtToEBITDA?: number;
  currentRatio?: number;
  interestCoverage?: number;
  incomeQuality?: number;
  dividendYield?: number;
  payoutRatio?: number;
  salesGeneralAndAdministrativeToRevenue?: number;
  researchAndDevelopementToRevenue?: number;
  intangiblesToTotalAssets?: number;
  capexToOperatingCashFlow?: number;
  capexToRevenue?: number;
  capexToDepreciation?: number;
  stockBasedCompensationToRevenue?: number;
  grahamNumber?: number;
  roic?: number;
  returnOnTangibleAssets?: number;
  grahamNetNet?: number;
  workingCapital?: number;
  tangibleAssetValue?: number;
  netCurrentAssetValue?: number;
  investedCapital?: number;
  averageReceivables?: number;
  averagePayables?: number;
  averageInventory?: number;
  daysSalesOutstanding?: number;
  daysPayablesOutstanding?: number;
  daysOfInventoryOnHand?: number;
  receivablesTurnover?: number;
  payablesTurnover?: number;
  inventoryTurnover?: number;
  roe?: number;
  capexPerShare?: number;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Fetch data from Financial Modeling Prep API
 */
async function fetchFMP<T>(endpoint: string): Promise<T | null> {
  if (!FMP_API_KEY) {
    console.warn('FMP_API_KEY not set. Fundamentals service disabled.');
    return null;
  }

  try {
    const url = `${FMP_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${FMP_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`FMP API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('FMP fetch error:', error);
    return null;
  }
}

/**
 * Create empty FundamentalMetrics structure with null values
 */
function createEmptyMetrics(symbol: string): FundamentalMetrics {
  return {
    symbol,
    valuation: {
      peRatio: null,
      forwardPE: null,
      pegRatio: null,
      pbRatio: null,
      psRatio: null,
      evToEbitda: null,
      evToRevenue: null,
      evToFcf: null,
      priceToFcf: null,
      enterpriseValue: null,
    },
    profitability: {
      grossMargin: null,
      operatingMargin: null,
      ebitdaMargin: null,
      netMargin: null,
      roe: null,
      roa: null,
      roic: null,
      roce: null,
    },
    growth: {
      revenueGrowthYoy: null,
      revenueGrowth3Y: null,
      revenueGrowth5Y: null,
      revenueGrowthQoQ: null,
      epsGrowthYoy: null,
      epsGrowth3Y: null,
      epsGrowth5Y: null,
      epsGrowthQoQ: null,
      fcfGrowthYoy: null,
      fcfGrowth3Y: null,
    },
    incomeStatement: {
      revenue: null,
      costOfRevenue: null,
      grossProfit: null,
      operatingExpenses: null,
      researchAndDevelopment: null,
      sellingGeneralAdmin: null,
      operatingIncome: null,
      ebitda: null,
      interestExpense: null,
      taxExpense: null,
      netIncome: null,
      eps: null,
      epsDiluted: null,
    },
    balanceSheet: {
      totalAssets: null,
      totalLiabilities: null,
      totalEquity: null,
      cash: null,
      shortTermInvestments: null,
      cashAndEquivalents: null,
      accountsReceivable: null,
      inventory: null,
      currentAssets: null,
      propertyPlantEquipment: null,
      goodwill: null,
      intangibleAssets: null,
      accountsPayable: null,
      shortTermDebt: null,
      currentLiabilities: null,
      longTermDebt: null,
      totalDebt: null,
      netDebt: null,
      retainedEarnings: null,
    },
    cashFlow: {
      operatingCashFlow: null,
      capitalExpenditures: null,
      freeCashFlow: null,
      dividendsPaid: null,
      shareRepurchases: null,
      acquisitions: null,
      investingCashFlow: null,
      financingCashFlow: null,
      netChangeInCash: null,
    },
    leverage: {
      debtToEquity: null,
      debtToAssets: null,
      debtToEbitda: null,
      netDebtToEbitda: null,
      interestCoverage: null,
      currentRatio: null,
      quickRatio: null,
      cashRatio: null,
    },
    efficiency: {
      assetTurnover: null,
      inventoryTurnover: null,
      receivablesTurnover: null,
      payablesTurnover: null,
      daysInventory: null,
      daysReceivables: null,
      daysPayables: null,
      cashConversionCycle: null,
    },
    perShare: {
      bookValue: null,
      tangibleBookValue: null,
      revenuePerShare: null,
      fcfPerShare: null,
      dividend: null,
      dividendYield: null,
      payoutRatio: null,
    },
    fiscalYear: new Date().getFullYear(),
    fiscalQuarter: Math.ceil((new Date().getMonth() + 1) / 3),
    lastUpdated: new Date(),
  };
}

/**
 * Map FMP data to FREE tier metrics (20 key metrics)
 */
function mapToFreeMetrics(
  symbol: string,
  ratios: FMPRatios | null,
  income: FMPIncomeStatement | null,
  balance: FMPBalanceSheet | null,
  keyMetrics: FMPKeyMetrics | null
): FundamentalMetrics {
  const metrics = createEmptyMetrics(symbol);

  // Valuation (5 metrics)
  if (ratios || keyMetrics) {
    metrics.valuation.peRatio = ratios?.peRatioTTM ?? keyMetrics?.peRatio ?? null;
    metrics.valuation.pbRatio = ratios?.priceToBookRatioTTM ?? keyMetrics?.pbRatio ?? null;
    metrics.valuation.psRatio = ratios?.priceToSalesRatioTTM ?? keyMetrics?.priceToSalesRatio ?? null;
    metrics.valuation.evToEbitda = ratios?.enterpriseValueOverEBITDATTM ?? keyMetrics?.enterpriseValueOverEBITDA ?? null;
  }

  // Profitability (5 metrics)
  if (ratios || income) {
    metrics.profitability.grossMargin = ratios?.grossProfitMarginTTM ?? income?.grossProfitRatio ?? null;
    metrics.profitability.operatingMargin = ratios?.operatingProfitMarginTTM ?? income?.operatingIncomeRatio ?? null;
    metrics.profitability.netMargin = ratios?.netProfitMarginTTM ?? income?.netIncomeRatio ?? null;
    metrics.profitability.roe = ratios?.returnOnEquityTTM ?? keyMetrics?.roe ?? null;
    metrics.profitability.roa = ratios?.returnOnAssetsTTM ?? null;
  }

  // Growth (2 metrics) - Only YoY for free tier
  // Note: Growth data requires multiple API calls in FMP, simplified here
  metrics.growth.revenueGrowthYoy = null; // Would need historical data
  metrics.growth.epsGrowthYoy = null; // Would need historical data

  // Income Statement (3 metrics)
  if (income) {
    metrics.incomeStatement.revenue = income.revenue ?? null;
    metrics.incomeStatement.netIncome = income.netIncome ?? null;
    metrics.incomeStatement.eps = income.eps ?? null;
  }

  // Balance Sheet (3 metrics)
  if (balance) {
    metrics.balanceSheet.totalAssets = balance.totalAssets ?? null;
    metrics.balanceSheet.totalDebt = balance.totalDebt ?? null;
    metrics.balanceSheet.cash = balance.cashAndCashEquivalents ?? null;
  }

  // Other (2 metrics)
  if (keyMetrics) {
    metrics.valuation.enterpriseValue = keyMetrics.enterpriseValue ?? null;
    metrics.perShare.dividendYield = keyMetrics.dividendYield ?? null;
  }

  // Update fiscal info from income statement
  if (income?.calendarYear) {
    metrics.fiscalYear = parseInt(income.calendarYear, 10);
    metrics.fiscalQuarter = income.period === 'Q1' ? 1 : 
                           income.period === 'Q2' ? 2 :
                           income.period === 'Q3' ? 3 : 4;
  }

  return metrics;
}

/**
 * Map FMP data to PRO tier metrics (all ~80 metrics)
 */
function mapToProMetrics(
  symbol: string,
  ratios: FMPRatios | null,
  income: FMPIncomeStatement | null,
  balance: FMPBalanceSheet | null,
  cashFlow: FMPCashFlow | null,
  keyMetrics: FMPKeyMetrics | null,
  growth: FMPGrowth | null
): FundamentalMetrics {
  const metrics = createEmptyMetrics(symbol);

  // Valuation (10 metrics)
  metrics.valuation = {
    peRatio: ratios?.peRatioTTM ?? keyMetrics?.peRatio ?? null,
    forwardPE: null, // FMP requires separate endpoint
    pegRatio: ratios?.pegRatioTTM ?? null,
    pbRatio: ratios?.priceToBookRatioTTM ?? keyMetrics?.pbRatio ?? null,
    psRatio: ratios?.priceToSalesRatioTTM ?? keyMetrics?.priceToSalesRatio ?? null,
    evToEbitda: ratios?.enterpriseValueOverEBITDATTM ?? keyMetrics?.enterpriseValueOverEBITDA ?? null,
    evToRevenue: ratios?.enterpriseValueOverRevenueTTM ?? keyMetrics?.evToSales ?? null,
    evToFcf: keyMetrics?.evToFreeCashFlow ?? null,
    priceToFcf: ratios?.priceToFreeCashFlowsRatioTTM ?? keyMetrics?.pfcfRatio ?? null,
    enterpriseValue: keyMetrics?.enterpriseValue ?? null,
  };

  // Profitability (8 metrics)
  metrics.profitability = {
    grossMargin: ratios?.grossProfitMarginTTM ?? income?.grossProfitRatio ?? null,
    operatingMargin: ratios?.operatingProfitMarginTTM ?? income?.operatingIncomeRatio ?? null,
    ebitdaMargin: income?.ebitdaratio ?? null,
    netMargin: ratios?.netProfitMarginTTM ?? income?.netIncomeRatio ?? null,
    roe: ratios?.returnOnEquityTTM ?? keyMetrics?.roe ?? null,
    roa: ratios?.returnOnAssetsTTM ?? null,
    roic: keyMetrics?.roic ?? null,
    roce: ratios?.returnOnCapitalEmployedTTM ?? null,
  };

  // Growth (10 metrics)
  metrics.growth = {
    revenueGrowthYoy: growth?.revenueGrowth ?? null,
    revenueGrowth3Y: growth?.threeYRevenueGrowthPerShare ?? null,
    revenueGrowth5Y: growth?.fiveYRevenueGrowthPerShare ?? null,
    revenueGrowthQoQ: null, // Would need quarterly comparison
    epsGrowthYoy: growth?.epsgrowth ?? null,
    epsGrowth3Y: growth?.threeYNetIncomeGrowthPerShare ?? null,
    epsGrowth5Y: growth?.fiveYNetIncomeGrowthPerShare ?? null,
    epsGrowthQoQ: null, // Would need quarterly comparison
    fcfGrowthYoy: growth?.freeCashFlowGrowth ?? null,
    fcfGrowth3Y: growth?.threeYOperatingCFGrowthPerShare ?? null,
  };

  // Income Statement (13 metrics)
  if (income) {
    metrics.incomeStatement = {
      revenue: income.revenue ?? null,
      costOfRevenue: income.costOfRevenue ?? null,
      grossProfit: income.grossProfit ?? null,
      operatingExpenses: income.operatingExpenses ?? null,
      researchAndDevelopment: income.researchAndDevelopmentExpenses ?? null,
      sellingGeneralAdmin: income.sellingGeneralAndAdministrativeExpenses ?? null,
      operatingIncome: income.operatingIncome ?? null,
      ebitda: income.ebitda ?? null,
      interestExpense: income.interestExpense ?? null,
      taxExpense: income.incomeTaxExpense ?? null,
      netIncome: income.netIncome ?? null,
      eps: income.eps ?? null,
      epsDiluted: income.epsdiluted ?? null,
    };
  }

  // Balance Sheet (19 metrics)
  if (balance) {
    metrics.balanceSheet = {
      totalAssets: balance.totalAssets ?? null,
      totalLiabilities: balance.totalLiabilities ?? null,
      totalEquity: balance.totalEquity ?? balance.totalStockholdersEquity ?? null,
      cash: balance.cashAndCashEquivalents ?? null,
      shortTermInvestments: balance.shortTermInvestments ?? null,
      cashAndEquivalents: balance.cashAndShortTermInvestments ?? null,
      accountsReceivable: balance.netReceivables ?? null,
      inventory: balance.inventory ?? null,
      currentAssets: balance.totalCurrentAssets ?? null,
      propertyPlantEquipment: balance.propertyPlantEquipmentNet ?? null,
      goodwill: balance.goodwill ?? null,
      intangibleAssets: balance.intangibleAssets ?? null,
      accountsPayable: balance.accountPayables ?? null,
      shortTermDebt: balance.shortTermDebt ?? null,
      currentLiabilities: balance.totalCurrentLiabilities ?? null,
      longTermDebt: balance.longTermDebt ?? null,
      totalDebt: balance.totalDebt ?? null,
      netDebt: balance.netDebt ?? null,
      retainedEarnings: balance.retainedEarnings ?? null,
    };
  }

  // Cash Flow (9 metrics)
  if (cashFlow) {
    metrics.cashFlow = {
      operatingCashFlow: cashFlow.operatingCashFlow ?? cashFlow.netCashProvidedByOperatingActivities ?? null,
      capitalExpenditures: cashFlow.capitalExpenditure ?? cashFlow.investmentsInPropertyPlantAndEquipment ?? null,
      freeCashFlow: cashFlow.freeCashFlow ?? null,
      dividendsPaid: cashFlow.dividendsPaid ?? null,
      shareRepurchases: cashFlow.commonStockRepurchased ?? null,
      acquisitions: cashFlow.acquisitionsNet ?? null,
      investingCashFlow: cashFlow.netCashUsedForInvestingActivites ?? null,
      financingCashFlow: cashFlow.netCashUsedProvidedByFinancingActivities ?? null,
      netChangeInCash: cashFlow.netChangeInCash ?? null,
    };
  }

  // Leverage (8 metrics)
  metrics.leverage = {
    debtToEquity: ratios?.debtEquityRatioTTM ?? keyMetrics?.debtToEquity ?? null,
    debtToAssets: ratios?.debtRatioTTM ?? keyMetrics?.debtToAssets ?? null,
    debtToEbitda: null, // Calculate from balance and income if needed
    netDebtToEbitda: keyMetrics?.netDebtToEBITDA ?? null,
    interestCoverage: ratios?.interestCoverageTTM ?? keyMetrics?.interestCoverage ?? null,
    currentRatio: ratios?.currentRatioTTM ?? keyMetrics?.currentRatio ?? null,
    quickRatio: ratios?.quickRatioTTM ?? null,
    cashRatio: ratios?.cashRatioTTM ?? null,
  };

  // Efficiency (8 metrics)
  metrics.efficiency = {
    assetTurnover: ratios?.assetTurnoverTTM ?? null,
    inventoryTurnover: ratios?.inventoryTurnoverTTM ?? keyMetrics?.inventoryTurnover ?? null,
    receivablesTurnover: ratios?.receivablesTurnoverTTM ?? keyMetrics?.receivablesTurnover ?? null,
    payablesTurnover: ratios?.payablesTurnoverTTM ?? keyMetrics?.payablesTurnover ?? null,
    daysInventory: ratios?.daysOfInventoryOutstandingTTM ?? keyMetrics?.daysOfInventoryOnHand ?? null,
    daysReceivables: ratios?.daysOfSalesOutstandingTTM ?? keyMetrics?.daysSalesOutstanding ?? null,
    daysPayables: ratios?.daysOfPayablesOutstandingTTM ?? keyMetrics?.daysPayablesOutstanding ?? null,
    cashConversionCycle: ratios?.cashConversionCycleTTM ?? null,
  };

  // Per Share (7 metrics)
  metrics.perShare = {
    bookValue: ratios?.bookValuePerShareTTM ?? keyMetrics?.bookValuePerShare ?? null,
    tangibleBookValue: ratios?.tangibleBookValuePerShareTTM ?? keyMetrics?.tangibleBookValuePerShare ?? null,
    revenuePerShare: ratios?.revenuePerShareTTM ?? keyMetrics?.revenuePerShare ?? null,
    fcfPerShare: ratios?.freeCashFlowPerShareTTM ?? keyMetrics?.freeCashFlowPerShare ?? null,
    dividend: null, // Would need separate endpoint
    dividendYield: keyMetrics?.dividendYield ?? ratios?.dividendYieldTTM ?? null,
    payoutRatio: keyMetrics?.payoutRatio ?? ratios?.payoutRatioTTM ?? null,
  };

  // Update fiscal info from income statement
  if (income?.calendarYear) {
    metrics.fiscalYear = parseInt(income.calendarYear, 10);
    metrics.fiscalQuarter = income.period === 'Q1' ? 1 : 
                           income.period === 'Q2' ? 2 :
                           income.period === 'Q3' ? 3 : 4;
  }

  return metrics;
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

/**
 * Get fundamental metrics for a stock
 * 
 * @param symbol - Stock symbol (e.g., 'AAPL', 'MSFT')
 * @param tier - User subscription tier ('free' or 'pro')
 * @returns FundamentalMetrics object with available data
 * 
 * FREE TIER returns 20 key metrics:
 * - Valuation: peRatio, pbRatio, psRatio, evToEbitda
 * - Profitability: grossMargin, operatingMargin, netMargin, roe, roa
 * - Growth: revenueGrowthYoy, epsGrowthYoy
 * - Income: revenue, netIncome, eps
 * - Balance: totalAssets, totalDebt, cash
 * - Other: marketCap (in enterpriseValue), dividendYield
 * 
 * PRO TIER returns all ~80 metrics including full financial statements,
 * all ratios, growth periods, leverage, efficiency, and per-share data.
 */
export async function getFundamentals(
  symbol: string,
  tier: SubscriptionTier = 'free'
): Promise<FundamentalMetrics | null> {
  const upperSymbol = symbol.toUpperCase().trim();

  if (!upperSymbol) {
    return null;
  }

  // Check cache first
  const cacheKey = `${FUNDAMENTALS_CACHE_PREFIX}${upperSymbol}:${tier}`;
  const cached = await get<FundamentalMetrics>(cacheKey);
  if (cached) {
    // Restore Date object from cached string
    return {
      ...cached,
      lastUpdated: new Date(cached.lastUpdated),
    };
  }

  // Fetch data based on tier
  if (tier === 'free') {
    // Free tier: minimal API calls (ratios TTM + key metrics + basic financials)
    const [ratiosData, keyMetricsData, incomeData, balanceData] = await Promise.all([
      fetchFMP<FMPRatios[]>(`/ratios-ttm/${upperSymbol}`),
      fetchFMP<FMPKeyMetrics[]>(`/key-metrics/${upperSymbol}?limit=1`),
      fetchFMP<FMPIncomeStatement[]>(`/income-statement/${upperSymbol}?limit=1`),
      fetchFMP<FMPBalanceSheet[]>(`/balance-sheet-statement/${upperSymbol}?limit=1`),
    ]);

    const ratios = ratiosData?.[0] ?? null;
    const keyMetrics = keyMetricsData?.[0] ?? null;
    const income = incomeData?.[0] ?? null;
    const balance = balanceData?.[0] ?? null;

    // If no data at all, return null
    if (!ratios && !keyMetrics && !income && !balance) {
      console.warn(`No fundamental data found for ${upperSymbol}`);
      return null;
    }

    const metrics = mapToFreeMetrics(upperSymbol, ratios, income, balance, keyMetrics);

    // Cache the result
    await set(cacheKey, metrics, FUNDAMENTALS_CACHE_TTL);

    return metrics;
  }

  // Pro tier: full data (all endpoints)
  const [ratiosData, keyMetricsData, incomeData, balanceData, cashFlowData, growthData] = await Promise.all([
    fetchFMP<FMPRatios[]>(`/ratios-ttm/${upperSymbol}`),
    fetchFMP<FMPKeyMetrics[]>(`/key-metrics/${upperSymbol}?limit=1`),
    fetchFMP<FMPIncomeStatement[]>(`/income-statement/${upperSymbol}?limit=1`),
    fetchFMP<FMPBalanceSheet[]>(`/balance-sheet-statement/${upperSymbol}?limit=1`),
    fetchFMP<FMPCashFlow[]>(`/cash-flow-statement/${upperSymbol}?limit=1`),
    fetchFMP<FMPGrowth[]>(`/financial-growth/${upperSymbol}?limit=1`),
  ]);

  const ratios = ratiosData?.[0] ?? null;
  const keyMetrics = keyMetricsData?.[0] ?? null;
  const income = incomeData?.[0] ?? null;
  const balance = balanceData?.[0] ?? null;
  const cashFlow = cashFlowData?.[0] ?? null;
  const growth = growthData?.[0] ?? null;

  // If no data at all, return null
  if (!ratios && !keyMetrics && !income && !balance && !cashFlow && !growth) {
    console.warn(`No fundamental data found for ${upperSymbol}`);
    return null;
  }

  const metrics = mapToProMetrics(upperSymbol, ratios, income, balance, cashFlow, keyMetrics, growth);

  // Cache the result
  await set(cacheKey, metrics, FUNDAMENTALS_CACHE_TTL);

  return metrics;
}

/**
 * Clear cached fundamentals for a symbol
 */
export async function clearFundamentalsCache(symbol: string): Promise<void> {
  const upperSymbol = symbol.toUpperCase().trim();
  const freeCacheKey = `${FUNDAMENTALS_CACHE_PREFIX}${upperSymbol}:free`;
  const proCacheKey = `${FUNDAMENTALS_CACHE_PREFIX}${upperSymbol}:pro`;
  
  await Promise.all([
    set(freeCacheKey, null, 0),
    set(proCacheKey, null, 0),
  ]);
}
