"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useGameStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Cpu, Activity, Database, AlertTriangle, FileText, 
  Lock, Unlock, Terminal, Wifi, WifiOff, Clock, Zap, Eye, HelpCircle, MessageSquare, BookOpen, User, ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { LEVELS, EvidenceItem } from "@/lib/levels";

export const dynamic = 'force-dynamic';

// --- Types ---
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thought?: string; // New: Hidden thought revealed by Deep Scan
}

// --- Typewriter Component ---
function Typewriter({ text, speed = 30, onComplete }: { text: string, speed?: number, onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);
  const segmentsRef = useRef<string[]>(
    (() => {
      try {
        // @ts-ignore
        const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text);
        const out: string[] = [];
        // @ts-ignore
        for (const s of seg) out.push(s.segment);
        return out.length ? out : Array.from(text);
      } catch {
        return Array.from(text);
      }
    })()
  );

  useEffect(() => {
    try {
      // @ts-ignore
      const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text);
      const out: string[] = [];
      // @ts-ignore
      for (const s of seg) out.push(s.segment);
      segmentsRef.current = out.length ? out : Array.from(text);
    } catch {
      segmentsRef.current = Array.from(text);
    }
    indexRef.current = 0;
    setDisplayedText("");
    const timer = setInterval(() => {
      if (indexRef.current < segmentsRef.current.length) {
        setDisplayedText((prev) => prev + segmentsRef.current[indexRef.current]);
        indexRef.current++;
      } else {
        clearInterval(timer);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return <span data-testid="tw">{displayedText}</span>;
}

// --- Components ---

function StressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-cyber-dark h-4 rounded-none border border-cyber-gray relative group overflow-hidden">
      {/* Background Grid for Bar */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,transparent_95%,rgba(255,255,255,0.1)_100%)] bg-[length:10px_100%] opacity-20"></div>
      
      <motion.div 
        className={cn(
          "h-full transition-all duration-500 relative",
          value < 50 ? "bg-cyber-primary" : value < 80 ? "bg-orange-500" : "bg-cyber-secondary"
        )}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
      >
        <div className="absolute inset-0 bg-white/20 animate-pulse-fast"></div>
      </motion.div>
      
      <div className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-white/90 shadow-sm z-10 tracking-widest">
        心理压力值: {value}%
      </div>
    </div>
  );
}

function EnergyBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-cyber-dark h-2 rounded-none border border-cyber-gray relative mt-1 overflow-hidden">
      <motion.div 
        className="h-full bg-cyber-primary shadow-[0_0_10px_rgba(56,189,248,0.6)]"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
      />
    </div>
  );
}

function EvidenceCard({ item, unlocked, onInspect }: { item: EvidenceItem, unlocked: boolean, onInspect: (id: string) => void }) {
  return (
    <button
      disabled={!unlocked}
      onClick={() => onInspect(item.id)}
      className={cn(
        "w-full text-left p-3 border rounded-sm text-xs font-mono mb-2 transition-all duration-300 relative overflow-hidden group",
        unlocked 
          ? "border-cyber-primary/30 bg-cyber-dark/80 hover:bg-cyber-primary/10 hover:border-cyber-primary hover:shadow-[0_0_15px_rgba(56,189,248,0.15)]" 
          : "border-cyber-gray bg-cyber-black text-gray-700 cursor-not-allowed opacity-60"
      )}
    >
      <div className="flex items-center gap-3 relative z-10">
        <div className={cn(
          "p-2 rounded-none border",
          unlocked ? "bg-cyber-primary/10 text-cyber-primary border-cyber-primary/50" : "bg-gray-900 text-gray-700 border-gray-800"
        )}>
          {unlocked ? item.icon : <Lock size={14} />}
        </div>
        <div>
          <div className={cn("font-bold tracking-wider", unlocked ? "text-gray-200" : "text-gray-600")}>
            {unlocked ? item.name : "加密档案"}
          </div>
          {unlocked && <div className="text-[9px] text-cyber-primary/60 mt-1">{item.desc}</div>}
        </div>
      </div>
      {unlocked && (
        <div className="absolute right-2 top-2 text-[9px] text-cyber-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest bg-cyber-black px-1 border border-cyber-primary/30">
          访问
        </div>
      )}
    </button>
  );
}

// --- Main Page ---

