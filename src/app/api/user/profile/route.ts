import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Implement user profile endpoint
  return NextResponse.json({ message: 'User profile endpoint' });
}

export async function PUT(request: Request) {
  // TODO: Implement user profile update endpoint
  return NextResponse.json({ message: 'User profile update endpoint' });
}
