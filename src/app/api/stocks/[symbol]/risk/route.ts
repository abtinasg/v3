import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  // TODO: Implement stock risk endpoint
  return NextResponse.json({ message: `Risk data for ${params.symbol}` });
}
