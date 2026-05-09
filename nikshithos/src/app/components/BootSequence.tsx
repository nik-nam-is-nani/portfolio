'use client';
import React, { useEffect, useRef, useState } from 'react';

interface Props { onComplete: () => void; }

const BOOT_LINES = [
  { text: 'NIKSHITHOS v1.0.0 — INITIALIZING...', delay: 0, color: '#00E5FF' },
  { text: 'Copyright (c) 2026 Nikshith Kyatherigi. All rights reserved.', delay: 180, color: '#71717A' },
  { text: '', delay: 300 },
  { text: '[  OK  ] Loading neural subsystems...', delay: 420, color: '#00E5FF' },
  { text: '[  OK  ] Mounting PyTorch kernel v2.4.1...', delay: 600, color: '#00E5FF' },
  { text: '[  OK  ] Starting multi-agent RL environment...', delay: 800, color: '#00E5FF' },
  { text: '[  OK  ] Initializing LLM fine-tuning protocols...', delay: 1000, color: '#00E5FF' },
  { text: '[  OK  ] Loading Qwen2.5-7B model weights...', delay: 1200, color: '#00E5FF' },
  { text: '[  OK  ] GRPO optimization engine ready.', delay: 1380, color: '#00E5FF' },
  { text: '[  OK  ] Crisis triage arena: 4 agents online.', delay: 1540, color: '#A855F7' },
  { text: '[  OK  ] JSON parse rate: 98.6% — nominal.', delay: 1700, color: '#A855F7' },
  { text: '[  OK  ] Urban MCI command center: ACTIVE.', delay: 1860, color: '#FF6B2B' },
  { text: '[  OK  ] Meta PyTorch × Scaler credentials: VERIFIED.', delay: 2020, color: '#FF6B2B' },
  { text: '', delay: 2200 },
  { text: 'IDENTITY: Nikshith Kyatherigi', delay: 2300, color: '#00E5FF' },
  { text: 'LOCATION: Kurnool, Andhra Pradesh, India', delay: 2440, color: '#71717A' },
  { text: 'ROLE: AI/ML Engineer · Multi-Agent RL Builder', delay: 2580, color: '#71717A' },
  { text: '', delay: 2720 },
  { text: '>>> BOOT SEQUENCE COMPLETE. LAUNCHING PORTFOLIO...', delay: 2820, color: '#00E5FF' },
];

export default function BootSequence({ onComplete }: Props) {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCtx = useRef<AudioContext | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const playTone = (freq: number, duration: number, vol = 0.08) => {
    if (!audioEnabled || !audioCtx.current) return;
    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  };

  const toggleAudio = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    setAudioEnabled(prev => !prev);
  };

  useEffect(() => {
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, i]);
        if (audioEnabled && line.text && Math.random() > 0.4) {
          playTone(200 + Math.random() * 400, 0.05);
        }
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, line.delay);
    });

    const lastDelay = BOOT_LINES[BOOT_LINES.length - 1].delay;
    setTimeout(onComplete, lastDelay + 600);
  }, []);

  return (
    <div className="boot-screen" ref={containerRef}>
      <div className="fixed top-4 right-4 z-[99999]">
        <button
          onClick={toggleAudio}
          className="font-mono text-[10px] tracking-widest border px-3 py-1.5 transition-colors"
          style={{
            borderColor: audioEnabled ? '#00E5FF' : '#27272A',
            color: audioEnabled ? '#00E5FF' : '#71717A',
            background: 'rgba(3,3,3,0.9)'
          }}
        >
          {audioEnabled ? '◉ AUDIO ON' : '○ AUDIO OFF'}
        </button>
      </div>

      <div className="mb-8">
        <div className="font-display text-4xl font-black tracking-widest" style={{ color: '#00E5FF' }}>
          NIKSHITH<span style={{ color: '#FF6B2B' }}>OS</span>
        </div>
        <div className="font-mono text-[10px] tracking-[0.4em] mt-1" style={{ color: '#71717A' }}>
          PERSONAL OPERATING SYSTEM v1.0.0
        </div>
      </div>

      <div className="w-full max-w-3xl space-y-0.5 overflow-y-auto" style={{ maxHeight: '60vh' }}>
        {BOOT_LINES.map((line, i) => (
          <div
            key={i}
            className="boot-line font-mono text-sm leading-relaxed"
            style={{
              animationDelay: `${line.delay}ms`,
              color: visibleLines.includes(i) ? (line.color || '#71717A') : 'transparent',
              minHeight: line.text ? undefined : '0.75rem',
            }}
          >
            {line.text}
          </div>
        ))}
      </div>

      <div className="mt-8 font-mono text-xs" style={{ color: '#27272A' }}>
        Press any key to skip...
      </div>
    </div>
  );
}