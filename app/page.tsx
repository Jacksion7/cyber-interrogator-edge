"use client";

import Link from "next/link";
import { Bot, Fingerprint, ScanEye, Lock, Play, RotateCcw, ChevronRight, Database } from "lucide-react";
import { LEVELS } from "@/lib/levels";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);
  const [feature, setFeature] = useState<null | "AI" | "SCAN" | "HACK" | "GUIDE">(null);
  const [booting, setBooting] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('completed_levels');
    if (saved) {
      setCompletedLevels(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (!booting) return;
    const interval = setInterval(() => setProgress(p => Math.min(p + 3, 100)), 50);
    const timer = setTimeout(() => setBooting(false), 2600);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [booting]);

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
      
      <AnimatePresence mode="wait">
        {booting && (
          <motion.div
            key="booting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,157,0.10)_0%,transparent_70%)]"></div>
            <div className="h-full w-full flex items-center justify-center">
              <motion.div 
                initial={{ scale: 0.96, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: -20, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                <div className="text-xs font-mono text-cyber-primary/70 tracking-[0.35em] uppercase">BOOT SEQUENCE</div>
                <div className="mt-1 text-[10px] font-mono text-gray-500 tracking-[0.3em]">系统初始化</div>
                <div className="mt-8 relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="w-48 h-48 rounded-full border-2 border-cyber-primary/30 shadow-[0_0_25px_rgba(0,255,157,0.2)]"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                    className="absolute inset-4 rounded-full border border-dashed border-cyber-primary/40"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl font-black text-white tracking-[0.2em]">{Math.min(progress, 100)}%</div>
                  </div>
                </div>
                <div className="mt-6 w-64 h-2 bg-gray-900 rounded overflow-hidden border border-cyber-primary/30">
                  <div 
                    className="h-full bg-cyber-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-2 text-[10px] font-mono text-cyber-primary/70">NEURAL LINK INITIALIZING</div>
                <div className="mt-8 w-72 space-y-2">
                  <motion.div 
                    animate={{ x: ["-10%", "110%"] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    className="h-6 bg-gradient-to-r from-transparent via-cyber-primary/10 to-transparent"
                  />
                  <motion.div 
                    animate={{ x: ["110%", "-10%"] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    className="h-6 bg-gradient-to-r from-transparent via-cyber-accent/10 to-transparent"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        key="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: booting ? 0 : 1 }}
        transition={{ delay: booting ? 0 : 0.4, duration: 0.8, ease: "easeOut" }}
        className="z-10 w-full max-w-7xl px-8 flex flex-col lg:flex-row gap-12 items-center lg:items-start h-full py-12"
      >
        
        {/* Left Column: Title & Status */}
        <motion.div 
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: booting ? -80 : 0, opacity: booting ? 0 : 1 }}
            transition={{ duration: 0.9, delay: booting ? 0 : 0.6, ease: "easeOut" }}
            className="flex-1 flex flex-col gap-8 text-left relative"
        >
            <div className="relative">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: booting ? 0 : "100px" }}
                    transition={{ delay: booting ? 0 : 0.9, duration: 0.6, ease: "easeOut" }}
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
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: booting ? 80 : 0, opacity: booting ? 0 : 1 }}
                transition={{ duration: 0.9, delay: booting ? 0 : 0.8, ease: "easeOut" }}
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
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: booting ? 100 : 0, opacity: booting ? 0 : 1 }}
                            transition={{ duration: 0.8, delay: booting ? 0 : (0.1 * index + 1.0), ease: "easeOut" }}
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
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: booting ? 100 : 0, opacity: booting ? 0 : 1 }}
                transition={{ duration: 0.8, delay: booting ? 0 : (0.1 * Object.keys(LEVELS).length + 1.2), ease: "easeOut" }}
                className="grid grid-cols-4 gap-4 mt-8 border-t border-gray-800 pt-6"
            >
                <FeatureMini icon={<Bot/>} label="自适应 AI" onClick={() => setFeature("AI")} />
                <FeatureMini icon={<ScanEye/>} label="神经分析" onClick={() => setFeature("SCAN")} />
                <FeatureMini icon={<Fingerprint/>} label="取证骇入" onClick={() => setFeature("HACK")} />
                <FeatureMini icon={<Play/>} label="战术指南" onClick={() => setFeature("GUIDE")} />
            </motion.div>
            
            <AnimatePresence>
              {feature && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                  onClick={() => setFeature(null)}
                >
                  <motion.div 
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-cyber-black border border-cyber-primary/40 p-6 rounded-xl max-w-xl w-full shadow-[0_0_40px_rgba(0,255,157,0.2)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xs font-mono text-cyber-primary/70">
                        {feature === "AI" && "ADAPTIVE_AI // 自适应 AI"}
                        {feature === "SCAN" && "NEURAL_ANALYSIS // 神经分析"}
                        {feature === "HACK" && "EVIDENCE_HACK // 取证骇入"}
                        {feature === "GUIDE" && "TACTICAL_GUIDE // 战术指南"}
                      </div>
                      <button className="text-xs font-mono text-gray-500 border border-gray-700 px-2 py-1 rounded-none hover:text-white" onClick={() => setFeature(null)}>关闭</button>
                    </div>
                    <div className="space-y-4 text-sm text-gray-300 font-sans">
                      {feature === "AI" && (
                        <>
                          <div className="text-white font-bold">自适应 AI</div>
                          <div className="text-gray-400">根据玩家策略动态调整心理防线，维持节奏与对抗强度。</div>
                          
                          {/* 技能预览区域 */}
                          <div className="mt-4 p-3 border border-cyber-primary/20 bg-cyber-dark/30 rounded">
                            <div className="text-xs font-mono text-cyber-primary/70 mb-2">技能预览</div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-cyber-primary/20 flex items-center justify-center text-cyber-primary border border-cyber-primary/30">
                                <Bot size={16} />
                              </div>
                              <div className="flex-1">
                                <div className="text-xs text-white font-bold">自适应响应</div>
                                <div className="text-[10px] text-gray-400">动态调整对话策略与压力阈值</div>
                              </div>
                              <div className="text-[10px] font-mono bg-cyber-primary/10 text-cyber-primary px-2 py-1 rounded border border-cyber-primary/30">被动</div>
                            </div>
                          </div>
                          
                          <div className="text-[12px] font-mono text-gray-500">进入关卡以体验自适应行为与压力阈值。</div>
                        </>
                      )}
                      {feature === "SCAN" && (
                        <>
                          <div className="text-white font-bold">神经分析</div>
                          <div className="text-gray-400">解锁思维截获，窥视真实想法，寻找逻辑漏洞。</div>
                          
                          {/* 技能预览区域 */}
                          <div className="mt-4 p-3 border border-cyber-accent/20 bg-cyber-dark/30 rounded">
                            <div className="text-xs font-mono text-cyber-accent/70 mb-2">技能预览</div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-cyber-accent/20 flex items-center justify-center text-cyber-accent border border-cyber-accent/30">
                                <ScanEye size={16} />
                              </div>
                              <div className="flex-1">
                                <div className="text-xs text-white font-bold">思维截获</div>
                                <div className="text-[10px] text-gray-400">读取目标真实想法与逻辑漏洞</div>
                              </div>
                              <div className="text-[10px] font-mono bg-cyber-accent/10 text-cyber-accent px-2 py-1 rounded border border-cyber-accent/30">-20E</div>
                            </div>
                          </div>
                          
                          <div className="text-[12px] font-mono text-gray-500">在关卡中使用“思维截获”技能开始分析。</div>
                        </>
                      )}
                      {feature === "HACK" && (
                        <>
                          <div className="text-white font-bold">取证骇入</div>
                          <div className="text-gray-400">数据库强制解锁关键证据，补全证据链。</div>
                          
                          {/* 技能预览区域 */}
                          <div className="mt-4 p-3 border border-cyber-primary/20 bg-cyber-dark/30 rounded">
                            <div className="text-xs font-mono text-cyber-primary/70 mb-2">技能预览</div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-cyber-primary/20 flex items-center justify-center text-cyber-primary border border-cyber-primary/30">
                                <Database size={16} />
                              </div>
                              <div className="flex-1">
                                <div className="text-xs text-white font-bold">数据库骇入</div>
                                <div className="text-[10px] text-gray-400">暴力解锁加密证据档案</div>
                              </div>
                              <div className="text-[10px] font-mono bg-cyber-primary/10 text-cyber-primary px-2 py-1 rounded border border-cyber-primary/30">-30E</div>
                            </div>
                          </div>
                          
                          <div className="text-[12px] font-mono text-gray-500">在关卡中使用“数据库骇入”技能暴力开路。</div>
                        </>
                      )}
                      {feature === "GUIDE" && (
                        <>
                          <div className="text-white font-bold">战术指南</div>
                          <div className="text-gray-400">掌握能量、压力与组合技的时机，形成节奏压制。</div>
                          
                          {/* 技能预览区域 */}
                          <div className="mt-4 p-3 border border-cyber-secondary/20 bg-cyber-dark/30 rounded">
                            <div className="text-xs font-mono text-cyber-secondary/70 mb-2">组合技预览</div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-cyber-accent/20 flex items-center justify-center text-cyber-accent border border-cyber-accent/30 text-xs">1</div>
                                <div className="text-[10px] text-gray-400">思维截获 → 发现漏洞</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-cyber-primary/20 flex items-center justify-center text-cyber-primary border border-cyber-primary/30 text-xs">2</div>
                                <div className="text-[10px] text-gray-400">数据库骇入 → 解锁证据</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-cyber-secondary/20 flex items-center justify-center text-cyber-secondary border border-cyber-secondary/30 text-xs">3</div>
                                <div className="text-[10px] text-gray-400">逻辑过载 → 强制崩溃</div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="mt-5 flex items-center justify-end gap-2">
                      <Link 
                        href={`/game?level=${Object.values(LEVELS)[0].id}`}
                        className="px-4 py-2 bg-cyber-primary text-black font-bold text-sm rounded border border-cyber-primary hover:bg-cyber-primary/80 transition-colors"
                        onClick={() => setFeature(null)}
                      >
                        立即进入
                      </Link>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
        </div>

      </motion.div>
    </main>
  );
}

function FeatureMini({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
    return (
        <motion.button 
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={onClick}
          className="flex flex-col items-center gap-2 text-gray-500 hover:text-cyber-primary transition-colors cursor-pointer group"
        >
            <motion.div 
              initial={{ rotate: 0 }}
              whileHover={{ rotate: -5 }}
              className="p-2 rounded-full bg-gray-900 group-hover:bg-cyber-primary/20 transition-colors"
            >
                {icon}
            </motion.div>
            <span className="text-[10px] uppercase tracking-wider font-mono">{label}</span>
        </motion.button>
    )
}
