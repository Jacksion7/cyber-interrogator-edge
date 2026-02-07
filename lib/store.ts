import { create } from 'zustand';

interface GameState {
  stress: number;
  energy: number; // New: Action Points
  evidenceFound: string[];
  gameStatus: 'playing' | 'won' | 'lost';
  
  setStress: (stress: number | ((prev: number) => number)) => void;
  setEnergy: (energy: number | ((prev: number) => number)) => void;
  addEvidence: (id: string) => void;
  setGameStatus: (status: 'playing' | 'won' | 'lost') => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  stress: 0,
  energy: 100, // Max 100
  evidenceFound: ['coffee'], // Start with coffee
  gameStatus: 'playing',

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
  reset: () => set({ stress: 0, energy: 100, evidenceFound: ['coffee'], gameStatus: 'playing' }),
}));
