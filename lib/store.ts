import { create } from 'zustand';

interface GameState {
  stress: number;
  energy: number; // New: Action Points
  evidenceFound: string[];
  gameStatus: 'playing' | 'won' | 'lost';
  combo: number;
  achievements: string[];
  trust: number;
  suspicion: number;
  decisions: string[];
  objective: string | null;
  suggestionHistory: string[];
  lastLogicOverloadAt: number | null;
  logicCooldownMs: number;
  nodeGraph: { id: string; type: 'EVIDENCE' | 'SKILL' | 'NODE' | 'SYSTEM'; label: string; ts: number }[];
  
  setStress: (stress: number | ((prev: number) => number)) => void;
  setEnergy: (energy: number | ((prev: number) => number)) => void;
  addEvidence: (id: string) => void;
  setGameStatus: (status: 'playing' | 'won' | 'lost') => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  grantAchievement: (id: string) => void;
  addDecision: (d: string) => void;
  setObjective: (o: string | null) => void;
  addSuggestionHistory: (s: string) => void;
  setLastLogicOverloadAt: (ts: number | null) => void;
  addNodeEntry: (entry: { id: string; type: 'EVIDENCE' | 'SKILL' | 'NODE' | 'SYSTEM'; label: string }) => void;
  setArchiveView: (payload: { decisions: string[]; suggestionHistory: string[]; nodeGraph: { id: string; type: 'EVIDENCE' | 'SKILL' | 'NODE' | 'SYSTEM'; label: string; ts: number }[]; objective: string | null }) => void;
  resetWith: (initialEvidence: string[]) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  stress: 0,
  energy: 100, // Max 100
  evidenceFound: ['coffee'], // Start with coffee
  gameStatus: 'playing',
  combo: 0,
  achievements: [],
  trust: 0,
  suspicion: 0,
  decisions: [],
  objective: null,
  suggestionHistory: [],
  lastLogicOverloadAt: null,
  logicCooldownMs: 15000,
  nodeGraph: [],

  setStress: (updater) => set((state) => ({
    stress: typeof updater === 'function' ? Math.min(100, Math.max(0, updater(state.stress))) : Math.min(100, Math.max(0, updater))
  })),
  setEnergy: (updater) => set((state) => ({ 
    energy: typeof updater === 'function' ? Math.min(100, Math.max(0, updater(state.energy))) : Math.min(100, Math.max(0, updater))
  })),
  addEvidence: (id) => set((state) => ({ 
    evidenceFound: state.evidenceFound.includes(id) ? state.evidenceFound : [...state.evidenceFound, id] 
  })),
  setGameStatus: (gameStatus) => set({ gameStatus }),
  incrementCombo: () => set((state) => ({ combo: Math.min(9, state.combo + 1) })),
  resetCombo: () => set({ combo: 0 }),
  grantAchievement: (id) => set((state) => ({ 
    achievements: state.achievements.includes(id) ? state.achievements : [...state.achievements, id] 
  })),
  addDecision: (d) => set((state) => ({ decisions: [...state.decisions, d] })),
  setObjective: (o) => set({ objective: o }),
  addSuggestionHistory: (s) => set((state) => ({ suggestionHistory: [...state.suggestionHistory, s] })),
  setLastLogicOverloadAt: (ts) => set({ lastLogicOverloadAt: ts }),
  addNodeEntry: (entry) => set((state) => ({ nodeGraph: [...state.nodeGraph, { ...entry, ts: Date.now() }] })),
  setArchiveView: (payload) => set({ decisions: payload.decisions, suggestionHistory: payload.suggestionHistory, nodeGraph: payload.nodeGraph, objective: payload.objective }),
  resetWith: (initialEvidence) => set({ stress: 0, energy: 100, evidenceFound: initialEvidence, gameStatus: 'playing', combo: 0, achievements: [], trust: 0, suspicion: 0, decisions: [], objective: null, suggestionHistory: [], lastLogicOverloadAt: null, nodeGraph: [] }),
  reset: () => set({ stress: 0, energy: 100, evidenceFound: ['coffee'], gameStatus: 'playing', combo: 0, achievements: [], trust: 0, suspicion: 0, decisions: [], objective: null, suggestionHistory: [], lastLogicOverloadAt: null, nodeGraph: [] }),
}));
