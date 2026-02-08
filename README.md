# 🕵️‍♂️ Cyber Interrogator (赛博审讯室)

> "2077年，图灵测试已成为死刑判决。"

一款基于 AI (LLM) 的沉浸式侦探推理游戏。作为调查员，你需要通过对话、搜证和心理博弈，击溃失控 AI 的心理防线。

## 📚 文档导航
*   游戏页面：[app/game/page.tsx](file:///Users/zjl/Desktop/Study/Program/4-2/4-2Degree%20Project/TRAE/Game/app/game/page.tsx)
*   状态管理：[lib/store.ts](file:///Users/zjl/Desktop/Study/Program/4-2/4-2Degree%20Project/TRAE/Game/lib/store.ts)
*   AI 接口（聊天）：[app/api/chat/route.ts](file:///Users/zjl/Desktop/Study/Program/4-2/4-2Degree%20Project/TRAE/Game/app/api/chat/route.ts)
*   关卡配置：[lib/levels.tsx](file:///Users/zjl/Desktop/Study/Program/4-2/4-2Degree%20Project/TRAE/Game/lib/levels.tsx)

## 🚀 快速开始

1.  **克隆项目**
    ```bash
    git clone https://github.com/your-username/cyber-interrogator.git
    cd cyber-interrogator
    ```

2.  **配置环境**
    复制 `.env.example` (如果没有则新建) 为 `.env.local` 并填入你的 API Key：
    ```env
    OPENAI_API_KEY=sk-xxxxxx
    OPENAI_BASE_URL=https://api.openai.com/v1  # 可选
    ```

3.  **运行游戏**
    ```bash
    npm install
    npm run dev
    ```
    打开浏览器访问 `http://localhost:3000`。

## 🌟 核心特性
*   **🧠 真实 AI 对手**: 默认模型为 gpt-3.5-turbo（可切换），AI 拥有压力值与隐藏思维。
*   **🎯 回合与胜负**: 采用回合上限（40 回合），存在明确的胜/负状态。
*   **⚡ 战术技能**: 休息、安抚、思维截获、数据库骇入、逻辑过载等技能影响能量与压力。
*   **🔍 证据系统**: 证据解锁与展示将触发节点与建议，推动剧情进展。
*   **📈 连击与成就**: 技能与证据形成连击链，达成里程碑奖励成就。
*   **🧭 战术指南**: AI 返回结构化建议（SCHEMA.suggestions），界面提供一键跟进。
*   **🗂 进度档案**: 记录关键节点与当前目标，便于审讯策略调整。
*   **🕸 节点图谱**: 可视化决策路径，支持节点回放（便携式复盘）。
*   **✍️ AI 小说家**: 自动生成本章故事摘要，帮助玩家回顾。
*   **🎭 角色与章节**: 
    - 第一章：记忆的囚徒（调查员）
    - 第二章：忒修斯之舟（伦理审查官）
    - 第三章：蜂巢的叛徒（异星语言学家）

## 🛠️ 技术栈

*   **Framework**: Next.js 14 (App Router)
*   **Styling**: Tailwind CSS
*   **AI Integration**: OpenAI SDK (Node.js)
*   **State Management**: Zustand
*   **Icons**: Lucide React

## 🧩 结构化 JSON（SCHEMA）
AI 回复中包含结构化区块：
```
:::SCHEMA
{
  "stress": 75,
  "effects": { "stressDelta": 20, "energyDelta": 0 },
  "branch": { "nodeId": "level-1-evidence-update_log", "title": "记忆的囚徒" },
  "suggestions": ["质问删除“情感数据”的动机", "要求承认删除等于“第二次死亡”"],
  "flags": []
}
:::
```
- 客户端会提取 suggestions 并展示为战术建议按钮
- branch.nodeId 会被记录进决策路径，用于节点图谱与回放
- stress 与 effects 用于数值更新与演出

## ✅ 测试与开发
- 单元测试：`npm run test`
- 端到端测试：`npm run test:e2e`
- 代码风格检查：`npm run lint`

## 📦 生产环境建议
- 配置 OPENAI_API_KEY 与可用的 Base URL
- 开启 CDN 与缓存以加速静态资源
- 使用持久化存储保存玩家通关进度（本地暂用 localStorage）

## 🗺 设计原则（线性主干 + 分支宽度）
- 主线按章节推进，分支在节点处拓展宽度
- 每个节点提供可回放与建议历史，便于复盘与二周目
- 战术建议会按压力值分桶排序（低/中/高），在高压时更偏向“要求/撤销/解除”等强制措施

## 🧭 入口与文件
- 游戏页面入口：[page.tsx](file:///Users/zjl/Desktop/Study/Program/4-2/4-2Degree%20Project/TRAE/Game/app/game/page.tsx)
- 状态与方法：[store.ts](file:///Users/zjl/Desktop/Study/Program/4-2/4-2Degree%20Project/TRAE/Game/lib/store.ts)
- 对话接口：[route.ts](file:///Users/zjl/Desktop/Study/Program/4-2/4-2Degree%20Project/TRAE/Game/app/api/chat/route.ts)
- 关卡配置：[levels.tsx](file:///Users/zjl/Desktop/Study/Program/4-2/4-2Degree%20Project/TRAE/Game/lib/levels.tsx)
