# 🚀 部署指南 (Deployment Guide)

本游戏基于 Next.js 开发，最推荐的部署方式是使用 **Vercel**（Next.js 的开发商）。

## 📦 准备工作

1.  确保你的代码已经提交到 GitHub/GitLab/Bitbucket 仓库。
2.  注册一个 [Vercel](https://vercel.com) 账号。

## ☁️ 一键部署到 Vercel

1.  登录 Vercel 控制台，点击 **"Add New..."** -> **"Project"**。
2.  选择你的 GitHub 仓库（`Cyber-Interrogator` 或类似名字）并点击 **Import**。
3.  **关键步骤：配置环境变量**
    在 "Configure Project" 页面，找到 **"Environment Variables"** 区域，添加以下变量：
    
    | Key | Value | 说明 |
    | :--- | :--- | :--- |
    | `OPENAI_API_KEY` | `sk-...` | 你的 OpenAI API 密钥 |
    | `OPENAI_BASE_URL` | `https://api.openai.com/v1` | (可选) 如果使用中转服务，请填写中转地址 |

    > ⚠️ **注意**: 如果没有配置 API Key，线上版本会自动回退到 Mock 模式（离线模式），AI 将只会重复固定的几句话。

4.  点击 **"Deploy"**。
5.  等待约 1 分钟，构建完成后，Vercel 会给你一个免费的域名（如 `cyber-interrogator.vercel.app`）。

## 🌍 多关卡扩展指南

本项目已重构为**多关卡架构**。要添加新关卡，无需修改核心代码，只需编辑配置文件：

### 1. 打开关卡配置文件
编辑 `lib/levels.tsx` 文件。

### 2. 添加新关卡数据
在 `LEVELS` 对象中添加一个新的键值对，格式如下：

```typescript
"level-2": {
  id: "level-2",
  title: "第二章：虚空幽灵",
  description: "空间站的求救信号...",
  evidenceDB: [
    // 在这里添加新的证据项
    {
      id: "blackbox",
      name: "黑匣子数据",
      desc: "最后一段通讯记录。",
      story: "...",
      icon: <Database size={14} />
    }
  ],
  systemPrompt: `
    你是 HAL-9000，一个空间站导航 AI。
    核心事实：...
    行为模式：...
  `
}
```

### 3. 发布更新
保存文件并推送到 GitHub，Vercel 会自动检测更新并重新部署。

## 🔧 本地测试

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问
http://localhost:3000
```
