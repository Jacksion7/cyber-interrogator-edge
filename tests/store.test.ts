import { describe, it, expect } from 'vitest';
import { useGameStore } from '@/lib/store';

describe('game store', () => {
  it('clamps stress between 0 and 100', () => {
    const { setStress } = useGameStore.getState();
    setStress(120);
    expect(useGameStore.getState().stress).toBe(100);
    setStress(-5);
    expect(useGameStore.getState().stress).toBe(0);
  });

  it('energy updates and clamps', () => {
    const { setEnergy } = useGameStore.getState();
    setEnergy(e => e - 150);
    expect(useGameStore.getState().energy).toBe(0);
    setEnergy(200);
    expect(useGameStore.getState().energy).toBe(100);
  });

  it('adds evidence without duplicates', () => {
    const { addEvidence } = useGameStore.getState();
    addEvidence('coffee');
    addEvidence('update_log');
    addEvidence('update_log');
    expect(useGameStore.getState().evidenceFound).toContain('coffee');
    expect(useGameStore.getState().evidenceFound.filter(x => x === 'update_log').length).toBe(1);
  });

  it('resets state', () => {
    const { setStress, setEnergy, addEvidence, reset } = useGameStore.getState();
    setStress(99);
    setEnergy(10);
    addEvidence('hidden_folder');
    reset();
    const s = useGameStore.getState();
    expect(s.stress).toBe(0);
    expect(s.energy).toBe(100);
    expect(s.evidenceFound).toEqual(['coffee']);
    expect(s.gameStatus).toBe('playing');
  });
});
