// Gateway client for calling Clawdbot tools

const GATEWAY_URL = process.env.GATEWAY_URL || 'https://127.0.0.1:18789';
const GATEWAY_PASSWORD = process.env.GATEWAY_PASSWORD || '';
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || '';

// Use password if available, otherwise token
const AUTH_HEADER = GATEWAY_PASSWORD 
  ? `Bearer ${GATEWAY_PASSWORD}`
  : `Bearer ${GATEWAY_TOKEN}`;

export interface ToolResponse<T = unknown> {
  ok: boolean;
  result?: T;
  error?: {
    type: string;
    message: string;
  };
}

export async function invokeTool<T = unknown>(
  tool: string,
  args: Record<string, unknown> = {},
  sessionKey = 'main'
): Promise<ToolResponse<T>> {
  try {
    const url = new URL('/tools/invoke', GATEWAY_URL);
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH_HEADER,
      },
      body: JSON.stringify({
        tool,
        args,
        sessionKey,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        ok: false,
        error: {
          type: 'http_error',
          message: `HTTP ${response.status}: ${text || response.statusText}`,
        },
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Gateway error:', error);
    return {
      ok: false,
      error: {
        type: 'network_error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

// Convenience wrappers for common tools

export async function listCronJobs() {
  return invokeTool('cron', { action: 'list' });
}

export async function runCronJob(jobId: string) {
  return invokeTool('cron', { action: 'run', jobId });
}

export async function toggleCronJob(jobId: string, enabled: boolean) {
  return invokeTool('cron', { 
    action: 'update', 
    jobId,
    patch: { enabled }
  });
}

export async function getSessionStatus() {
  return invokeTool('session_status', {});
}

export async function sendMessage(message: string, sessionKey = 'main') {
  return invokeTool('sessions_send', { message, sessionKey });
}

export async function listSessions() {
  return invokeTool('sessions_list', { messageLimit: 5 });
}

// Quick action handlers
export async function triggerEmailTriage() {
  return sendMessage('Check all email inboxes for urgent messages and summarize what needs attention.');
}

export async function triggerLinkedInPost() {
  return sendMessage('Run the LinkedIn daily post workflow: find a relevant article and draft a post.');
}

export async function triggerNovaraMetrics() {
  return sendMessage('Pull the latest Novara metrics from PostHog and give me a summary.');
}

export async function triggerCalendarBrief() {
  return sendMessage('What\'s on my calendar for the next 24 hours?');
}

export async function triggerResearch(topic: string) {
  return sendMessage(`Research: ${topic}`);
}
