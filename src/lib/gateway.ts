// Gateway client for calling Clawdbot tools

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://127.0.0.1:18789';
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

// Chat completions with streaming support
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamCallbacks {
  onToken?: (token: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: string) => void;
}

export async function chatCompletions(
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
  sessionId?: string
): Promise<void> {
  try {
    const url = new URL('/v1/chat/completions', GATEWAY_URL);
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH_HEADER,
        'x-clawdbot-agent-id': 'main',
      },
      body: JSON.stringify({
        model: 'clawdbot:main',
        stream: true,
        messages,
        // Use sessionId for conversation continuity
        user: sessionId || 'bourbon-hq',
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      callbacks.onError?.(`HTTP ${response.status}: ${text || response.statusText}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      callbacks.onError?.('No response body');
      return;
    }

    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            callbacks.onComplete?.(fullResponse);
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content;
            if (token) {
              fullResponse += token;
              callbacks.onToken?.(token);
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    callbacks.onComplete?.(fullResponse);
  } catch (error) {
    console.error('Chat error:', error);
    callbacks.onError?.(error instanceof Error ? error.message : 'Unknown error');
  }
}

// Non-streaming chat for simple requests
export async function chatSimple(
  messages: ChatMessage[],
  sessionId?: string
): Promise<{ ok: boolean; response?: string; error?: string }> {
  try {
    const url = new URL('/v1/chat/completions', GATEWAY_URL);
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH_HEADER,
        'x-clawdbot-agent-id': 'main',
      },
      body: JSON.stringify({
        model: 'clawdbot:main',
        stream: false,
        messages,
        user: sessionId || 'bourbon-hq',
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

export async function sendMessage(message: string, sessionKey = 'main', timeoutSeconds = 60) {
  return invokeTool('sessions_send', { message, sessionKey, timeoutSeconds });
}

export async function listSessions() {
  return invokeTool('sessions_list', { messageLimit: 5 });
}

// Read a file from workspace
export async function readFile(path: string) {
  return invokeTool<string>('read', { path });
}

// List workspace files
export async function listFiles(path: string = '/Users/bourbon/clawd') {
  return invokeTool('exec', { 
    command: `find "${path}" -maxdepth 2 -type f \\( -name "*.md" -o -name "*.json" -o -name "*.txt" \\) 2>/dev/null | head -50`,
    timeout: 10
  });
}

// Quick action handlers - now with timeouts for proper feedback
export async function triggerEmailTriage() {
  return chatSimple([{ 
    role: 'user', 
    content: 'Check all email inboxes for urgent messages and summarize what needs attention. Be concise.'
  }], 'bourbon-hq-actions');
}

export async function triggerLinkedInPost() {
  return chatSimple([{ 
    role: 'user', 
    content: 'Run the LinkedIn daily post workflow: find a relevant article and draft a post. Keep it brief.'
  }], 'bourbon-hq-actions');
}

export async function triggerNovaraMetrics() {
  return chatSimple([{ 
    role: 'user', 
    content: 'Pull the latest Novara metrics from PostHog and give me a summary.'
  }], 'bourbon-hq-actions');
}

export async function triggerCalendarBrief() {
  return chatSimple([{ 
    role: 'user', 
    content: 'What\'s on my calendar for the next 24 hours? Be concise.'
  }], 'bourbon-hq-actions');
}

export async function triggerResearch(topic: string) {
  return chatSimple([{ 
    role: 'user', 
    content: `Research: ${topic}. Give me a concise summary.`
  }], 'bourbon-hq-actions');
}
