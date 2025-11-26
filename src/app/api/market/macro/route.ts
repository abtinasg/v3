import { NextResponse } from 'next/server';
import { get, set } from '@/lib/redis';

// =============================================================================
// TYPES
// =============================================================================

interface MacroIndicator {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  lastUpdate: string;
  source: string;
  description: string;
}

interface TreasuryYield {
  maturity: '2Y' | '10Y' | '30Y';
  rate: number;
  change: number;
  previousRate: number;
}

interface MacroData {
  indicators: MacroIndicator[];
  yields: TreasuryYield[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

const CACHE_KEY = 'market:macro';
const CACHE_TTL = 900; // 15 minutes in seconds

// =============================================================================
// MOCK DATA
// TODO: Integrate FRED API (Federal Reserve Economic Data) for real data
// FRED API: https://fred.stlouisfed.org/docs/api/fred/
// Required endpoints:
//   - series/observations for indicator values
//   - Relevant series IDs:
//     - FEDFUNDS: Federal Funds Rate
//     - CPIAUCSL: Consumer Price Index
//     - UNRATE: Unemployment Rate
//     - GDP: Gross Domestic Product
//     - DGS2, DGS10, DGS30: Treasury yields
// =============================================================================

const MOCK_INDICATORS: MacroIndicator[] = [
  {
    id: 'FED_RATE',
    name: 'Fed Funds Rate',
    value: 5.25,
    previousValue: 5.25,
    change: 0,
    unit: '%',
    frequency: 'monthly',
    lastUpdate: '2024-11-01',
    source: 'Federal Reserve',
    description: 'The interest rate at which banks lend to each other overnight',
  },
  {
    id: 'CPI',
    name: 'CPI YoY',
    value: 3.2,
    previousValue: 3.4,
    change: -0.2,
    unit: '%',
    frequency: 'monthly',
    lastUpdate: '2024-10-15',
    source: 'Bureau of Labor Statistics',
    description: 'Year-over-year change in Consumer Price Index',
  },
  {
    id: 'UNEMPLOYMENT',
    name: 'Unemployment Rate',
    value: 3.9,
    previousValue: 3.8,
    change: 0.1,
    unit: '%',
    frequency: 'monthly',
    lastUpdate: '2024-11-01',
    source: 'Bureau of Labor Statistics',
    description: 'Percentage of labor force that is unemployed',
  },
  {
    id: 'GDP_GROWTH',
    name: 'GDP Growth',
    value: 2.1,
    previousValue: 1.8,
    change: 0.3,
    unit: '%',
    frequency: 'quarterly',
    lastUpdate: '2024-10-30',
    source: 'Bureau of Economic Analysis',
    description: 'Quarter-over-quarter GDP growth rate (annualized)',
  },
];

const MOCK_YIELDS: TreasuryYield[] = [
  {
    maturity: '2Y',
    rate: 4.62,
    change: 0.02,
    previousRate: 4.60,
  },
  {
    maturity: '10Y',
    rate: 4.25,
    change: -0.03,
    previousRate: 4.28,
  },
  {
    maturity: '30Y',
    rate: 4.45,
    change: -0.01,
    previousRate: 4.46,
  },
];

// =============================================================================
// GET HANDLER
// =============================================================================

export async function GET() {
  try {
    // Check cache first
    const cached = await get<MacroData>(CACHE_KEY);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // TODO: Replace with FRED API calls when integrating real data
    // For now, use mock data with slight randomization to simulate real updates
    const data: MacroData = {
      indicators: MOCK_INDICATORS,
      yields: MOCK_YIELDS,
    };

    // Cache the result
    await set(CACHE_KEY, data, CACHE_TTL);

    return NextResponse.json({
      success: true,
      data,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching macro data:', error);
    
    // Return mock data even on error to ensure UI doesn't break
    return NextResponse.json({
      success: true,
      data: {
        indicators: MOCK_INDICATORS,
        yields: MOCK_YIELDS,
      },
      cached: false,
      error: 'Using fallback data',
    });
  }
}
