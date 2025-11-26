import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  // TODO: Implement stock quote endpoint
  return NextResponse.json({ message: `Quote for ${params.symbol}` });
}
