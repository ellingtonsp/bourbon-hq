import { NextRequest, NextResponse } from 'next/server';
import { listCronJobs, runCronJob, toggleCronJob } from '@/lib/gateway';

export async function GET() {
  const result = await listCronJobs();
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, jobId, enabled } = body;

  if (action === 'run' && jobId) {
    const result = await runCronJob(jobId);
    return NextResponse.json(result);
  }

  if (action === 'toggle' && jobId !== undefined && enabled !== undefined) {
    const result = await toggleCronJob(jobId, enabled);
    return NextResponse.json(result);
  }

  return NextResponse.json({ ok: false, error: { message: 'Invalid action' } }, { status: 400 });
}
