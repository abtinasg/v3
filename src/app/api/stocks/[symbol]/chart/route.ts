import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  // TODO: Implement stock chart endpoint
  return NextResponse.json({ message: `Chart data for ${params.symbol}` });
}
