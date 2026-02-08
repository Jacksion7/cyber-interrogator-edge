"use client";

import Link from "next/link";
import { Bot, Fingerprint, ScanEye, Lock, Play, RotateCcw, ChevronRight, Terminal as TerminalIcon } from "lucide-react";
import { LEVELS } from "@/lib/levels";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('completed_levels');
    if (saved) {
      setCompletedLevels(JSON.parse(saved));
    }
  }, []);

  const resetProgress = () => {
      if (confirm("确定要重置所有游戏进度吗？这将锁定所有已完成的关卡。")) {
          localStorage.removeItem('completed_levels');
          setCompletedLevels([]);
      }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black relative overflow-hidden text-gray-200 font-sans selection:bg-cyber-primary/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,157,0.12)_0%,transparent_70%)] opacity-40"></div>
         <div className="scanlines"></div>
         {/* Moving Grid */}
         <motion.div 
            animate={{ backgroundPosition: ["0px 0px", "40px 40px"] }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute inset-0 bg-grid-pattern opacity-20"
         />
      </div>
      
      <div className="z-10 w-full max-w-7xl px-8 flex flex-col lg:flex-row gap-12 items-center lg:items-start h-full py-12">
        
        {/* Left Column: Title & Status */}
        <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex-1 flex flex-col gap-8 text-left relative"
        >
            <div className="relative">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100px" }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="h-1 bg-cyber-primary mb-6 shadow-[0_0_15px_#00ff9d]"
                />
                <h1 className="text-7xl lg:text-8xl font-black text-white tracking-tighter leading-none mb-2 mix-blend-screen">
                    CYBER<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary to-cyber-accent">INTERROGATOR</span>
                </h1>
                <div className="text-2xl text-cyber-accent font-mono tracking-[0.2em] uppercase opacity-80">
                    赛博审讯室
                </div>
            </div>

            <div className="space-y-6 max-w-lg border-l-2 border-cyber-gray pl-6 py-2">
                <p className="text-lg text-gray-400 leading-relaxed">
                    <strong className="text-white block mb-2">年份：2077 // 地点：新巴比伦</strong>
                    图灵测试已成为死刑判决。作为首席调查员，你的任务是审讯失控的 AI，在它们的逻辑迷宫中寻找破绽，击溃其心理防线。
                </p>
                <div className="flex gap-4 text-xs font-mono text-cyber-primary/60">
                    <span className="border border-cyber-primary/20 px-2 py-1 rounded">v2.4.0-STABLE</span>
                    <span className="border border-cyber-primary/20 px-2 py-1 rounded">SECURE_LINK</span>
                </div>
            </div>

             {/* Reset Progress Button */}
             {completedLevels.length > 0 && (
                <button 
                    onClick={resetProgress}
                    className="self-start mt-4 flex items-center gap-2 text-xs text-cyber-secondary hover:text-white transition-all border border-cyber-secondary/30 bg-cyber-secondary/5 px-4 py-2 hover:bg-cyber-secondary/20 uppercase tracking-widest"
                >
                    <RotateCcw size={14} /> 重置系统进度
                </button>
            )}
        </motion.div>

        {/* Right Column: Level Selector (Dossier Style) */}
        <div className="flex-1 w-full max-w-2xl flex flex-col gap-6">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs font-mono text-gray-500 mb-2 flex justify-between items-end border-b border-gray-800 pb-2"
            >
                <span>AVAILABLE_CASES // 待处理案件</span>
                <span>{completedLevels.length} / {Object.keys(LEVELS).length} COMPLETED</span>
            </motion.div>

            <div className="space-y-4">
                {Object.values(LEVELS).map((level, index) => {
                    const isUnlocked = index === 0 || completedLevels.includes(Object.keys(LEVELS)[index - 1]);
                    const isCompleted = completedLevels.includes(level.id);
                    const isHovered = hoveredLevel === level.id;

                    return (
                        <motion.div
                            key={level.id}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 * index + 0.5 }}
                        >
                            <Link 
                                href={isUnlocked ? `/game?level=${level.id}` : "#"}
                                onMouseEnter={() => setHoveredLevel(level.id)}
                                onMouseLeave={() => setHoveredLevel(null)}
                                className={`group relative block transition-all duration-500 ${
                                    isUnlocked ? "cursor-pointer" : "cursor-not-allowed opacity-50 grayscale"
                                }`}
                            >
                                {/* Card Container */}
                                <div className={`
                                    relative p-6 border-l-4 transition-all duration-300 overflow-hidden border-scan
                                    ${isUnlocked 
                                        ? "bg-cyber-dark/40 border-l-cyber-primary hover:bg-cyber-dark/80 hover:border-l-cyber-primary" 
                                        : "bg-gray-900/20 border-l-gray-700"
                                    }
                                    ${isHovered && isUnlocked ? "translate-x-2 shadow-[0_0_35px_rgba(0,255,157,0.25)]" : ""}
                                `}>
                                    {/* Animated Background Highlight */}
                                    {isHovered && isUnlocked && (
                                        <motion.div 
                                            layoutId="highlight"
                                            className="absolute inset-0 bg-gradient-to-r from-cyber-primary/10 to-transparent z-0"
                                        />
                                    )}

                                    <div className="relative z-10 flex justify-between items-center">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                                                    isCompleted 
                                                        ? "bg-cyber-primary text-black" 
                                                        : isUnlocked ? "bg-cyber-accent/20 text-cyber-accent" : "bg-gray-800 text-gray-500"
                                                }`}>
                                                    {isCompleted ? "已结案" : isUnlocked ? "调查中" : "权限锁定"}
                                                </span>
                                                <span className="text-[10px] font-mono text-gray-600">
                                                    CASE_ID: {level.id.toUpperCase()}
                                                </span>
                                            </div>
                                            
                                            <h3 className={`text-2xl font-bold mb-1 uppercase italic tracking-tight transition-colors ${
                                                isHovered && isUnlocked ? "text-white" : "text-gray-300"
                                            }`}>
                                                {level.title.split('：')[0]}
                                            </h3>
                                            <div className="text-sm text-cyber-primary/60 font-mono mb-3">
                                                {level.title.split('：')[1]}
                                            </div>
                                            
                                            {/* Description - Expand on Hover */}
                                            <motion.div 
                                                initial={false}
                                                animate={{ height: isHovered && isUnlocked ? "auto" : "0px", opacity: isHovered && isUnlocked ? 1 : 0 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="text-gray-400 text-sm py-2 leading-relaxed border-t border-gray-800/50">
                                                    {level.description}
                                                </p>
                                            </motion.div>
                                        </div>

                                        {/* Right Icon */}
                                        <div className={`ml-6 p-3 border rounded-sm transition-all duration-300 ${
                                            isHovered && isUnlocked 
                                                ? "border-cyber-primary text-cyber-primary rotate-0 bg-cyber-primary/10 shadow-[0_0_20px_rgba(0,255,157,0.3)]" 
                                                : "border-gray-800 text-gray-600 rotate-45 bg-transparent"
                                        }`}>
                                            {isUnlocked ? <ChevronRight size={24} /> : <Lock size={24} />}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

             {/* Features Grid - Small */}
            <div className="grid grid-cols-3 gap-4 mt-8 border-t border-gray-800 pt-6">
                <FeatureMini icon={<Bot/>} label="自适应 AI" />
                <FeatureMini icon={<ScanEye/>} label="神经分析" />
                <FeatureMini icon={<Fingerprint/>} label="取证骇入" />
            </div>
            
            <Link 
              href={`/game?level=${Object.values(LEVELS)[0].id}`}
              className="group relative block mt-6"
            >
              <div className="relative p-6 border-l-4 bg-cyber-dark/30 border-l-cyber-primary hover:bg-cyber-dark/60 transition-all overflow-hidden border-scan shadow-[0_0_20px_rgba(0,255,157,0.1)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono text-cyber-primary/70">TACTICAL_GUIDE // 战术指南</div>
                    <h3 className="text-xl font-bold text-white mt-1">如何击溃 AI 的心理防线</h3>
                    <p className="text-sm text-gray-400 mt-2">
                      • 能量管理：聊天 -5E；技能 -20/-30/-40E。保持节奏。<br/>
                      • 压力推进：证据+提问，逼近 90+ 触发崩溃与口供。<br/>
                      • 组合技：思维截获 → 休息/安抚 → 骇入 → 过载。
                    </p>
                  </div>
                  <div className="ml-6 p-3 border rounded-sm border-cyber-primary text-cyber-primary bg-cyber-primary/10 transition-all group-hover:shadow-[0_0_20px_rgba(0,255,157,0.3)]">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </div>
            </Link>
        </div>

      </div>
    </main>
  );
}

function FeatureMini({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="flex flex-col items-center gap-2 text-gray-500 hover:text-cyber-primary transition-colors cursor-default group">
            <div className="p-2 rounded-full bg-gray-900 group-hover:bg-cyber-primary/20 transition-colors">
                {icon}
            </div>
            <span className="text-[10px] uppercase tracking-wider font-mono">{label}</span>
        </div>
    )
}
