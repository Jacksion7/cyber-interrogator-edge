import { describe, it, expect, vi } from 'vitest';
import { POST as summaryPOST } from '@/app/api/summary/route';

function makeRequest(payload: any) {
  return new Request('http://localhost/api/summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

vi.mock('openai', () => {
  class OpenAI {
    chat = {
      completions: {
        create: async () => {
          throw new Error('network error');
        },
      },
    };
  }
  return { OpenAI };
});

describe('api/summary POST', () => {
  it('returns summary or fallback', async () => {
    const req = makeRequest({ messages: [{ role: 'user', content: 'hello' }], levelTitle: '测试关卡' });
    const res = await summaryPOST(req);
    const json = await res.json();
    expect(typeof json.summary).toBe('string');
  });
});
