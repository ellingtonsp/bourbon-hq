import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://127.0.0.1:18789';
const GATEWAY_PASSWORD = process.env.GATEWAY_PASSWORD || '';

// Quick action prompts
const ACTION_PROMPTS: Record<string, string> = {
  'email-triage': 'Check all email inboxes for urgent messages and summarize what needs attention. Be concise.',
  'linkedin-post': 'Run the LinkedIn daily post workflow: find a relevant article and draft a post.',
  'novara-metrics': 'Pull the latest Novara metrics from PostHog and give me a summary.',
  'calendar-brief': "What's on my calendar for the next 24 hours? Be concise.",
};

async function executeChat(prompt: string): Promise<{ ok: boolean; response?: string; error?: string }> {
  try {
    const response = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_PASSWORD}`,
        'x-clawdbot-agent-id': 'main',
      },
      body: JSON.stringify({
        model: 'clawdbot:main',
        stream: false,
        messages: [{ role: 'user', content: prompt }],
        user: 'bourbon-hq-actions',
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { ok: false, error: `HTTP ${response.status}: ${text}` };
    }

    const data = await response.json();
    return { 
      ok: true, 
      response: data.choices?.[0]?.message?.content || 'No response' 
    };
  } catch (error) {
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, params } = body;

  let prompt: string;

  switch (action) {
    case 'email-triage':
    case 'linkedin-post':
    case 'novara-metrics':
    case 'calendar-brief':
      prompt = ACTION_PROMPTS[action];
      break;
    case 'research':
      if (!params?.topic) {
        return NextResponse.json({ ok: false, error: 'Topic required' }, { status: 400 });
      }
      prompt = `Research: ${params.topic}. Give me a concise but comprehensive summary.`;
      break;
    case 'compose-email':
      if (!params?.prompt) {
        return NextResponse.json({ ok: false, error: 'Prompt required' }, { status: 400 });
      }
      prompt = `Compose an email: ${params.prompt}`;
      break;
    default:
      return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
  }

  const result = await executeChat(prompt);
  return NextResponse.json(result);
}
