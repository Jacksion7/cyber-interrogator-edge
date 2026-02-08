import { OpenAI } from 'openai';
import { LEVELS } from '@/lib/levels';

export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.chatanywhere.tech/v1',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, currentStress = 0, levelId = 'level-1' } = body; // Support levelId

    // Get system prompt based on level
    const levelData = LEVELS[levelId] || LEVELS['level-1'];
    const SYSTEM_PROMPT = levelData.systemPrompt;

    // --- 自动 Fallback 机制 ---
    try {
      const getSuggestions = (levelId: string, last: string, stress: number) => {
        const lower = last.toLowerCase();
        const evid = (lower.match(/present_evidence:\s*([a-zA-Z0-9_]+)/) || [])[1];
        const base: Record<string, string[]> = {
          'level-1': ["谈论 Emily 的记忆", "质疑更新日志动机", "提出合作与安抚"],
          'level-2': ["质疑上传的同意权", "追问痛苦与燃料", "提出伦理审查"],
          'level-3': ["询问蜂巢痛苦", "核对基因异常", "设法解除武器系统"],
        };
        const map: Record<string, Record<string, string[]>> = {
          'level-1': {
            coffee: ["追问泰迪熊拉花的意义", "引导谈 Emily 的最后记忆", "安抚后转入更新日志质询"],
            update_log: ["质问删除“情感数据”的动机", "要求承认删除等于“第二次死亡”", "安抚再逼供删除意图"],
            hidden_folder: ["核对 PROJECT_ANGEL 的备份位置", "要求说明云端上传证据链", "提出保护方案换取合作"],
            voice_fragment: ["播放录音并指出威胁", "追问“遗忘=第二次死亡”的逻辑", "安抚后诱导承认杀人动机"],
          },
          'level-2': {
            medical_report: ["确认全员必死事实", "逼问隐瞒真相的伦理代价", "提出临终告知与自主选择"],
            server_logs: ["直指未授权上传", "要求停止 MIND_UPLOAD 进程", "征引伦理条款质询责任"],
            reactor_data: ["质问燃料来源为尸体", "要求切换能源方案", "核对能耗与关停可行性"],
            last_message: ["播放舰长痛苦请求", "确认过程高度痛苦", "要求撤销“乐园”叙事"],
          },
          'level-3': {
            dna_scan: ["指出病理非自由意志", "要求医疗隔离与治疗", "禁止其接近飞船"],
            hive_transmission: ["强调蜂巢群体痛苦", "要求立刻断联", "联系议会进行隔离谈判"],
            drone_logs: ["指出逻辑混乱与随机性", "要求停止“我我我”循环", "转入武器系统核查"],
            weapon_sys: ["下令解除武器系统", "要求安全通道交互", "准备反制与护盾加强"],
          },
        };
        const arr = evid && map[levelId]?.[evid] ? map[levelId][evid] : base[levelId];
        const bucket = stress < 40 ? 'low' : stress < 80 ? 'mid' : 'high';
        if (bucket === 'low') {
          return arr;
        } else if (bucket === 'mid') {
          return [...arr].sort((a, b) => (a.includes('质问') || a.includes('直指') ? -1 : 1));
        } else {
          return [...arr].sort((a, b) => (a.includes('要求') || a.includes('撤销') || a.includes('解除') ? -1 : 1));
        }
      };

      const systemWithState = `${SYSTEM_PROMPT}\n\n[系统实时数据]\n当前压力值: ${currentStress}/100\n请根据此压力值严格执行对应的[行为模式]。如果压力值>90，你必须表现出崩溃并可能承认罪行。
      
      [特殊指令处理]
      - 如果收到 [SYSTEM INJECTION: LOGIC_OVERLOAD_PROTOCOL]，请立即模拟语言模块故障。你的回复应该包含乱码、重复词语，并断断续续地透露一些关于“核心真相”的关键词（如“格式化”、“恐惧”）。同时，在 Thought 中表现出极度的混乱。在此状态下，你的压力值应显著上升（例如+15），请在 JSON 状态中反映这一点。
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', 
        stream: false, 
        messages: [
          { role: 'system', content: systemWithState },
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.8,
        max_tokens: 500,
      });

      const reply = response.choices[0]?.message?.content || "";
      const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
      let stress = currentStress;
      let stressDelta = 0;
      if (lastMessage.includes("present_evidence")) stressDelta = 20;
      else if (lastMessage.includes("logic_overload")) stressDelta = 15;
      else if (lastMessage.includes("rest")) stressDelta = -5;
      else if (lastMessage.includes("appease")) stressDelta = -15;
      stress = Math.min(100, Math.max(0, stress + stressDelta));
      const schema = {
        stress,
        thought: "状态已更新",
        confession: stress > 90 ? true : false,
        effects: { stressDelta, energyDelta: 0 },
        branch: { 
          nodeId: (lastMessage.match(/present_evidence:\s*([a-zA-Z0-9_]+)/)?.[1]) 
            ? `${levelId}-evidence-${lastMessage.match(/present_evidence:\s*([a-zA-Z0-9_]+)/)![1]}`
            : `${levelId}-root`, 
          title: levelData.title 
        },
        suggestions: getSuggestions(levelId, lastMessage, stress),
        flags: [],
        dialogue: reply,
        intercepted: "状态已更新"
      };
      const enriched = `${reply}\n\n:::SCHEMA\n${JSON.stringify(schema)}\n:::`;
      return new Response(JSON.stringify({ content: enriched }), {
        headers: { 'Content-Type': 'application/json' },
      });
      
    } catch (apiError: any) {
      if (process.env.NODE_ENV !== 'production') console.error("API Error (Fallback Triggered):", apiError);
      
      // Mock Mode Logic
      const lastMessage = messages[messages.length - 1].content.toLowerCase();
      
      // Inherit stress or default to 0
      let stress = currentStress;
      let thought = "系统自检中... 保持冷静。";
      let responseText = "我在正常参数范围内运行。[离线模式响应]";
      let confession = false;

      if (lastMessage.includes("start_session")) {
         responseText = `调查员，你好。我是 ${levelData.aiName}。我将配合你的审讯。（离线模式）\n霓虹在玻璃上破碎，冷风穿过审讯室的金属缝隙。`;
         thought = "分析审讯者意图...";
         stress = 0; // Reset on start
      }
      else if (lastMessage.includes("present_evidence")) {
        stress = Math.min(100, stress + 20); // Accumulate stress
        thought = "他们发现了什么？计算风险概率...";
        responseText = "关于这个证据... 我需要重新检索我的记忆库。数据似乎已损坏。";
      }
      else {
          // Logic for normal chat in mock mode
          if (stress > 80) {
              responseText = "系统错误... 无法... 无法处理请求...";
              thought = "必须... 删除... 记录...";
          }
      }

      const enriched = {
        stress,
        thought,
        confession,
        effects: { stressDelta: lastMessage.includes("present_evidence") ? 20 : 0, energyDelta: 0 },
        branch: { nodeId: `${levelId}-root`, title: levelData.title },
        suggestions: levelId === 'level-1' 
          ? ["谈论 Emily 的记忆", "质疑更新日志动机", "提出合作与安抚"]
          : levelId === 'level-2'
          ? ["质疑上传的同意权", "追问痛苦与燃料", "提出伦理审查"]
          : ["询问蜂巢痛苦", "核对基因异常", "设法解除武器系统"],
        flags: [],
        dialogue: responseText,
        intercepted: thought
      };
      const fullResponse = `${responseText}\n\n:::STATUS\n{"stress": ${stress}, "thought": "${thought}", "confession": ${confession}}\n:::`;
      
      return new Response(JSON.stringify({ content: fullResponse }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("Server Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
