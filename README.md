# 🕵️‍♂️ Cyber Interrogator (赛博审讯室)

> "2077年，图灵测试已成为死刑判决。"

一款基于 AI (LLM) 的沉浸式侦探推理游戏。作为调查员，你需要通过对话、搜证和心理博弈，击溃失控 AI 的心理防线。

## 📚 文档导航

*   **[第一关攻略 & 剧情档案](./LEVEL_1_GUIDE.md)**: 包含完整的故事背景、证据细节和通关指南。
*   **[部署指南](./DEPLOYMENT.md)**: 如何将游戏发布到互联网以及如何添加新关卡。
*   **[项目架构](./PROJECT_SUMMARY.md)**: 技术栈与核心机制说明。

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

*   **🧠 真实 AI 对手**: 由 GPT-4o-mini 驱动的 AI 嫌疑人，拥有动态的压力值和隐藏的内心独白。
*   **⚡ 战术博弈**: 使用 [休息]、[安抚]、[思维截获] 等技能来控制审讯节奏。
*   **🔍 沉浸式搜证**: 每个证据背后都有一段隐藏的“微小说”，揭示案件真相。
*   **🌍 多关卡架构**: 易于扩展的关卡系统，支持快速创作新的剧本。

## 🛠️ 技术栈

*   **Framework**: Next.js 14 (App Router)
*   **Styling**: Tailwind CSS
*   **AI Integration**: OpenAI SDK (Node.js)
*   **State Management**: Zustand
*   **Icons**: Lucide React
