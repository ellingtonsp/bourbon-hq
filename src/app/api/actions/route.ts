import { NextRequest, NextResponse } from 'next/server';
import { 
  triggerEmailTriage, 
  triggerLinkedInPost, 
  triggerNovaraMetrics, 
  triggerCalendarBrief,
  triggerResearch,
  sendMessage
} from '@/lib/gateway';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, params } = body;

  let result;

  switch (action) {
    case 'email-triage':
      result = await triggerEmailTriage();
      break;
    case 'linkedin-post':
      result = await triggerLinkedInPost();
      break;
    case 'novara-metrics':
      result = await triggerNovaraMetrics();
      break;
    case 'calendar-brief':
      result = await triggerCalendarBrief();
      break;
    case 'research':
      if (!params?.topic) {
        return NextResponse.json({ ok: false, error: { message: 'Topic required' } }, { status: 400 });
      }
      result = await triggerResearch(params.topic);
      break;
    case 'compose-email':
      if (!params?.prompt) {
        return NextResponse.json({ ok: false, error: { message: 'Prompt required' } }, { status: 400 });
      }
      result = await sendMessage(`Compose an email: ${params.prompt}`);
      break;
    default:
      return NextResponse.json({ ok: false, error: { message: 'Unknown action' } }, { status: 400 });
  }

  return NextResponse.json(result);
}
