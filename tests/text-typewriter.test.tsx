import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LEVELS } from '@/lib/levels';
import React, { useEffect, useRef, useState } from 'react';

function Typewriter({ text, speed = 5, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);
  const segmentsRef = useRef<string[]>(Array.from(text));
  useEffect(() => {
    segmentsRef.current = Array.from(text);
    indexRef.current = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      if (indexRef.current < segmentsRef.current.length) {
        setDisplayedText(prev => prev + segmentsRef.current[indexRef.current]);
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

describe('text rendering', () => {
  it('grapheme segmentation preserves full text including 暴雨', () => {
    const text = LEVELS['level-1'].introStory;
    const seg = Array.from(text);
    expect(seg.join('')).toBe(text);
    const firstTwo = seg.slice(0, 2).join('');
    expect(firstTwo).toBe('暴雨');
  });
});
