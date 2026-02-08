import { describe, it, expect, vi } from 'vitest';
import { POST as chatPOST } from '@/app/api/chat/route';

function makeRequest(payload: any) {
  return new Request('http://localhost/api/chat', {
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

describe('api/chat POST', () => {
  it('fallback returns offline opening on START_SESSION', async () => {
    const req = makeRequest({ messages: [{ role: 'user', content: 'start_session' }], currentStress: 0, levelId: 'level-1' });
    const res = await chatPOST(req);
    const data = await res.json();
    expect(typeof data.content).toBe('string');
    expect(data.content).toMatch(/离线模式|调查员，你好|霓虹/);
  });

  it('fallback increases stress on present_evidence', async () => {
    const req = makeRequest({ messages: [{ role: 'user', content: 'present_evidence: coffee' }], currentStress: 10, levelId: 'level-1' });
    const res = await chatPOST(req);
    const json = await res.json();
    expect(json.content).toMatch(/:::STATUS/);
    const m = json.content.match(/\{[\s\S]*\}/);
    const status = m ? JSON.parse(m[0]) : null;
    expect(status.stress).toBeGreaterThanOrEqual(30);
  });
});
