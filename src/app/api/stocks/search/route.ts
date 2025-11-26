import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // TODO: Implement stock search endpoint
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  return NextResponse.json({ message: `Search results for: ${query}` });
}
