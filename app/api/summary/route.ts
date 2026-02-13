import { OpenAI } from 'openai';

export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.chatanywhere.tech/v1',
});

export async function POST(req: Request) {
  try {
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
       - 结尾要有一个发人深省的升华，并追加一句短促而有力的余韵（不超过20字）。
    4. 字数：300-500字。
    5. 格式：Markdown。
    `;

    // Filter messages to reduce token usage, keeping system actions and user/assistant exchanges
    const relevantMessages = messages.filter((m: { role: string; content: string }) => 
      m.role !== 'system' || m.content.includes(">>>") || m.content.includes("SYSTEM INJECTION")
    ).map((m: { role: string; content: string }) => `${m.role === 'user' ? '调查员' : 'AI嫌疑人'}: ${m.content}`).join("\n");

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: false,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `【审讯记录开始】\n${relevantMessages}\n【审讯记录结束】` },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const summary = response.choices[0]?.message?.content || "档案生成失败。";

    return new Response(JSON.stringify({ summary }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("Summary Generation Error:", error);
    return new Response(JSON.stringify({ summary: "无法连接至档案库。请手动查阅本地记录。" }), { status: 500 });
  }
}
