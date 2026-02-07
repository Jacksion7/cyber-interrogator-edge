import { OpenAI } from 'openai';

export const runtime = 'edge';
export const preferredRegion = ['hkg1', 'sin1', 'bom1'];

function bases() {
  const primary = process.env.OPENAI_BASE_URL || 'https://api.chatanywhere.tech/v1';
  const extra = (process.env.OPENAI_FALLBACK_BASE_URLS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const list = [primary, ...extra];
  return Array.from(new Set(list));
}

export async function POST(req: Request) {
  const { messages, levelTitle } = await req.json();

  const systemPrompt = `
    你是一位专业的科幻/悬疑小说家。
    你的任务是根据以下的【审讯记录】，为玩家写一篇精彩的【案件总结】。
    
    【要求】
    1. 标题为《${levelTitle}：真相档案》。
    2. 风格：赛博朋克、黑色侦探、略带哲学思考。
    3. 内容：
       - 回顾玩家是如何一步步击溃 AI 防线的。
       - 重点描写玩家使用的精彩技能（如思维截获、逻辑过载）。
       - 揭示案件背后的悲剧内核。
       - 结尾要有一个发人深省的升华。
    4. 字数：300-500字。
    5. 格式：Markdown。
    `;

  const relevantMessages = messages.filter((m: any) => 
    m.role !== 'system' || m.content.includes(">>>") || m.content.includes("SYSTEM INJECTION")
  ).map((m: any) => `${m.role === 'user' ? '调查员' : 'AI嫌疑人'}: ${m.content}`).join("\n");

  try {
    let summary = "";
    let lastErr: any = null;
    for (const base of bases()) {
      try {
        const client = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY || 'mock-key',
          baseURL: base,
        });
        const response = await client.chat.completions.create({
          model: 'gpt-3.5-turbo',
          stream: false,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `【审讯记录开始】\n${relevantMessages}\n【审讯记录结束】` },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        });
        summary = response.choices[0]?.message?.content || "";
        break;
      } catch (e) {
        lastErr = e;
        continue;
      }
    }
    if (!summary) throw lastErr || new Error("All bases failed");

    return new Response(JSON.stringify({ summary }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const hasOverload = Array.isArray(messages) && messages.some((m: any) => {
      const c = (m?.content || '').toLowerCase();
      return c.includes("logic_overload_protocol") || c.includes("系统注入") || c.includes("逻辑过载");
    });
    const ending = hasOverload 
      ? "在关键时刻通过逻辑过载击穿其防线，真相显露。"
      : "在循序逼问与证据质询中逐步瓦解其辩护，真相显露。";
    const offline = `# 《${levelTitle}：真相档案》\n\n【离线摘要】\n\n${relevantMessages}\n\n${ending}\n\n（由系统离线生成）`;
    return new Response(JSON.stringify({ summary: offline }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
