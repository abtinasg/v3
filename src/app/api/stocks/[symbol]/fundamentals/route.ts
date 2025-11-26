import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  // TODO: Implement stock fundamentals endpoint
  return NextResponse.json({ message: `Fundamentals for ${params.symbol}` });
}