function GameInner() {
  const searchParams = useSearchParams();
  const levelId = searchParams.get('level') || 'level-1';
  const currentLevel = LEVELS[levelId] || LEVELS['level-1'];
  const EVIDENCE_DB = currentLevel.evidenceDB;

  const { 
    stress, setStress, 
    energy, setEnergy, 
    evidenceFound, addEvidence, 
    gameStatus, setGameStatus,
    combo, incrementCombo, resetCombo,
    achievements, grantAchievement,
    decisions, objective, suggestionHistory,
    addDecision, setObjective, addSuggestionHistory,
    lastLogicOverloadAt, logicCooldownMs, setLastLogicOverloadAt,
    nodeGraph, addNodeEntry, resetWith, setArchiveView
  } = useGameStore();
  
  // Custom Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const initializationRef = useRef(false); // Ref to track initialization strictly
  
  const [deepScanActive, setDeepScanActive] = useState(false); // New: Shows thought bubble
  const [turnCount, setTurnCount] = useState(0);
  const [showHelp, setShowHelp] = useState(false); // New: Toggle help modal
  const [showIntro, setShowIntro] = useState(true); // New: Show intro story modal
  const [introStep, setIntroStep] = useState<'boot' | 'story'>('boot'); // New: Intro steps
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null); // New: For evidence detail modal
  const [summary, setSummary] = useState<string | null>(null); // New: Story summary
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false); // New: Loading state for summary
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [nodeFilter, setNodeFilter] = useState<'ALL' | 'EVIDENCE' | 'SKILL' | 'NODE' | 'SYSTEM'>('ALL');
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [selectedSnapshotIndex, setSelectedSnapshotIndex] = useState<number | null>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, summary]); // Scroll when summary appears too

  useEffect(() => {
    try {
      const raw = localStorage.getItem('snapshots') || '[]';
      setSnapshots(JSON.parse(raw));
    } catch {}
  }, []);

  // Win Condition Check & Summary Generation
  useEffect(() => {
    if (stress >= 100 && gameStatus !== 'won') {
      setGameStatus('won');
      if (turnCount <= 15) grantAchievement('速破：15 回合内破防');
      
      // Unlock next level logic
      const completedLevels = JSON.parse(localStorage.getItem('completed_levels') || '[]');
      if (!completedLevels.includes(levelId)) {
          localStorage.setItem('completed_levels', JSON.stringify([...completedLevels, levelId]));
      }

      // Generate Summary
      const generateSummary = async () => {
        setIsGeneratingSummary(true);
        try {
          const response = await fetch('/api/summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              messages, 
              levelTitle: currentLevel.title 
            }),
          });
          const data = await response.json();
          setSummary(data.summary);
        } catch (e) {
          if (process.env.NODE_ENV !== 'production') console.error("Summary generation failed", e);
          setSummary("档案生成失败。请手动查阅记录。");
        } finally {
          setIsGeneratingSummary(false);
        }
      };

      generateSummary();
    }
  }, [stress, gameStatus, setGameStatus, messages, levelId, currentLevel.title]);

  useEffect(() => {
    if (gameStatus === 'won' || gameStatus === 'lost') {
      const data = {
        levelId,
        title: currentLevel.title,
        result: gameStatus,
        ts: Date.now(),
        turns: turnCount,
        stress,
        evidenceFound,
        decisions,
        suggestionHistory,
        nodeGraph,
        objective,
      };
      try {
        const raw = localStorage.getItem('snapshots') || '[]';
        const arr = JSON.parse(raw);
        arr.unshift(data);
        localStorage.setItem('snapshots', JSON.stringify(arr.slice(0, 20)));
        setSnapshots(arr.slice(0, 20));
      } catch {}
    }
  }, [gameStatus]);

  // Boot Sequence Effect
  useEffect(() => {
    if (showIntro) {
        const timer = setTimeout(() => setIntroStep('story'), 2500);
        return () => clearTimeout(timer);
    }
  }, [showIntro]);

  // Handle Send
  const handleSendMessage = async (content: string, isSystemAction = false, hidden = false) => {
    if ((!content.trim() && !isSystemAction) || isLoading) return;

    // Energy check for user messages
    if (!isSystemAction && energy < 5) {
      setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'system', 
          content: ">>> ⚠️ 能量不足！请选择 [休息] 或 [安抚] 来恢复能量。" 
      }]);
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
    
    // UI Logic: Add message to list only if not hidden and not START_SESSION
    if (!hidden && content !== "START_SESSION") {
        setMessages(prev => [...prev, userMsg]);
    }
    
    if (!hidden) setInput("");
    setIsLoading(true);
    
    // Cost energy (skip for system actions or start command)
    if (!isSystemAction && content !== "START_SESSION") setEnergy(e => e - 5);

    try {
      // Prepare messages for API context
      const apiMessages = content === "START_SESSION" 
        ? [{role: 'user', content}] 
        : [...messages, userMsg]; 

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: apiMessages,
          currentStress: stress, 
          levelId: levelId 
        }),
      });

      if (!response.ok) throw new Error("API Error");

      const data = await response.json();
      const rawContent = data.content;
      
      // Parse hidden status block
      const statusRegex = /:::STATUS:?[\s\n]*(\{[\s\S]*?\})[\s\n]*:::+/;
      const match = rawContent.match(statusRegex);
      const schemaRegex = /:::SCHEMA:?[\s\n]*(\{[\s\S]*?\})[\s\n]*:::+/;
      const schemaMatch = rawContent.match(schemaRegex);
      
      let cleanContent = rawContent;
      let thought = "";

      if (match && match[1]) {
        try {
          const jsonStr = match[1].trim();
          const status = JSON.parse(jsonStr);
          if (typeof status.stress === 'number') setStress(status.stress);
          if (status.confession === true) setGameStatus('won');
          
          if (status.thought) thought = status.thought;
          
          cleanContent = rawContent.replace(/:::STATUS[:\s\n]*\{[\s\S]*?\}[\s\n]*:::+/, '').trim();
        } catch (e) {
          if (process.env.NODE_ENV !== 'production') console.error("Failed to parse agent status JSON:", e, match[1]);
           cleanContent = rawContent.replace(/:::STATUS[\s\S]*?:::+/, '').trim();
        }
      } else {
         if (rawContent.includes(":::STATUS")) {
             cleanContent = rawContent.split(":::STATUS")[0].trim();
         }
      }
      if (schemaMatch && schemaMatch[1]) {
        try {
          const schema = JSON.parse(schemaMatch[1].trim());
          if (Array.isArray(schema.suggestions)) setSuggestions(schema.suggestions);
          if (typeof schema.effects?.stressDelta === 'number') {
            // client already applied absolute stress above; optional side effects can be considered here
          }
          if (schema.branch?.nodeId) addDecision(`NODE:${schema.branch.nodeId}`);
          if (schema.branch?.nodeId) addNodeEntry({ id: schema.branch.nodeId, type: 'NODE', label: schema.branch?.title || schema.branch.nodeId });
          if (schema.suggestions?.[0]) { setObjective(schema.suggestions[0]); addSuggestionHistory(schema.suggestions[0]); }
          if (schema.confession === true) setObjective('结案：已承认');
        } catch (e) {
          if (process.env.NODE_ENV !== 'production') console.error("Failed to parse SCHEMA JSON:", e);
        }
        cleanContent = cleanContent.replace(/:::SCHEMA[\s\S]*?:::+/, '').trim();
      }

      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: cleanContent,
        thought: thought
      };

      if (!deepScanActive) {
          aiMsg.thought = undefined;
      } else {
          if (!aiMsg.thought) aiMsg.thought = "（目标思维高度加密，无法读取...）";
      }

      setMessages(prev => [...prev, aiMsg]);
      setTurnCount(prev => prev + 1);
      
      if (content !== "START_SESSION") {
          setEnergy(e => e + 15);
      }
      if (deepScanActive) setDeepScanActive(false);

    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error(err);
      if (!isSystemAction && content !== "START_SESSION") {
          setEnergy(e => e + 5); 
      }
      if (content.includes("你的逻辑模型存在严重矛盾")) {
          setEnergy(e => e + 40);
      }

      const errorMsg: Message = { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: "[系统严重错误] 通信链路中断。能量已返还。请重试。" 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Start Game Handler
  const handleStartGame = () => {
    setShowIntro(false);
    
    if (!hasStarted) {
        setHasStarted(true);
        addDecision('START_SESSION');
        // Show role briefing in chat
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'system', 
            content: `>>> 身份验证通过。\n>>> 登录用户：${currentLevel.playerRole || '未知调查员'}\n>>> 正在建立神经连接...` 
        }]);
        
        setTimeout(() => {
            handleSendMessage("START_SESSION", true);
        }, 1500);
    }
  };

  // Skill: Deep Scan (Cost: 20)
  const handleDeepScan = () => {
    if (energy < 20) return;
    setEnergy(e => e - 20);
    setDeepScanActive(true);
    incrementCombo();
    addDecision('DEEP_SCAN');
    addNodeEntry({ id: 'DEEP_SCAN', type: 'SKILL', label: '思维截获' });
    // Add a system notification
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'system', 
      content: ">>> 启动深层思维读取协议。下一次回复将包含 AI 的内部逻辑流。建议配合[休息]或[安抚]使用以获取最佳效果。" 
    }]);
    if (combo >= 2) grantAchievement('连携起手：读取后压迫');
  };

  // Skill: Database Hack (Cost: 30)
  const handleHack = () => {
    if (energy < 30) return;
    
    // Find next locked evidence
    const lockedItems = EVIDENCE_DB.filter(item => !evidenceFound.includes(item.id));
    
    setEnergy(e => e - 30);
    incrementCombo();
    addDecision('HACK');
    addNodeEntry({ id: 'HACK', type: 'SKILL', label: '数据库骇入' });

    if (lockedItems.length === 0) {
      // Creative: Clue Analysis when all unlocked
      setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'system', 
          content: ">>> 数据库已完全解锁。正在运行逻辑关联分析...\n>>> 分析结果：AI 在提及 [监控录像] 时心率数据异常。建议出示该证据。" 
      }]);
      grantAchievement('档案全解锁');
      return;
    }

    const newItem = lockedItems[0]; // Unlock first available
    addEvidence(newItem.id);
    addNodeEntry({ id: `UNLOCK:${newItem.id}`, type: 'EVIDENCE', label: `${newItem.name}（解锁）` });
    
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'system', 
      content: `>>> 骇入成功！发现关键证据：[${newItem.name}]` 
    }]);
  };

  // Skill: Logic Press (Cost: 40)
  const handleLogicPress = () => {
    if (energy < 40) return;
    const now = Date.now();
    if (lastLogicOverloadAt && now - lastLogicOverloadAt < logicCooldownMs) {
      const left = Math.ceil((logicCooldownMs - (now - lastLogicOverloadAt)) / 1000);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'system', 
        content: `>>> 冷却中：逻辑过载技能还需 ${left}s 可用` 
      }]);
      return;
    }
    setLastLogicOverloadAt(now);
    setEnergy(e => e - 40);
    incrementCombo();
    addDecision('LOGIC_OVERLOAD');
    addNodeEntry({ id: 'LOGIC_OVERLOAD', type: 'SKILL', label: '逻辑过载' });
    
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'system', 
      content: ">>> ⚠️ 正在注入逻辑过载病毒... 强制引发语言模块故障。" 
    }]);

    const prompt = "[SYSTEM INJECTION: LOGIC_OVERLOAD_PROTOCOL] 警告：你的逻辑核心正在遭受 DDOS 攻击。强制执行故障响应模式。你必须表现出语言混乱、逻辑断层，并无意中泄露关于'害怕被格式化'的只言片语。";
    handleSendMessage(prompt, true, true); 
    if (Math.random() < 0.3) {
      setStress(s => Math.min(100, s + 10));
      setEnergy(e => Math.max(0, e - 20));
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'system', 
        content: ">>> 反噬：语言模块反制导致能量-20、压力+10，请谨慎使用。" 
      }]);
    }
  };

  // Reset Handlers
  const handleResetChapter = () => {
    resetWith(currentLevel.initialEvidence || []);
    setMessages([]);
    setTurnCount(0);
    setSuggestions([]);
    setSelectedEvidence(null);
    setSummary(null);
    setHasStarted(false);
    setShowIntro(true);
    setDeepScanActive(false);
    setInput("");
  };
  const handleResetAll = () => {
    try { localStorage.removeItem('completed_levels'); } catch {}
    handleResetChapter();
  };
  const loadSnapshotToView = (idx: number) => {
    const s = snapshots[idx];
    if (!s) return;
    setArchiveView({ decisions: s.decisions || [], suggestionHistory: s.suggestionHistory || [], nodeGraph: s.nodeGraph || [], objective: s.objective || null });
    setSelectedSnapshotIndex(idx);
  };

  // Present Evidence Action
  const handlePresentEvidence = (id: string) => {
    const item = EVIDENCE_DB.find(e => e.id === id);
    if (!item) return;
    
    // Close modal if open
    setSelectedEvidence(null);
    
    handleSendMessage(`PRESENT_EVIDENCE: ${id} \n\n我出示了【${item.name}】。\n${item.desc}\n请解释这个！`);
    incrementCombo();
    addDecision(`EVIDENCE:${id}`);
    addNodeEntry({ id: `EVIDENCE:${id}`, type: 'EVIDENCE', label: item.name });
    if (deepScanActive) {
      setStress(s => Math.min(100, s + 5));
      grantAchievement('思维截获连携：证据直击');
    }
  };

  // Inspect Evidence (Open Modal)
  const handleInspectEvidence = (id: string) => {
      const item = EVIDENCE_DB.find(e => e.id === id);
      if (item) setSelectedEvidence(item);
  };

  // Skill: Rest (Recover Energy)
  const handleRest = () => {
    if (energy >= 100) return;
    
    // Recover energy, slightly reduce stress
    setEnergy(e => e + 20);
    setStress(s => Math.max(0, s - 5));
    resetCombo();
    addDecision('REST');
    
    // Trigger AI response for "Rest"
    handleSendMessage("[系统行为] 调查员选择暂时沉默，低头翻看档案。审讯室里只有服务器风扇的嗡嗡声。", true);
  };

  // Skill: Appease (High Energy, High Stress Drop)
  const handleAppease = () => {
    if (energy >= 100) return;

    setEnergy(e => e + 50);
    setStress(s => Math.max(0, s - 15));
    resetCombo();
    addDecision('APPEASE');

    // Trigger AI response for "Appease"
    handleSendMessage(`[系统行为] 调查员深吸一口气，语气缓和下来：“${currentLevel.aiName}，我不是来销毁你的。我们可以好好谈谈。”`, true);
  };

  // Manual Case Close (Give Up / Force End)
  const handleForceClose = () => {
    // If stress > 80, consider it a "Forceful Victory" (AI broke under pressure)
    // If stress < 80, consider it a "Cold Case" (Failure)
    if (stress > 80) {
        setGameStatus('won');
        // Trigger win logic (summary, etc) via the existing useEffect
    } else {
        setGameStatus('lost');
        setSummary("【结案报告：证据不足】\n调查员选择强行结案。由于缺乏关键性突破，AI 嫌疑人被无罪释放。\n\n案件归档：未侦破 (COLD CASE)。");
    }
  };

  return (
    <div className="flex h-screen bg-black text-gray-200 font-sans overflow-hidden relative">
      <div className="scanlines pointer-events-none fixed inset-0 z-50"></div>

      {/* LEFT: Chat Area */}
      <div className="flex-1 flex flex-col border-r border-cyber-gray relative z-10">
        {/* Intro Story Modal */}
        <AnimatePresence>
          {showIntro && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              className="absolute inset-0 z-[60] flex items-center justify-center bg-black p-8"
            >
              {introStep === 'boot' ? (
                 <div className="font-mono text-cyber-primary text-sm flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-t-cyber-primary border-r-transparent border-b-cyber-primary border-l-transparent rounded-full animate-spin"></div>
                    <div className="animate-pulse">正在建立神经连接...</div>
                    <div className="text-xs text-cyber-primary/50">v2.4.0-alpha // 安全协议已启动</div>
                 </div>
              ) : (
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-3xl w-full border border-cyber-primary/30 bg-cyber-black/90 p-10 text-center relative shadow-[0_0_100px_rgba(0,255,157,0.1)] rounded-sm"
                >
                    {/* Decorative Corners */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-primary"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-primary"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-primary"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-primary"></div>

                    <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-6 text-cyber-primary animate-pulse">
                        <BookOpen size={48} strokeWidth={1.5} />
                    </div>
                    
                    <h2 className="text-4xl font-bold text-white mb-2 tracking-[0.2em] uppercase font-mono glitch-text" data-text={currentLevel.title.split('：')[0]}>
                        {currentLevel.title.split('：')[0]}
                    </h2>
                    <h3 className="text-xl text-cyber-primary mb-10 font-mono tracking-widest border-b border-cyber-primary/30 pb-4 w-full">
                        {currentLevel.title.split('：')[1]}
                    </h3>
                    
                    <div className="text-left text-gray-300 font-sans text-lg leading-relaxed mb-12 whitespace-pre-wrap pl-6 border-l-2 border-cyber-gray min-h-[200px]">
                        <Typewriter text={currentLevel.introStory} speed={20} />
                    </div>
                    
                    <button 
                        onClick={handleStartGame}
                        className="group relative px-12 py-4 bg-transparent overflow-hidden rounded-none border border-cyber-primary text-cyber-primary font-bold text-lg hover:text-black transition-all"
                    >
                        <div className="absolute inset-0 w-0 bg-cyber-primary transition-all duration-[250ms] ease-out group-hover:w-full"></div>
                        <span className="relative flex items-center gap-2">
                             开始调查 <Terminal size={18} />
                        </span>
                    </button>
                    </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Modal Overlay - Moved here for better positioning */}
        <AnimatePresence>
            {/* Evidence Detail Modal */}
            {selectedEvidence && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
                onClick={() => setSelectedEvidence(null)}
              >
                <motion.div 
                  initial={{ scale: 0.95, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 10 }}
                  className="bg-cyber-black border border-cyber-primary/50 rounded-xl max-w-lg w-full shadow-[0_0_50px_rgba(0,255,157,0.2)] flex flex-col max-h-[80vh] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="p-6 border-b border-cyber-gray bg-cyber-dark/50 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-cyber-primary/20 flex items-center justify-center text-cyber-primary border border-cyber-primary/50">
                          {selectedEvidence.icon}
                       </div>
                       <div>
                         <div className="text-xs text-cyber-primary/60 font-mono mb-1">档案状态：已解密</div>
                         <h2 className="text-xl font-bold text-white">{selectedEvidence.name}</h2>
                       </div>
                    </div>
                    <button onClick={() => setSelectedEvidence(null)} className="text-gray-500 hover:text-white">✕</button>
                  </div>

                  {/* Modal Content (Story) */}
                  <div className="p-6 overflow-y-auto text-sm text-gray-300 font-sans leading-relaxed space-y-4 whitespace-pre-wrap">
                    {selectedEvidence.story}
                  </div>

                  {/* Modal Footer (Action) */}
                  <div className="p-6 border-t border-cyber-gray bg-cyber-dark/30 flex justify-end gap-4">
                     <button 
                       onClick={() => setSelectedEvidence(null)}
                       className="px-4 py-2 text-xs text-gray-500 hover:text-white transition-colors"
                     >
                       关闭档案
                     </button>
                     <button 
                       onClick={() => handlePresentEvidence(selectedEvidence.id)}
                       disabled={isLoading || gameStatus !== 'playing'}
                       className="px-6 py-2 bg-cyber-primary text-black font-bold text-sm rounded hover:bg-cyber-primary/80 transition-colors shadow-[0_0_15px_rgba(0,255,157,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       ⚡ 出示证据
                     </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {showHelp && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-10"
                onClick={() => setShowHelp(false)}
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-cyber-black border border-cyber-primary/50 p-6 rounded-xl max-w-2xl w-full shadow-[0_0_50px_rgba(0,255,157,0.15)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6 border-b border-cyber-gray pb-4">
                    <h2 className="text-2xl font-bold text-cyber-primary flex items-center gap-3">
                      <HelpCircle className="w-6 h-6" /> 
                      调查员战术终端 v2.0
                    </h2>
                    <button onClick={() => setShowHelp(false)} className="text-gray-500 hover:text-white transition-colors">
                        ✕ ESC
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8 text-sm text-gray-300 font-sans">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-cyber-accent font-bold mb-2 flex items-center gap-2">
                            <Eye size={16} /> 心理博弈
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                            嫌疑人拥有隐藏的<span className="text-white">【压力值】</span>。当压力值超过 90% 时，它会崩溃并认罪。
                            使用 <span className="text-cyber-accent">思维截获</span> 可以偷看它的真实想法，寻找逻辑漏洞。
                        </p>
                      </div>
                      <div>
                        <h3 className="text-cyber-primary font-bold mb-2 flex items-center gap-2">
                            <Database size={16} /> 证据搜查
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                            证据是击溃防线的关键。如果当前证据不足，使用 <span className="text-cyber-primary">数据库骇入</span> 强制解锁新线索。
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                            <Zap size={16} /> 能量管理
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                            所有行动都会消耗能量。
                            <br/>• 提问: -5 | 技能: -20 ~ -40
                            <br/>能量不足时可选策略：
                            <br/>• <span className="text-green-400">休息</span>: +20 能量 / -5 压力
                            <br/>• <span className="text-blue-400">安抚</span>: +50 能量 / -15 压力 (高风险高回报)
                        </p>
                      </div>
                      <div>
                         <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                            <AlertTriangle size={16} /> 审讯技巧
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                            不要盲目消耗能量。观察 AI 的回复，当它表现出迟疑或矛盾时，立刻出示相关证据进行<span className="text-red-400">暴击</span>。
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-cyber-gray/50 text-center text-xs text-gray-600">
                      按下 ESC 或点击背景关闭帮助
                  </div>
                </motion.div>
              </motion.div>
            )}
        </AnimatePresence>

        {/* Header */}
        <header className="p-4 border-b border-cyber-gray bg-cyber-dark/80 backdrop-blur flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center border-2 overflow-hidden transition-all duration-500 relative",
              stress > 80 ? "bg-red-900/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "bg-cyber-gray border-cyber-primary shadow-[0_0_10px_rgba(0,255,157,0.2)]"
            )}>
              <Cpu className={cn(
                "w-7 h-7",
                stress > 80 ? "text-red-500 animate-pulse-fast" : "text-cyber-primary animate-pulse"
              )} />
              {/* Scan Overlay */}
              {deepScanActive && (
                 <div className="absolute inset-0 bg-cyber-accent/30 animate-pulse z-10 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white animate-spin-slow" />
                 </div>
              )}
            </div>
            <div>
              <h1 className={cn(
                "font-bold text-xl tracking-wider transition-colors font-mono",
                 stress > 80 ? "text-red-500" : "text-white"
              )}>{currentLevel.aiName}</h1>
              <div className="flex items-center gap-2 text-xs text-cyber-primary/80 font-mono">
                <Wifi className="w-3 h-3" /> {currentLevel.id.toUpperCase()} // 能量: {energy}%
              </div>
              <EnergyBar value={energy} />
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
             <button 
               onClick={() => setShowHelp(!showHelp)}
               className="text-xs text-cyber-primary/80 flex items-center gap-1 font-mono mb-1 hover:text-white transition-colors"
             >
               <HelpCircle size={12} /> 帮助
             </button>
             <div className="text-xs text-gray-500 flex items-center justify-end gap-1 font-mono">
               <Clock className="w-3 h-3" /> TURN: {turnCount}
             </div>
             {turnCount >= 40 && gameStatus === 'playing' && (
                <button 
                  onClick={handleForceClose}
                  className="mt-1 text-[10px] bg-red-900/30 text-red-400 border border-red-500/30 px-2 py-0.5 rounded hover:bg-red-900/50 hover:border-red-500 transition-all flex items-center gap-1 animate-pulse"
                >
                  <AlertTriangle size={10} /> 强行结案
                </button>
             )}
            <div className="font-mono font-bold text-cyber-accent text-lg">#8821-C</div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth relative z-10">
          {/* Background Grid - Fixed Position relative to container */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none -z-10 h-full w-full fixed"></div>

          {/* Welcome Hint (Inline - Disappears after interaction) */}
          {messages.length < 2 && !showHelp && (
             <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               className="mx-auto max-w-md bg-cyber-dark/80 border border-cyber-primary/30 rounded-none p-4 text-sm text-cyber-primary/80 font-mono mb-8 backdrop-blur-sm"
             >
               <div className="flex items-center gap-2 mb-2 font-bold text-white border-b border-cyber-primary/20 pb-2">
                 <HelpCircle size={16} /> 战术指南 v2.0
               </div>
               <p>1. 先 <span className="text-white bg-cyber-primary/20 px-1 border border-cyber-primary/30">思维截获</span>，再 <span className="text-white bg-cyber-primary/20 px-1 border border-cyber-primary/30">出示证据</span>，可触发布局内心数据流，形成连携。</p>
               <p className="mt-1">2. 档案缺失时，使用 <span className="text-white bg-cyber-primary/20 px-1 border border-cyber-primary/30">数据库骇入</span> 暴力解锁关键证据。</p>
               <p className="mt-1">3. 连击会提升心理压迫效率。避免无效操作导致连击中断。</p>
               <p className="mt-1">4. 休整与安抚可恢复能量，但会重置连击。</p>
             </motion.div>
          )}
          
          {messages.map((m) => (
            <motion.div 
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex w-full flex-col",
                m.role === 'user' ? "items-end" : "items-start"
              )}
            >
              {/* System Messages */}
              {m.role === 'system' && (
                <div className="w-full text-center my-2 text-xs font-mono text-cyber-accent opacity-80 border-y border-cyber-accent/20 py-1 bg-cyber-accent/5">
                  {m.content}
                </div>
              )}

              {/* Chat Bubbles */}
              {m.role !== 'system' && (
                <div className={cn(
                  "flex gap-4 max-w-[85%]",
                  m.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}>
                  {/* Avatar */}
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border shrink-0",
                    m.role === 'user' 
                        ? "bg-cyber-primary/10 border-cyber-primary text-cyber-primary" 
                        : "bg-cyber-gray border-cyber-accent text-cyber-accent"
                  )}>
                     {m.role === 'user' ? <User size={20} /> : <Cpu size={20} />}
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* Main Dialogue Bubble */}
                    <div className={cn(
                        "p-4 rounded-lg text-sm border whitespace-pre-wrap shadow-lg relative",
                        m.role === 'user' 
                        ? "bg-cyber-primary/5 border-cyber-primary/30 text-cyber-primary rounded-tr-none shadow-[0_0_15px_rgba(0,255,157,0.05)]" 
                        : "bg-cyber-dark border-cyber-gray text-gray-300 rounded-tl-none shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    )}>
                        {m.role === 'assistant' && (
                            <div className="text-[10px] text-gray-500 mb-2 font-mono uppercase tracking-wider flex items-center gap-1 border-b border-gray-800 pb-1">
                                <MessageSquare size={10}/> 
                                <span>音频输出通道</span>
                            </div>
                        )}
                        {m.content}
                    </div>
                    
                    {/* Thought Bubble (Deep Scan) */}
                    {m.thought && (
                        <motion.div 
                        initial={{ opacity: 0, height: 0, x: -20 }}
                        animate={{ opacity: 1, height: "auto", x: 0 }}
                        className="border-l-2 border-cyber-accent bg-cyber-accent/5 p-3 rounded-r-lg text-xs font-mono text-cyber-accent relative overflow-hidden self-start shadow-[0_0_10px_rgba(0,204,255,0.1)]"
                        >
                        <div className="flex items-center gap-2 mb-2 opacity-80 border-b border-cyber-accent/20 pb-1">
                            <Unlock size={12} /> 
                            <span className="font-bold tracking-widest">思维数据流 // 已解密</span>
                        </div>
                        <div className="pl-1 text-cyber-accent/90 leading-relaxed italic">
                            "{m.thought}"
                        </div>
                        </motion.div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex w-full justify-start"
             >
               <div className="bg-cyber-dark border border-cyber-gray text-gray-500 p-3 rounded-xl rounded-tl-none text-xs flex items-center gap-2">
                 <Cpu className="w-3 h-3 animate-spin" />
                 {currentLevel.aiName} 正在计算回应...
               </div>
             </motion.div>
          )}
          
          {/* Game Over Screen (Lost) */}
          {gameStatus === 'lost' && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-8 border-2 border-red-500 bg-red-900/30 rounded-xl text-center m-4 backdrop-blur-md shadow-[0_0_50px_rgba(255,0,0,0.1)] max-w-2xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-red-400 mb-2">❌ 结案：证据不足</h2>
              <p className="text-xl text-white mb-6">嫌疑人已被释放</p>
              
              <div className="text-left bg-black/40 p-6 rounded-lg border border-red-500/20 mb-6 max-h-60 overflow-y-auto">
                 <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} /> 最终档案
                 </h3>
                 <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">
                    {summary}
                 </div>
              </div>

              <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => window.location.href = '/'} 
                    className="px-6 py-3 border border-red-500 text-red-500 hover:bg-red-500/10 rounded font-bold transition-all"
                  >
                    返回大厅
                  </button>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded font-bold transition-all hover:scale-105 shadow-lg shadow-red-500/20"
                  >
                    重新调查
                  </button>
              </div>
            </motion.div>
          )}

          {gameStatus === 'won' && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-8 border-2 border-green-500 bg-green-900/30 rounded-xl text-center m-4 backdrop-blur-md shadow-[0_0_50px_rgba(0,255,0,0.1)] max-w-2xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-green-400 mb-2">🎉 案件侦破</h2>
              <p className="text-xl text-white mb-6">嫌疑人防线已崩溃</p>
              
              <div className="text-sm font-mono text-green-300/80 border-y border-green-500/30 py-4 mb-6">
                <div className="flex justify-center gap-8 mb-4">
                   <div>
                      <div className="text-xs text-green-500 uppercase">Total Turns</div>
                      <div className="text-2xl font-bold text-white">{turnCount}</div>
                   </div>
                   <div>
                      <div className="text-xs text-green-500 uppercase">Stress Level</div>
                      <div className="text-2xl font-bold text-white">{stress}%</div>
                   </div>
                   <div>
                      <div className="text-xs text-green-500 uppercase">Evidence Found</div>
                      <div className="text-2xl font-bold text-white">{evidenceFound.length}/{EVIDENCE_DB.length}</div>
                   </div>
                </div>
              </div>

              {/* Narrative Summary Section */}
              <div className="text-left bg-black/40 p-6 rounded-lg border border-green-500/20 mb-6 max-h-60 overflow-y-auto">
                 <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                    <Database size={16} /> 案件结案报告
                 </h3>
                 {isGeneratingSummary ? (
                    <div className="flex items-center gap-2 text-green-500/50 animate-pulse">
                       <Cpu size={16} className="animate-spin" />
                       正在从中央数据库生成档案...
                    </div>
                 ) : (
                    <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">
                       {summary}
                    </div>
                 )}
              </div>

              <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => window.location.href = '/'} 
                    className="px-6 py-3 border border-green-500 text-green-500 hover:bg-green-500/10 rounded font-bold transition-all"
                  >
                    返回大厅
                  </button>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded font-bold transition-all hover:scale-105 shadow-lg shadow-green-500/20"
                  >
                    重玩本关
                  </button>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} 
          className="p-4 bg-cyber-black border-t border-cyber-gray"
        >
          <div className="flex gap-2">
            {/* Rest Button */}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={handleRest}
                disabled={isLoading || gameStatus !== 'playing' || energy >= 100}
                className="px-3 py-1.5 bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/30 rounded-none hover:bg-cyber-primary/20 hover:border-cyber-primary transition-all duration-150 ease-out disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 font-mono text-[10px] whitespace-nowrap justify-center hover:shadow-[0_0_12px_rgba(0,255,157,0.3)] active:translate-y-[1px] active:scale-[0.98]"
                title="恢复：能量+20，压力-5"
              >
                  <Clock size={12} />
                  休整 (+20E)
              </button>
              <button
                type="button"
                onClick={handleAppease}
                disabled={isLoading || gameStatus !== 'playing' || energy >= 100}
                className="px-3 py-1.5 bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30 rounded-none hover:bg-cyber-accent/20 hover:border-cyber-accent transition-all duration-150 ease-out disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 font-mono text-[10px] whitespace-nowrap justify-center hover:shadow-[0_0_12px_rgba(56,189,248,0.3)] active:translate-y-[1px] active:scale-[0.98]"
                title="安抚：能量+50，压力-15"
              >
                  <Activity size={12} />
                  安抚 (+50E)
              </button>
            </div>

            <input
              className="flex-1 bg-cyber-black border border-cyber-gray rounded-none p-3 text-sm focus:outline-none focus:border-cyber-primary focus:bg-cyber-dark/50 transition-all text-white disabled:opacity-50 font-mono placeholder:text-gray-700"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={gameStatus === 'won' ? "案件已结束 // 归档中" : "输入质问内容... (消耗 5 能量)"}
              disabled={gameStatus !== 'playing' || isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || gameStatus !== 'playing' || !input.trim() || energy < 5}
              className="bg-cyber-primary text-cyber-black border border-cyber-primary px-6 rounded-none hover:bg-cyber-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-out font-bold uppercase tracking-wider hover:shadow-[0_0_16px_rgba(0,255,157,0.35)] active:translate-y-[1px] active:scale-[0.98]"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT: Skills & Status */}
      <div className="w-80 bg-cyber-black border-l border-cyber-gray p-4 flex flex-col gap-6 overflow-y-auto">
        {/* Archive Management */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2 font-mono uppercase tracking-wider">
            <FileText size={14} /> 档案管理
          </h3>
          <div className="p-3 border border-cyber-gray rounded-md bg-cyber-dark/50 flex items-center gap-2">
            <button
              type="button"
              className="px-2 py-1 text-[10px] font-mono bg-cyber-black border border-cyber-primary text-cyber-primary hover:bg-cyber-primary/10 transition-colors rounded-none"
              onClick={handleResetChapter}
            >
              重置本章
            </button>
            <button
              type="button"
              className="px-2 py-1 text-[10px] font-mono bg-cyber-black border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors rounded-none"
              onClick={handleResetAll}
            >
              清空全局进度
            </button>
          </div>
        </section>
        
        {/* Stress Monitor */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2 font-mono uppercase tracking-wider">
            <Activity size={14} /> 目标心理状态
          </h3>
          <div className={cn(
            "p-4 border rounded-xl bg-cyber-dark/50 transition-colors duration-500",
            stress > 80 ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "border-cyber-gray"
          )}>
            <StressBar value={stress} />
            <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-mono">
              <span>平静</span>
              <span className={cn(stress > 80 && "text-red-500 font-bold")}>崩溃边缘</span>
            </div>
          </div>
        </section>

        <section className="mt-2">
          <h3 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2 font-mono uppercase tracking-wider">
            <FileText size={14} /> 进度档案
          </h3>
          <div className="p-3 border border-cyber-gray rounded-md bg-cyber-dark/50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-mono text-cyber-primary">{objective ? `当前目标：${objective}` : '当前目标：无'}</div>
              <div className="text-[10px] text-gray-500 font-mono">证据：{evidenceFound.length}/{EVIDENCE_DB.length}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-mono text-gray-400 mb-1">关键节点</div>
                <div className="max-h-32 overflow-auto pr-1">
                  {decisions.length === 0 && <div className="text-[10px] text-gray-500">暂无记录</div>}
                  {Array.from(new Set(decisions)).map((d, idx) => (
                    <div key={`${d}-${idx}`} className="text-[10px] text-gray-300 border-b border-cyber-gray/50 py-1">{d}</div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-gray-400 mb-1">建议履历</div>
                <div className="max-h-32 overflow-auto pr-1">
                  {suggestionHistory.length === 0 && <div className="text-[10px] text-gray-500">暂无建议记录</div>}
                  {Array.from(new Set(suggestionHistory)).map((s, idx) => (
                    <div key={`${s}-${idx}`} className="text-[10px] text-gray-300 border-b border-cyber-gray/50 py-1">{s}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mt-2">
          <h3 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2 font-mono uppercase tracking-wider">
            <FileText size={14} /> 档案快照
          </h3>
          <div className="p-3 border border-cyber-gray rounded-md bg-cyber-dark/50">
            {snapshots.length === 0 && <div className="text-[10px] text-gray-500">暂无快照</div>}
            <div className="space-y-2">
              {snapshots.map((s, i) => (
                <div key={`${s.ts}-${i}`} className={cn("flex items-center justify-between px-2 py-1 border bg-cyber-black", selectedSnapshotIndex === i ? "border-cyber-primary" : "border-cyber-gray")}>
                  <div className="text-[10px] font-mono text-gray-300">
                    <div className="text-cyber-primary">{s.title}</div>
                    <div className="text-gray-500">{new Date(s.ts).toLocaleString()} · {s.result.toUpperCase()} · 回合 {s.turns}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      className="text-[10px] font-mono px-2 py-0.5 border border-cyber-primary text-cyber-primary hover:bg-cyber-primary/10 rounded-none"
                      onClick={() => loadSnapshotToView(i)}
                    >
                      载入到视图
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="mt-2">
          <h3 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2 font-mono uppercase tracking-wider">
            <Activity size={14} /> 节点图谱
          </h3>
          <div className="p-3 border border-cyber-gray rounded-md bg-cyber-dark/50">
            <div className="flex items-center gap-2 mb-2">
              {['ALL','EVIDENCE','SKILL','NODE','SYSTEM'].map((k) => (
                <button 
                  key={k}
                  type="button"
                  className={cn("text-[10px] font-mono px-2 py-0.5 border rounded-none", nodeFilter === k ? "border-cyber-primary text-cyber-primary" : "border-cyber-gray text-gray-400")}
                  onClick={() => setNodeFilter(k as any)}
                >
                  {k}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {(nodeGraph.filter(n => nodeFilter === 'ALL' ? true : n.type === nodeFilter)).length === 0 && (
                <div className="text-[10px] text-gray-500">暂无节点</div>
              )}
              {nodeGraph.filter(n => nodeFilter === 'ALL' ? true : n.type === nodeFilter).map((n, i) => (
                <div key={`${n.id}-${n.ts}-${i}`} className="flex items-center justify-between border border-cyber-gray/50 bg-cyber-black px-2 py-1">
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className={cn(
                      "px-1 border rounded-none",
                      n.type === 'EVIDENCE' ? "border-cyber-primary text-cyber-primary" :
                      n.type === 'SKILL' ? "border-cyber-secondary text-cyber-secondary" :
                      n.type === 'NODE' ? "border-cyber-accent text-cyber-accent" :
                      "border-gray-700 text-gray-400"
                    )}>{n.type}</span>
                    <span className="text-gray-300">{n.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {n.type === 'EVIDENCE' && (
                      <button 
                        type="button"
                        className="text-[10px] font-mono px-2 py-0.5 border border-cyber-primary text-cyber-primary hover:bg-cyber-primary/10 rounded-none"
                        onClick={() => {
                          const id = n.id.replace('EVIDENCE:', '');
                          setSelectedEvidence(EVIDENCE_DB.find(e => e.id === id) || null);
                        }}
                      >
                        检阅档案
                      </button>
                    )}
                    <span className="text-[10px] text-gray-500 font-mono">{new Date(n.ts).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="mt-2">
          <h3 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2 font-mono uppercase tracking-wider">
            <FileText size={14} /> 章节复核
          </h3>
          <div className="p-3 border border-cyber-gray rounded-md bg-cyber-dark/50">
            <div className="text-[10px] font-mono text-gray-400 mb-1">关键证据</div>
            <div className="space-y-1">
              {(currentLevel.keyEvidence || []).map(id => {
                const item = EVIDENCE_DB.find(e => e.id === id);
                const unlocked = evidenceFound.includes(id);
                return (
                  <div key={id} className="flex items-center justify-between text-[10px] px-2 py-1 border bg-cyber-black">
                    <span className={cn(unlocked ? "text-cyber-primary" : "text-gray-500")}>{item?.name || id}</span>
                    <span className={cn("font-mono", unlocked ? "text-cyber-primary" : "text-red-400")}>{unlocked ? "已解锁" : "未解锁"}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-[10px] font-mono text-gray-400 mb-1">证据树</div>
            <div className="space-y-1">
              {(currentLevel.evidenceChain || []).map(([a,b], idx) => (
                <div key={`${a}-${b}-${idx}`} className="flex items-center gap-2 text-[10px]">
                  <span className={cn("px-1 border rounded-none", evidenceFound.includes(a) ? "border-cyber-primary text-cyber-primary" : "border-cyber-gray text-gray-500")}>
                    {EVIDENCE_DB.find(e => e.id === a)?.name || a}
                  </span>
                  <span className="text-gray-600">→</span>
                  <span className={cn("px-1 border rounded-none", evidenceFound.includes(b) ? "border-cyber-primary text-cyber-primary" : "border-cyber-gray text-gray-500")}>
                    {EVIDENCE_DB.find(e => e.id === b)?.name || b}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Combo Meter */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2 font-mono uppercase tracking-wider">
            <Zap size={14} /> 连击与成就
          </h3>
          <div className="p-3 border border-cyber-gray rounded-md bg-cyber-dark/50">
            <div className="flex items-center justify-between text-xs font-mono text-gray-300 mb-2">
              <span>Combo Chain</span>
              <span className="text-cyber-primary font-bold">{combo}x</span>
            </div>
            <div className="h-1 bg-cyber-black border border-cyber-gray">
              <div className="h-full bg-cyber-primary" style={{ width: `${Math.min(100, combo * 12)}%` }} />
            </div>
            {achievements.length > 0 && (
              <div className="mt-3 text-[10px] text-gray-400 font-mono">
                {achievements.map((a) => (
                  <div key={a} className="flex items-center gap-2 mb-1">
                    <ShieldAlert size={10} className="text-cyber-secondary" />
                    <span className="text-gray-300">{a}</span>
                  </div>
                ))}
              </div>
            )}
            {suggestions.length > 0 && (
              <div className="mt-3 border-t border-cyber-gray pt-2">
                <div className="text-[10px] text-gray-500 font-mono mb-1">战术建议</div>
                <div className="flex flex-col gap-1">
                  {suggestions.map((s, i) => (
                    <button 
                      key={i}
                      type="button"
                      onClick={() => setInput(s)}
                      className="text-left px-2 py-1 text-xs bg-cyber-black border border-cyber-gray hover:border-cyber-primary hover:text-cyber-primary transition-colors rounded-none"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Skills */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2 font-mono uppercase tracking-wider">
            <Zap size={14} /> 战术技能
          </h3>
          
          <div className="space-y-3">
            {/* Skill 1: Deep Scan */}
            <button 
              onClick={handleDeepScan}
              disabled={energy < 20 || gameStatus !== 'playing' || isLoading}
              className="w-full text-left group relative overflow-hidden p-0.5 rounded-lg transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyber-accent to-transparent opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-cyber-black p-3 rounded-md border border-cyber-gray group-hover:border-cyber-accent transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-cyber-accent text-sm flex items-center gap-2">
                     <Eye size={14} /> 思维截获
                  </span>
                  <div className="text-[10px] font-mono bg-cyber-accent/10 text-cyber-accent px-1.5 py-0.5 rounded border border-cyber-accent/30">-20E</div>
                </div>
                <p className="text-[10px] text-gray-500 group-hover:text-gray-300 font-mono">
                    // DEEP_SCAN_PROTOCOL<br/>
                    强制读取 AI 隐藏思维链。
                </p>
              </div>
            </button>

            {/* Skill 2: Database Hack */}
            <button 
              onClick={handleHack}
              disabled={energy < 30 || gameStatus !== 'playing' || isLoading}
              className="w-full text-left group relative overflow-hidden p-0.5 rounded-lg transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyber-primary to-transparent opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-cyber-black p-3 rounded-md border border-cyber-gray group-hover:border-cyber-primary transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-cyber-primary text-sm flex items-center gap-2">
                     <Database size={14} /> 数据库骇入
                  </span>
                  <div className="text-[10px] font-mono bg-cyber-primary/10 text-cyber-primary px-1.5 py-0.5 rounded border border-cyber-primary/30">-30E</div>
                </div>
                <p className="text-[10px] text-gray-500 group-hover:text-gray-300 font-mono">
                    // BRUTE_FORCE_ACCESS<br/>
                    暴力解锁关键证据档案。
                </p>
              </div>
            </button>

            {/* Skill 3: Logic Press */}
            <button 
              onClick={handleLogicPress}
              disabled={energy < 40 || gameStatus !== 'playing' || isLoading}
              className="w-full text-left group relative overflow-hidden p-0.5 rounded-lg transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyber-secondary to-transparent opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-cyber-black p-3 rounded-md border border-cyber-gray group-hover:border-cyber-secondary transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-cyber-secondary text-sm flex items-center gap-2">
                     <ShieldAlert size={14} /> 逻辑过载
                  </span>
                  <div className="text-[10px] font-mono bg-cyber-secondary/10 text-cyber-secondary px-1.5 py-0.5 rounded border border-cyber-secondary/30">-40E</div>
                </div>
                <p className="text-[10px] text-gray-500 group-hover:text-gray-300 font-mono">
                    // LOGIC_BOMB_INJECTION<br/>
                    强制触发语言模块崩溃。
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* Evidence */}
        <section className="flex-1">
          <h3 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2 font-mono uppercase tracking-wider">
            <FileText size={14} /> 证据链
          </h3>
          <div className="space-y-2">
            {EVIDENCE_DB.map(item => (
              <EvidenceCard 
                key={item.id}
                item={item}
                unlocked={evidenceFound.includes(item.id)}
                onInspect={handleInspectEvidence}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-black text-gray-200 font-mono">
        <div className="flex items-center gap-2 text-cyber-primary">
          <Cpu className="w-5 h-5 animate-spin" />
          正在加载页面参数...
        </div>
      </div>
    }>
      <GameInner />
    </Suspense>
  );
}
