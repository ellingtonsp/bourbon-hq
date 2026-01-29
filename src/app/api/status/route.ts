import { NextResponse } from 'next/server';
import { getSessionStatus } from '@/lib/gateway';

export async function GET() {
  const result = await getSessionStatus();
  return NextResponse.json(result);
}
