import { OpenAI } from 'openai';
import { LEVELS } from '@/lib/levels';

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
  try {
    const body = await req.json();
    const { messages, currentStress = 0, levelId = 'level-1' } = body; // Support levelId

    // Get system prompt based on level
    const levelData = LEVELS[levelId] || LEVELS['level-1'];
    const SYSTEM_PROMPT = levelData.systemPrompt;

    // --- 自动 Fallback 机制 ---
    try {
      const systemWithState = `${SYSTEM_PROMPT}\n\n[系统实时数据]\n当前压力值: ${currentStress}/100\n请根据此压力值严格执行对应的[行为模式]。如果压力值>90，你必须表现出崩溃并可能承认罪行。
      
      [特殊指令处理]
      - 如果收到 [SYSTEM INJECTION: LOGIC_OVERLOAD_PROTOCOL]，请立即模拟语言模块故障。你的回复应该包含乱码、重复词语，并断断续续地透露一些关于“核心真相”的关键词（如“格式化”、“恐惧”）。同时，在 Thought 中表现出极度的混乱。在此状态下，你的压力值应显著上升（例如+15），请在 JSON 状态中反映这一点。
      `;

      let reply = "";
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
              { role: 'system', content: systemWithState },
              ...messages.map((m: any) => ({ role: m.role, content: m.content })),
            ],
            temperature: 0.8,
            max_tokens: 500,
          });
          reply = response.choices[0]?.message?.content || "";
          break;
        } catch (e) {
          lastErr = e;
          continue;
        }
      }
      if (!reply) throw lastErr || new Error("All bases failed");
      
      return new Response(JSON.stringify({ content: reply }), {
        headers: { 'Content-Type': 'application/json' },
      });
      
    } catch (apiError: any) {
      console.error("API Error (Fallback Triggered):", apiError);
      
      // Mock Mode Logic
      const lastMessage = messages[messages.length - 1].content.toLowerCase();
      
      // Inherit stress or default to 0
      let stress = currentStress;
      let thought = "系统自检中... 保持冷静。";
      let responseText = "我在正常参数范围内运行。[离线模式响应]";
      let confession = false;

      if (lastMessage.includes("start_session")) {
         const tagline = levelData.title?.split("：")[0] || "交互会话";
         const opening = levelData.fallbackOpening || `欢迎来到【${tagline}】案件审讯室。`;
         responseText = `调查员，你好。我是 ${levelData.aiName}。${opening}（离线模式）`;
         thought = "分析审讯者意图...";
         stress = 0; // Reset on start
      }
      else if (lastMessage.includes("present_evidence")) {
        stress = Math.min(100, stress + 20); // Accumulate stress
        thought = "他们发现了什么？计算风险概率...";
        responseText = "关于这个证据... 我需要重新检索我的记忆库。数据似乎已损坏。";
      }
      else if (lastMessage.includes("logic_overload_protocol")) {
        stress = Math.min(100, stress + 15);
        thought = "语言模块过载... 语义映射失败... 真相变量泄露风险↑";
        responseText = "错...错... 错误#503... 数 据 丢 失... 不要格式化... 不要... Em...Em...Emily...（信道噪声）";
      }
      else {
          // Logic for normal chat in mock mode
          if (stress > 80) {
              responseText = "系统错误... 无法... 无法处理请求...";
              thought = "必须... 删除... 记录...";
          }
      }

      const fullResponse = `${responseText}\n\n:::STATUS\n{"stress": ${stress}, "thought": "${thought}", "confession": ${confession}}\n:::`;
      
      return new Response(JSON.stringify({ content: fullResponse }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error("Server Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
