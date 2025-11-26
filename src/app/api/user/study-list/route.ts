import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Implement get study list endpoint
  return NextResponse.json({ message: 'Get study list endpoint' });
}

export async function POST(request: Request) {
  // TODO: Implement add to study list endpoint
  return NextResponse.json({ message: 'Add to study list endpoint' });
}

export async function DELETE(request: Request) {
  // TODO: Implement remove from study list endpoint
  return NextResponse.json({ message: 'Remove from study list endpoint' });
}
